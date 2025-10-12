const express = require('express');
const {
    Driver,
    QuizSession,
    Question,
    QuizResponse
} = require('../models');
const {
    sendLocalizedResponse
} = require('../utils/responseMessages');
const router = express.Router();

// Get today's quiz session for a driver
router.get('/session/:driverId', async (req, res, next) => {
    try {
        const {
            driverId
        } = req.params;

        // Verify driver exists
        const driver = await Driver.findByPk(driverId);
        if (!driver) {
            return sendLocalizedResponse(res, 404, 'driver.not_found', null, req.userLanguage);
        }

        // Get or create today's session
        let session = await QuizSession.getTodaysSession(driverId);

        if (!session) {
            session = await QuizSession.createTodaysSession(driverId);
        }

        // Get session responses if any
        const responses = await QuizResponse.getSessionResponses(session.id);

        const responseData = {
            session: {
                id: session.id,
                driver_id: session.driver_id,
                quiz_date: session.quiz_date,
                completed: session.completed,
                total_questions: session.total_questions,
                total_correct: session.total_correct,
                score: session.calculateScore()
            },
            responses: responses.map(response => ({
                id: response.id,
                question_id: response.question_id,
                selected_option: response.selected_option,
                correct: response.correct,
                answered_at: response.answered_at
            }))
        };

        return sendLocalizedResponse(res, 200, 'api.success', responseData, req.userLanguage);
    } catch (error) {
        next(error);
    }
});

// Start a new quiz (get questions)
router.post('/start/:driverId', async (req, res, next) => {
    try {
        const {
            driverId
        } = req.params;
        const {
            topic,
            count = 5,
            language
        } = req.body;

        // Use language from request, driver preference, or detected language
        const quizLanguage = language || req.userLanguage || 'en';

        if (!isLanguageSupported(quizLanguage)) {
            return sendLocalizedResponse(res, 400, 'api.validation_error', {
                field: 'language',
                message: 'Unsupported language'
            }, req.userLanguage);
        }

        // Verify driver exists
        const driver = await Driver.findByPk(driverId);
        if (!driver) {
            return sendLocalizedResponse(res, 404, 'driver.not_found', null, req.userLanguage);
        }

        // Check if driver already has a completed session today
        const existingSession = await QuizSession.getTodaysSession(driverId);
        if (existingSession && existingSession.completed) {
            return sendLocalizedResponse(res, 400, 'quiz.already_completed', null, req.userLanguage);
        }

        // Get random questions
        const questions = await Question.getRandomQuestions(count, quizLanguage, topic);

        if (questions.length === 0) {
            return sendLocalizedResponse(res, 404, 'quiz.no_questions', null, req.userLanguage);
        }

        // Format questions for client (without correct answers)
        const formattedQuestions = questions.map(question => ({
            id: question.id,
            question_text: question.getQuestionText(),
            options: question.getOptions(),
            topic: question.topic
        }));

        const responseData = {
            questions: formattedQuestions,
            session_id: existingSession ? existingSession.id : null,
            language: quizLanguage
        };

        return sendLocalizedResponse(res, 200, 'api.success', responseData, req.userLanguage);
    } catch (error) {
        next(error);
    }
});

// Submit quiz answer
router.post('/answer', async (req, res, next) => {
    try {
        const {
            session_id,
            question_id,
            selected_option
        } = req.body;

        if (!session_id || !question_id || selected_option === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Session ID, question ID, and selected option are required'
            });
        }

        // Get session
        const session = await QuizSession.findByPk(session_id, {
            include: [{
                model: Driver,
                as: 'driver'
            }]
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Quiz session not found'
            });
        }

        if (session.completed) {
            return res.status(400).json({
                success: false,
                message: 'Quiz session already completed'
            });
        }

        // Get question
        const question = await Question.findByPk(question_id);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Check if already answered
        const existingResponse = await QuizResponse.findOne({
            where: {
                quiz_session_id: session_id,
                question_id: question_id
            }
        });

        if (existingResponse) {
            return res.status(400).json({
                success: false,
                message: 'Question already answered'
            });
        }

        // Check if answer is correct
        const isCorrect = question.isCorrectAnswer(selected_option);

        // Add response to session
        await session.addResponse(question_id, selected_option, isCorrect);

        res.json({
            success: true,
            message: 'Answer submitted successfully',
            data: {
                correct: isCorrect,
                correct_option: question.correct_option,
                explanation: question.getExplanation(),
                session_stats: {
                    total_questions: session.total_questions,
                    total_correct: session.total_correct,
                    score: session.calculateScore()
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Complete quiz session
router.post('/complete/:sessionId', async (req, res, next) => {
    try {
        const {
            sessionId
        } = req.params;

        const session = await QuizSession.findByPk(sessionId, {
            include: [{
                    model: Driver,
                    as: 'driver'
                },
                {
                    model: QuizResponse,
                    as: 'responses',
                    include: [{
                        model: Question,
                        as: 'question'
                    }]
                }
            ]
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Quiz session not found'
            });
        }

        if (session.completed) {
            return res.status(400).json({
                success: false,
                message: 'Quiz session already completed'
            });
        }

        // Complete the session
        await session.complete();

        // Get updated driver stats
        await session.driver.reload();

        res.json({
            success: true,
            message: 'Quiz completed successfully',
            data: {
                session: {
                    id: session.id,
                    completed: session.completed,
                    total_questions: session.total_questions,
                    total_correct: session.total_correct,
                    score: session.calculateScore(),
                    passing: session.isPassing()
                },
                driver_stats: {
                    total_quizzes: session.driver.total_quizzes,
                    total_correct: session.driver.total_correct,
                    streak: session.driver.streak,
                    accuracy: session.driver.calculateAccuracy()
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get quiz history for a driver
router.get('/history/:driverId', async (req, res, next) => {
    try {
        const {
            driverId
        } = req.params;
        const {
            limit = 10, offset = 0
        } = req.query;

        // Verify driver exists
        const driver = await Driver.findByPk(driverId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        const sessions = await QuizSession.findAndCountAll({
            where: {
                driver_id: driverId,
                completed: true
            },
            order: [
                ['quiz_date', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [{
                model: QuizResponse,
                as: 'responses',
                include: [{
                    model: Question,
                    as: 'question'
                }]
            }]
        });

        const formattedSessions = sessions.rows.map(session => ({
            id: session.id,
            quiz_date: session.quiz_date,
            total_questions: session.total_questions,
            total_correct: session.total_correct,
            score: session.calculateScore(),
            passing: session.isPassing(),
            responses: session.responses.map(response => ({
                question_id: response.question_id,
                selected_option: response.selected_option,
                correct: response.correct
            }))
        }));

        res.json({
            success: true,
            data: {
                sessions: formattedSessions,
                total: sessions.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
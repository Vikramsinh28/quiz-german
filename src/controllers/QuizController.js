const QuizService = require('../services/QuizService');
const QuestionService = require('../services/QuestionService');
const {
    sendLocalizedResponse
} = require('../utils/responseMessages');
const { Driver, QuizSession } = require('../models');

class QuizController {
    /**
     * Get quiz session for driver
     */
    static async getQuizSession(req, res, next) {
        try {
            const {
                driverId
            } = req.params;
            const {
                language = 'en'
            } = req.query;

            const quizLanguage = language || req.userLanguage || 'en';

            // Check if driver can take quiz today
            const canTakeQuiz = await QuizService.canTakeQuizToday(driverId);
            if (!canTakeQuiz) {
                return sendLocalizedResponse(res, 400, 'quiz.already_completed', null, req.userLanguage);
            }

            // Get or create today's session
            let session = await QuizService.getTodaysSession(driverId);
            if (!session) {
                session = await QuizService.createTodaysSession(driverId);
            }

            // Get random questions
            const questions = await QuestionService.getRandomQuestions(5, quizLanguage);

            if (questions.length === 0) {
                return sendLocalizedResponse(res, 404, 'quiz.no_questions', null, req.userLanguage);
            }

            // Format questions for client (without correct answers)
            const formattedQuestions = questions.map(question => ({
                id: question.id,
                question_text: question.getQuestionText(quizLanguage),
                options: question.getOptions(quizLanguage),
                topic: question.topic
            }));

            const responseData = {
                questions: formattedQuestions,
                session_id: session.id,
                language: quizLanguage
            };

            return sendLocalizedResponse(res, 200, 'api.success', responseData, req.userLanguage);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Start quiz session
     */
    static async startQuiz(req, res, next) {
        try {
            const {
                driverId
            } = req.params;
            const {
                language = 'en'
            } = req.body;

            const quizLanguage = language || req.userLanguage || 'en';

            // Check if driver can take quiz today
            const canTakeQuiz = await QuizService.canTakeQuizToday(driverId);
            if (!canTakeQuiz) {
                return sendLocalizedResponse(res, 400, 'quiz.already_completed', null, req.userLanguage);
            }

            // Get random questions
            const questions = await QuestionService.getRandomQuestions(5, quizLanguage);

            if (questions.length === 0) {
                return sendLocalizedResponse(res, 404, 'quiz.no_questions', null, req.userLanguage);
            }

            // Start quiz session
            const session = await QuizService.startQuiz(driverId, questions);

            // Format questions for client (without correct answers)
            const formattedQuestions = questions.map(question => ({
                id: question.id,
                question_text: question.getQuestionText(quizLanguage),
                options: question.getOptions(quizLanguage),
                topic: question.topic
            }));

            const responseData = {
                session_id: session.id,
                questions: formattedQuestions,
                language: quizLanguage
            };

            return sendLocalizedResponse(res, 200, 'api.success', responseData, req.userLanguage);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Submit answer
     */
    static async submitAnswer(req, res, next) {
        try {
            const {
                session_id,
                question_id,
                selected_option
            } = req.body;

            if (!session_id || question_id === undefined || selected_option === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Session ID, question ID, and selected option are required'
                });
            }

            const result = await QuizService.submitAnswer(session_id, question_id, selected_option);

            res.json({
                success: true,
                message: 'Answer submitted successfully',
                data: result
            });
        } catch (error) {
            if (error.message === 'Quiz session not found' || error.message === 'Question not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * Complete quiz
     */
    static async completeQuiz(req, res, next) {
        try {
            const {
                sessionId
            } = req.params;

            const session = await QuizService.completeQuiz(sessionId);

            // Get driver and update profile statistics
            const driver = await Driver.findByPk(session.driver_id);
            
            if (driver) {
                // Recalculate and update driver statistics from actual quiz sessions
                // This is the single source of truth for driver stats
                await driver.recalculateStats();
                
                // Reload driver to get updated stats
                await driver.reload();

                // Calculate accuracy using the driver's built-in method
                const accuracy = driver.calculateAccuracy();

                res.json({
                    success: true,
                    message: 'Quiz completed successfully',
                    data: {
                        session_id: session.id,
                        total_questions: session.total_questions,
                        total_correct: session.total_correct,
                        score: session.calculateScore(),
                        completed: session.completed,
                        driver_profile: {
                            total_quizzes: driver.total_quizzes,
                            total_correct: driver.total_correct,
                            total_questions: driver.total_questions,
                            accuracy: accuracy,
                            streak: driver.streak,
                            last_quiz_date: driver.last_quiz_date
                        }
                    }
                });
            } else {
                res.json({
                    success: true,
                    message: 'Quiz completed successfully',
                    data: {
                        session_id: session.id,
                        total_questions: session.total_questions,
                        total_correct: session.total_correct,
                        score: session.calculateScore(),
                        completed: session.completed
                    }
                });
            }
        } catch (error) {
            if (error.message === 'Quiz session not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * Get quiz history for driver
     */
    static async getQuizHistory(req, res, next) {
        try {
            const {
                driverId
            } = req.params;
            const {
                limit = 20,
                    offset = 0
            } = req.query;

            const history = await QuizService.getQuizHistory(driverId, {
                limit,
                offset
            });

            const formattedHistory = history.rows.map(session => ({
                id: session.id,
                quiz_date: session.quiz_date,
                total_questions: session.total_questions,
                total_correct: session.total_correct,
                score: session.calculateScore(),
                completed: session.completed,
                created_at: session.created_at
            }));

            res.json({
                success: true,
                data: {
                    sessions: formattedHistory,
                    total: history.count,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get quiz session details
     */
    static async getQuizSessionDetails(req, res, next) {
        try {
            const {
                sessionId
            } = req.params;

            const session = await QuizService.getQuizSessionById(sessionId);
            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz session not found'
                });
            }

            const responses = await QuizService.getQuizResponses(sessionId);

            res.json({
                success: true,
                data: {
                    session: {
                        id: session.id,
                        driver_id: session.driver_id,
                        quiz_date: session.quiz_date,
                        total_questions: session.total_questions,
                        total_correct: session.total_correct,
                        score: session.calculateScore(),
                        completed: session.completed,
                        created_at: session.created_at
                    },
                    responses: responses.map(response => ({
                        id: response.id,
                        question_id: response.question_id,
                        selected_option: response.selected_option,
                        correct: response.correct,
                        answered_at: response.answered_at
                    }))
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get driver statistics
     */
    static async getDriverStats(req, res, next) {
        try {
            const {
                driverId
            } = req.params;

            const stats = await QuizService.getDriverStats(driverId);
            if (!stats) {
                return res.status(404).json({
                    success: false,
                    message: 'Driver not found'
                });
            }

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get daily quiz for authenticated driver
     */
    static async getDailyQuiz(req, res, next) {
        try {
            const firebaseUid = req.firebaseUser.uid;
            const language = req.userLanguage || 'en';

            // Get driver by Firebase UID
            const driver = await QuizService.getDriverByFirebaseUid(firebaseUid);
            if (!driver) {
                return res.status(404).json({
                    success: false,
                    message: 'Driver not found'
                });
            }

            // Check if driver can take quiz today
            const canTakeQuiz = await QuizService.canTakeQuizToday(driver.id);
            if (!canTakeQuiz) {
                return res.status(400).json({
                    success: false,
                    message: 'Quiz already completed today'
                });
            }

            // Get or create today's session
            let session = await QuizService.getTodaysSession(driver.id);
            if (!session) {
                session = await QuizService.createTodaysSession(driver.id);
            }

            // Get random questions
            const questions = await QuestionService.getRandomQuestions(5, language);

            if (questions.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No questions available'
                });
            }

            // Format questions for client (without correct answers)
            const formattedQuestions = questions.map(question => ({
                id: question.id,
                question_text: question.getQuestionText(language),
                options: question.getOptions(language),
                topic: question.topic
            }));

            res.json({
                success: true,
                data: {
                    questions: formattedQuestions,
                    session_id: session.id,
                    language: language
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Submit daily quiz answer for authenticated driver
     */
    static async submitDailyQuizAnswer(req, res, next) {
        try {
            const firebaseUid = req.firebaseUser.uid;
            const {
                question_id,
                selected_option
            } = req.body;

            if (!question_id || selected_option === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Question ID and selected option are required'
                });
            }

            // Get driver by Firebase UID
            const driver = await QuizService.getDriverByFirebaseUid(firebaseUid);
            if (!driver) {
                return res.status(404).json({
                    success: false,
                    message: 'Driver not found'
                });
            }

            // Get today's session
            const session = await QuizService.getTodaysSession(driver.id);
            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'No active quiz session found'
                });
            }

            const result = await QuizService.submitAnswer(session.id, question_id, selected_option);

            res.json({
                success: true,
                message: 'Answer submitted successfully',
                data: result
            });
        } catch (error) {
            if (error.message === 'Quiz session not found' || error.message === 'Question not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * Complete daily quiz for authenticated driver
     */
    static async completeDailyQuiz(req, res, next) {
        try {
            const firebaseUid = req.firebaseUser.uid;

            // Get driver by Firebase UID
            const driver = await QuizService.getDriverByFirebaseUid(firebaseUid);
            if (!driver) {
                return res.status(404).json({
                    success: false,
                    message: 'Driver not found'
                });
            }

            // Get today's session
            const session = await QuizService.getTodaysSession(driver.id);
            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'No active quiz session found'
                });
            }

            const completedSession = await QuizService.completeQuiz(session.id);

            // Recalculate driver statistics to ensure accuracy
            await driver.recalculateStats();
            await driver.reload();

            res.json({
                success: true,
                message: 'Quiz completed successfully',
                data: {
                    session_id: completedSession.id,
                    total_questions: completedSession.total_questions,
                    total_correct: completedSession.total_correct,
                    score: completedSession.calculateScore(),
                    completed: completedSession.completed,
                    driver_profile: {
                        total_quizzes: driver.total_quizzes,
                        total_correct: driver.total_correct,
                        total_questions: driver.total_questions,
                        accuracy: driver.calculateAccuracy(),
                        streak: driver.streak,
                        last_quiz_date: driver.last_quiz_date
                    }
                }
            });
        } catch (error) {
            if (error.message === 'Quiz session not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * Get driver quiz history for authenticated driver
     */
    static async getDriverQuizHistory(req, res, next) {
        try {
            const firebaseUid = req.firebaseUser.uid;
            const {
                limit = 20,
                    offset = 0
            } = req.query;

            // Get driver by Firebase UID
            const driver = await QuizService.getDriverByFirebaseUid(firebaseUid);
            if (!driver) {
                return res.status(404).json({
                    success: false,
                    message: 'Driver not found'
                });
            }

            const history = await QuizService.getQuizHistory(driver.id, {
                limit,
                offset
            });

            const formattedHistory = history.rows.map(session => ({
                id: session.id,
                quiz_date: session.quiz_date,
                total_questions: session.total_questions,
                total_correct: session.total_correct,
                score: session.calculateScore(),
                completed: session.completed,
                created_at: session.created_at
            }));

            res.json({
                success: true,
                data: {
                    sessions: formattedHistory,
                    total: history.count,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get detailed driver quiz history with questions and answers for authenticated driver
     */
    static async getDriverDetailedQuizHistory(req, res, next) {
        try {
            const firebaseUid = req.firebaseUser.uid;
            const {
                limit = 20,
                offset = 0,
                language
            } = req.query;

            // Get driver by Firebase UID
            const driver = await QuizService.getDriverByFirebaseUid(firebaseUid);
            if (!driver) {
                return res.status(404).json({
                    success: false,
                    message: 'Driver not found'
                });
            }

            // Use driver's language or provided language or default to 'en'
            const quizLanguage = language || driver.language || 'en';

            const detailedHistory = await QuizService.getDetailedQuizHistory(driver.id, {
                limit,
                offset,
                language: quizLanguage
            });

            res.json({
                success: true,
                message: 'Detailed quiz history retrieved successfully',
                data: detailedHistory
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get admin quiz answers and statistics
     */
    static async getAdminQuizAnswers(req, res, next) {
        try {
            const {
                date,
                driver_id,
                limit = 50,
                offset = 0
            } = req.query;

            const answers = await QuizService.getAdminQuizAnswers({
                date,
                driver_id,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json({
                success: true,
                data: answers
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get comprehensive quiz statistics for admin
     */
    static async getAdminQuizStatistics(req, res, next) {
        try {
            const {
                start_date,
                end_date
            } = req.query;

            const statistics = await QuizService.getAdminQuizStatistics({
                start_date,
                end_date
            });

            res.json({
                success: true,
                data: statistics
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = QuizController;
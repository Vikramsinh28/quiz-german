const {
    QuizSession,
    QuizResponse,
    Question,
    Driver
} = require('../models');

class QuizService {
    /**
     * Get today's quiz session for a driver
     */
    static async getTodaysSession(driverId) {
        const today = new Date().toISOString().split('T')[0];

        return await QuizSession.findOne({
            where: {
                driver_id: driverId,
                quiz_date: today
            },
            include: [{
                model: Driver,
                as: 'driver'
            }]
        });
    }

    /**
     * Create today's quiz session
     */
    static async createTodaysSession(driverId) {
        const today = new Date().toISOString().split('T')[0];

        return await QuizSession.create({
            driver_id: driverId,
            quiz_date: today
        });
    }

    /**
     * Start a quiz session
     */
    static async startQuiz(driverId, questions) {
        const today = new Date().toISOString().split('T')[0];

        // Check if session already exists
        let session = await QuizSession.findOne({
            where: {
                driver_id: driverId,
                quiz_date: today
            }
        });

        if (!session) {
            session = await QuizSession.create({
                driver_id: driverId,
                quiz_date: today
            });
        }

        return session;
    }

    /**
     * Submit an answer to a quiz session
     */
    static async submitAnswer(sessionId, questionId, selectedOption) {
        const session = await QuizSession.findByPk(sessionId, {
            include: [{
                model: Driver,
                as: 'driver'
            }]
        });

        if (!session) {
            throw new Error('Quiz session not found');
        }

        const question = await Question.findByPk(questionId);
        if (!question) {
            throw new Error('Question not found');
        }

        const isCorrect = question.isCorrectAnswer(selectedOption);

        // Create quiz response
        await QuizResponse.create({
            quiz_session_id: sessionId,
            question_id: questionId,
            selected_option: selectedOption,
            correct: isCorrect
        });

        // Update session totals
        session.total_questions += 1;
        if (isCorrect) {
            session.total_correct += 1;
        }
        await session.save();

        return {
            correct: isCorrect,
            correct_option: question.correct_option,
            explanation: question.getExplanation(session.driver.language),
            session_stats: {
                total_questions: session.total_questions,
                total_correct: session.total_correct,
                score: session.calculateScore()
            }
        };
    }

    /**
     * Complete a quiz session
     */
    static async completeQuiz(sessionId) {
        const session = await QuizSession.findByPk(sessionId, {
            include: [{
                model: Driver,
                as: 'driver'
            }]
        });

        if (!session) {
            throw new Error('Quiz session not found');
        }

        session.completed = true;
        await session.save();

        // Update driver statistics
        const driver = session.driver;
        driver.total_quizzes += 1;
        driver.total_correct += session.total_correct;
        await driver.updateStreak(session.quiz_date);

        return session;
    }

    /**
     * Get quiz history for a driver
     */
    static async getQuizHistory(driverId, options = {}) {
        const {
            limit = 20,
                offset = 0
        } = options;

        return await QuizSession.findAndCountAll({
            where: {
                driver_id: driverId,
                completed: true
            },
            order: [
                ['quiz_date', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    }

    /**
     * Get quiz session by ID
     */
    static async getQuizSessionById(sessionId) {
        return await QuizSession.findByPk(sessionId, {
            include: [{
                model: Driver,
                as: 'driver'
            }]
        });
    }

    /**
     * Get quiz responses for a session
     */
    static async getQuizResponses(sessionId) {
        return await QuizResponse.findAll({
            where: {
                quiz_session_id: sessionId
            },
            include: [{
                model: Question,
                as: 'question'
            }],
            order: [
                ['answered_at', 'ASC']
            ]
        });
    }

    /**
     * Check if driver can take quiz today
     */
    static async canTakeQuizToday(driverId) {
        const today = new Date().toISOString().split('T')[0];

        const existingSession = await QuizSession.findOne({
            where: {
                driver_id: driverId,
                quiz_date: today,
                completed: true
            }
        });

        return !existingSession;
    }

    /**
     * Get driver statistics
     */
    static async getDriverStats(driverId) {
        const driver = await Driver.findByPk(driverId);
        if (!driver) {
            return null;
        }

        const totalSessions = await QuizSession.count({
            where: {
                driver_id: driverId,
                completed: true
            }
        });

        const totalCorrect = await QuizSession.sum('total_correct', {
            where: {
                driver_id: driverId,
                completed: true
            }
        });

        const totalQuestions = await QuizSession.sum('total_questions', {
            where: {
                driver_id: driverId,
                completed: true
            }
        });

        return {
            driver: {
                id: driver.id,
                total_quizzes: driver.total_quizzes,
                total_correct: driver.total_correct,
                streak: driver.streak,
                last_quiz_date: driver.last_quiz_date,
                accuracy: driver.calculateAccuracy()
            },
            sessions: {
                total: totalSessions,
                total_correct: totalCorrect || 0,
                total_questions: totalQuestions || 0,
                overall_accuracy: totalQuestions > 0 ? Math.round(((totalCorrect || 0) / totalQuestions) * 100) : 0
            }
        };
    }
}

module.exports = QuizService;
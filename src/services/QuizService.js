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

        // Don't update if already completed
        if (session.completed) {
            return session;
        }

        session.completed = true;
        await session.save();

        // Note: Driver statistics will be recalculated in the controller
        // using recalculateStats() to ensure accuracy from source data
        // Update only the streak here
        const driver = session.driver;
        if (driver) {
            await driver.updateStreak(session.quiz_date);
        }

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
     * Get detailed quiz history with questions and answers for a driver
     */
    static async getDetailedQuizHistory(driverId, options = {}) {
        const {
            limit = 20,
                offset = 0,
                language = 'en'
        } = options;

        // Get all completed quiz sessions
        const sessions = await QuizSession.findAndCountAll({
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

        // Get detailed responses for each session
        const detailedSessions = await Promise.all(
            sessions.rows.map(async (session) => {
                const responses = await QuizResponse.findAll({
                    where: {
                        quiz_session_id: session.id
                    },
                    include: [{
                        model: Question,
                        as: 'question'
                    }],
                    order: [
                        ['answered_at', 'ASC']
                    ]
                });

                // Format questions and answers
                const questions = responses.map(response => {
                    const question = response.question;
                    if (!question) {
                        return {
                            question_id: response.question_id,
                            question_text: null,
                            options: [],
                            selected_option: response.selected_option,
                            selected_option_text: null,
                            correct_option: null,
                            correct_option_text: null,
                            is_correct: response.correct,
                            explanation: null,
                            topic: null,
                            answered_at: response.answered_at
                        };
                    }

                    const options = question.getOptions ? question.getOptions() : (question.options || []);
                    const questionText = question.getQuestionText ? question.getQuestionText() : question.question_text;
                    const explanation = question.getExplanation ? question.getExplanation() : question.explanation;

                    return {
                        question_id: response.question_id,
                        question_text: questionText,
                        options: options,
                        selected_option: response.selected_option,
                        selected_option_text: options[response.selected_option] || null,
                        correct_option: question.correct_option,
                        correct_option_text: options[question.correct_option] || null,
                        is_correct: response.correct,
                        explanation: explanation,
                        topic: question.topic || null,
                        answered_at: response.answered_at
                    };
                });

                return {
                    session_id: session.id,
                    quiz_date: session.quiz_date,
                    total_questions: session.total_questions,
                    total_correct: session.total_correct,
                    score: session.calculateScore(),
                    completed: session.completed,
                    created_at: session.created_at,
                    questions: questions
                };
            })
        );

        return {
            sessions: detailedSessions,
            total: sessions.count,
            limit: parseInt(limit),
            offset: parseInt(offset)
        };
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

    /**
     * Get driver by Firebase UID
     */
    static async getDriverByFirebaseUid(firebaseUid) {
        return await Driver.findOne({
            where: {
                firebase_uid: firebaseUid
            }
        });
    }

    /**
     * Get admin quiz answers and statistics
     */
    static async getAdminQuizAnswers(options = {}) {
        const {
            date,
            driver_id,
            limit = 50,
            offset = 0
        } = options;

        const whereClause = {};
        if (date) {
            whereClause.quiz_date = date;
        }
        if (driver_id) {
            whereClause.driver_id = driver_id;
        }

        const sessions = await QuizSession.findAndCountAll({
            where: whereClause,
            include: [{
                model: Driver,
                as: 'driver',
                attributes: ['id', 'name', 'phone_number', 'firebase_uid']
            }],
            order: [
                ['created_at', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Get answers for each session
        const sessionsWithAnswers = await Promise.all(
            sessions.rows.map(async (session) => {
                const responses = await QuizResponse.findAll({
                    where: {
                        quiz_session_id: session.id
                    },
                    include: [{
                        model: Question,
                        as: 'question',
                        attributes: ['id', 'question_text', 'correct_option', 'explanation']
                    }],
                    order: [
                        ['answered_at', 'ASC']
                    ]
                });

                const answers = responses.map(response => ({
                    question_id: response.question_id,
                    question_text: response.question.question_text,
                    selected_option: response.selected_option,
                    correct_option: response.question.correct_option,
                    correct: response.correct,
                    explanation: response.question.explanation,
                    answered_at: response.answered_at
                }));

                return {
                    id: session.id,
                    driver_id: session.driver_id,
                    driver_name: session.driver ? session.driver.name : 'Unknown',
                    driver_phone: session.driver ? session.driver.phone_number : null,
                    quiz_date: session.quiz_date,
                    total_questions: session.total_questions,
                    total_correct: session.total_correct,
                    score: session.calculateScore(),
                    completed: session.completed,
                    created_at: session.created_at,
                    answers: answers
                };
            })
        );

        // Calculate statistics
        const totalSessions = sessions.count;
        const uniqueDrivers = new Set(sessions.rows.map(s => s.driver_id)).size;
        const averageScore = sessions.rows.length > 0 ?
            sessions.rows.reduce((sum, s) => sum + s.calculateScore(), 0) / sessions.rows.length :
            0;
        const completedSessions = sessions.rows.filter(s => s.completed).length;
        const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

        // Daily stats
        const dailyStats = {};
        sessions.rows.forEach(session => {
            const date = session.quiz_date;
            if (!dailyStats[date]) {
                dailyStats[date] = {
                    date: date,
                    sessions_count: 0,
                    average_score: 0,
                    total_score: 0
                };
            }
            dailyStats[date].sessions_count++;
            dailyStats[date].total_score += session.calculateScore();
        });

        const dailyStatsArray = Object.values(dailyStats).map(stat => ({
            ...stat,
            average_score: stat.sessions_count > 0 ? stat.total_score / stat.sessions_count : 0
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        return {
            sessions: sessionsWithAnswers,
            statistics: {
                total_sessions: totalSessions,
                total_drivers: uniqueDrivers,
                average_score: Math.round(averageScore * 100) / 100,
                completion_rate: Math.round(completionRate * 100) / 100,
                daily_stats: dailyStatsArray
            },
            total: totalSessions,
            limit: parseInt(limit),
            offset: parseInt(offset)
        };
    }

    /**
     * Get comprehensive quiz statistics for admin
     */
    static async getAdminQuizStatistics(options = {}) {
        const {
            start_date,
            end_date
        } = options;

        const whereClause = {};
        if (start_date && end_date) {
            whereClause.quiz_date = {
                [require('sequelize').Op.between]: [start_date, end_date]
            };
        } else if (start_date) {
            whereClause.quiz_date = {
                [require('sequelize').Op.gte]: start_date
            };
        } else if (end_date) {
            whereClause.quiz_date = {
                [require('sequelize').Op.lte]: end_date
            };
        }

        // Get all sessions in the date range
        const sessions = await QuizSession.findAll({
            where: whereClause,
            include: [{
                model: Driver,
                as: 'driver',
                attributes: ['id', 'name', 'phone_number']
            }],
            order: [
                ['quiz_date', 'ASC']
            ]
        });

        // Calculate overview statistics
        const totalSessions = sessions.length;
        const uniqueDrivers = new Set(sessions.map(s => s.driver_id)).size;
        const averageScore = sessions.length > 0 ?
            sessions.reduce((sum, s) => sum + s.calculateScore(), 0) / sessions.length :
            0;
        const completedSessions = sessions.filter(s => s.completed).length;
        const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

        // Daily statistics
        const dailyStatsMap = {};
        sessions.forEach(session => {
            const date = session.quiz_date;
            if (!dailyStatsMap[date]) {
                dailyStatsMap[date] = {
                    date: date,
                    sessions_count: 0,
                    unique_drivers: new Set(),
                    total_score: 0,
                    completed_count: 0
                };
            }
            dailyStatsMap[date].sessions_count++;
            dailyStatsMap[date].unique_drivers.add(session.driver_id);
            dailyStatsMap[date].total_score += session.calculateScore();
            if (session.completed) {
                dailyStatsMap[date].completed_count++;
            }
        });

        const dailyStats = Object.values(dailyStatsMap).map(stat => ({
            date: stat.date,
            sessions_count: stat.sessions_count,
            unique_drivers: stat.unique_drivers.size,
            average_score: stat.sessions_count > 0 ? Math.round((stat.total_score / stat.sessions_count) * 100) / 100 : 0,
            completion_rate: stat.sessions_count > 0 ? Math.round((stat.completed_count / stat.sessions_count) * 100) / 100 : 0
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        // Top performers
        const driverStats = {};
        sessions.forEach(session => {
            const driverId = session.driver_id;
            if (!driverStats[driverId]) {
                driverStats[driverId] = {
                    driver_id: driverId,
                    driver_name: session.driver ? session.driver.name : 'Unknown',
                    total_sessions: 0,
                    total_score: 0,
                    completed_sessions: 0
                };
            }
            driverStats[driverId].total_sessions++;
            driverStats[driverId].total_score += session.calculateScore();
            if (session.completed) {
                driverStats[driverId].completed_sessions++;
            }
        });

        const topPerformers = Object.values(driverStats)
            .map(driver => ({
                ...driver,
                average_score: driver.total_sessions > 0 ? Math.round((driver.total_score / driver.total_sessions) * 100) / 100 : 0
            }))
            .sort((a, b) => b.average_score - a.average_score)
            .slice(0, 10);

        // Question analytics
        const questionStats = {};
        const responses = await QuizResponse.findAll({
            where: {
                quiz_session_id: {
                    [require('sequelize').Op.in]: sessions.map(s => s.id)
                }
            },
            include: [{
                model: Question,
                as: 'question',
                attributes: ['id', 'question_text']
            }]
        });

        responses.forEach(response => {
            const questionId = response.question_id;
            if (!questionStats[questionId]) {
                questionStats[questionId] = {
                    question_id: questionId,
                    question_text: response.question.question_text,
                    total_attempts: 0,
                    correct_attempts: 0
                };
            }
            questionStats[questionId].total_attempts++;
            if (response.correct) {
                questionStats[questionId].correct_attempts++;
            }
        });

        const questionAnalytics = Object.values(questionStats)
            .map(question => ({
                ...question,
                accuracy_rate: question.total_attempts > 0 ?
                    Math.round((question.correct_attempts / question.total_attempts) * 10000) / 100 : 0
            }))
            .sort((a, b) => b.accuracy_rate - a.accuracy_rate);

        return {
            overview: {
                total_sessions: totalSessions,
                total_drivers: uniqueDrivers,
                average_score: Math.round(averageScore * 100) / 100,
                completion_rate: Math.round(completionRate * 100) / 100
            },
            daily_stats: dailyStats,
            top_performers: topPerformers,
            question_analytics: questionAnalytics
        };
    }
}

module.exports = QuizService;
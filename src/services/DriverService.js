const {
    Driver,
    QuizSession
} = require('../models');

class DriverService {
    /**
     * Create a new driver
     */
    static async createDriver(driverData) {
        return await Driver.create(driverData);
    }

    /**
     * Get driver by ID
     */
    static async getDriverById(id) {
        return await Driver.findByPk(id);
    }

    /**
     * Get all drivers with pagination
     */
    static async getAllDrivers(options = {}) {
        const {
            limit = 20,
                offset = 0,
                language,
                active_today = false
        } = options;

        const whereClause = {};
        if (language) {
            whereClause.language = language;
        }

        if (active_today) {
            const today = new Date().toISOString().split('T')[0];
            whereClause.last_quiz_date = today;
        }

        return await Driver.findAndCountAll({
            where: whereClause,
            order: [
                ['created_at', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    }

    /**
     * Update driver information
     */
    static async updateDriver(id, updateData) {
        const driver = await Driver.findByPk(id);
        if (!driver) {
            return null;
        }

        await driver.update(updateData);
        return driver;
    }

    /**
     * Update driver language preference
     */
    static async updateDriverLanguage(id, language) {
        const driver = await Driver.findByPk(id);
        if (!driver) {
            return null;
        }

        driver.language = language;
        return await driver.save();
    }

    /**
     * Update driver device token
     */
    static async updateDeviceToken(id, deviceToken) {
        const driver = await Driver.findByPk(id);
        if (!driver) {
            return null;
        }

        driver.device_token = deviceToken;
        return await driver.save();
    }

    /**
     * Get driver statistics
     */
    static async getDriverStats(id) {
        const driver = await Driver.findByPk(id);
        if (!driver) {
            return null;
        }

        const totalSessions = await QuizSession.count({
            where: {
                driver_id: id,
                completed: true
            }
        });

        const totalCorrect = await QuizSession.sum('total_correct', {
            where: {
                driver_id: id,
                completed: true
            }
        });

        const totalQuestions = await QuizSession.sum('total_questions', {
            where: {
                driver_id: id,
                completed: true
            }
        });

        return {
            driver: {
                id: driver.id,
                language: driver.language,
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
     * Get drivers by language
     */
    static async getDriversByLanguage(language, options = {}) {
        const {
            limit = 20,
                offset = 0
        } = options;

        return await Driver.findAndCountAll({
            where: {
                language: language
            },
            order: [
                ['created_at', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    }

    /**
     * Get active drivers (took quiz today)
     */
    static async getActiveDriversToday(options = {}) {
        const {
            limit = 20,
                offset = 0
        } = options;

        const today = new Date().toISOString().split('T')[0];

        return await Driver.findAndCountAll({
            where: {
                last_quiz_date: today
            },
            order: [
                ['last_quiz_date', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    }

    /**
     * Get top performing drivers
     */
    static async getTopDrivers(options = {}) {
        const {
            limit = 10,
                minQuizzes = 5
        } = options;

        const drivers = await Driver.findAll({
            where: {
                total_quizzes: {
                    [require('sequelize').Op.gte]: minQuizzes
                }
            },
            order: [
                [require('sequelize').literal('(total_correct::float / total_quizzes)'), 'DESC'],
                ['total_quizzes', 'DESC']
            ],
            limit: parseInt(limit)
        });

        return drivers.map(driver => ({
            id: driver.id,
            language: driver.language,
            total_quizzes: driver.total_quizzes,
            total_correct: driver.total_correct,
            accuracy: driver.calculateAccuracy(),
            streak: driver.streak,
            last_quiz_date: driver.last_quiz_date
        }));
    }

    /**
     * Validate driver data
     */
    static validateDriverData(data) {
        const errors = [];

        if (data.language && !['en', 'de'].includes(data.language)) {
            errors.push('Language must be either "en" or "de"');
        }

        if (data.device_token && typeof data.device_token !== 'string') {
            errors.push('Device token must be a string');
        }

        return errors;
    }
}

module.exports = DriverService;
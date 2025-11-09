const {
    Driver,
    QuizSession
} = require('../models');

class DriverService {
    /**
     * Get driver by ID
     */
    static async getDriverById(id) {
        return await Driver.findByPk(id);
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
     * Update driver profile by Firebase UID
     */
    static async updateDriverProfile(firebaseUid, updateData) {
        const driver = await Driver.findOne({
            where: {
                firebase_uid: firebaseUid
            }
        });

        if (!driver) {
            return null;
        }

        // Filter out fields that shouldn't be updated by the driver
        const allowedFields = [
            'phone_number', 'fcm_token', 'device_token', 'language',
            'name', 'email', 'date_of_birth', 'gender',
            'address_line1', 'address_line2', 'city', 'state_province',
            'postal_code', 'country',
            'driver_license_number', 'license_issue_date', 'license_expiry_date',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'
        ];

        const filteredData = {};
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key) && updateData[key] !== undefined) {
                filteredData[key] = updateData[key];
            }
        });

        await driver.update(filteredData);

        // Recalculate profile completion
        driver.calculateProfileCompletion();
        await driver.save();

        return driver;
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
     * Recalculate driver statistics from actual quiz sessions
     * This fixes any inconsistencies in the driver table
     */
    static async recalculateDriverStats(driverId) {
        const driver = await Driver.findByPk(driverId);
        if (!driver) {
            return null;
        }

        await driver.recalculateStats();
        return driver;
    }

    /**
     * Recalculate statistics for all drivers
     * Useful for fixing data inconsistencies
     */
    static async recalculateAllDriverStats() {
        const drivers = await Driver.findAll();
        const results = [];

        for (const driver of drivers) {
            try {
                await driver.recalculateStats();
                results.push({
                    driver_id: driver.id,
                    status: 'success',
                    total_quizzes: driver.total_quizzes,
                    total_correct: driver.total_correct,
                    streak: driver.streak
                });
            } catch (error) {
                results.push({
                    driver_id: driver.id,
                    status: 'error',
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Validate profile data
     */
    static validateProfileData(data) {
        const errors = [];

        // Language validation
        if (data.language && !['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'].includes(data.language)) {
            errors.push('Language must be one of: en, fr, es, de, it, pt, ru, zh, ja, ko');
        }

        // Email validation
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Email must be a valid email address');
        }

        // Gender validation
        if (data.gender && !['male', 'female', 'other'].includes(data.gender)) {
            errors.push('Gender must be one of: male, female, other');
        }

        // Date validation
        if (data.date_of_birth && isNaN(Date.parse(data.date_of_birth))) {
            errors.push('Date of birth must be a valid date');
        }

        if (data.license_issue_date && isNaN(Date.parse(data.license_issue_date))) {
            errors.push('License issue date must be a valid date');
        }

        if (data.license_expiry_date && isNaN(Date.parse(data.license_expiry_date))) {
            errors.push('License expiry date must be a valid date');
        }

        // Phone number validation (basic)
        if (data.phone_number && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone_number.replace(/[\s\-\(\)]/g, ''))) {
            errors.push('Phone number must be a valid phone number');
        }

        if (data.emergency_contact_phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.emergency_contact_phone.replace(/[\s\-\(\)]/g, ''))) {
            errors.push('Emergency contact phone must be a valid phone number');
        }

        // String length validations
        if (data.name && data.name.length > 255) {
            errors.push('Name must be less than 255 characters');
        }

        if (data.email && data.email.length > 255) {
            errors.push('Email must be less than 255 characters');
        }

        if (data.address_line1 && data.address_line1.length > 255) {
            errors.push('Address line 1 must be less than 255 characters');
        }

        if (data.address_line2 && data.address_line2.length > 255) {
            errors.push('Address line 2 must be less than 255 characters');
        }

        if (data.city && data.city.length > 100) {
            errors.push('City must be less than 100 characters');
        }

        if (data.state_province && data.state_province.length > 100) {
            errors.push('State/Province must be less than 100 characters');
        }

        if (data.postal_code && data.postal_code.length > 20) {
            errors.push('Postal code must be less than 20 characters');
        }

        if (data.country && data.country.length > 100) {
            errors.push('Country must be less than 100 characters');
        }

        if (data.driver_license_number && data.driver_license_number.length > 100) {
            errors.push('Driver license number must be less than 100 characters');
        }

        if (data.emergency_contact_name && data.emergency_contact_name.length > 255) {
            errors.push('Emergency contact name must be less than 255 characters');
        }

        if (data.emergency_contact_relationship && data.emergency_contact_relationship.length > 100) {
            errors.push('Emergency contact relationship must be less than 100 characters');
        }

        return errors;
    }
}

module.exports = DriverService;
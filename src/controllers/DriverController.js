const DriverService = require('../services/DriverService');

class DriverController {
    /**
     * Create a new driver
     */
    static async createDriver(req, res, next) {
        try {
            const {
                language = 'en', device_token
            } = req.body;

            // Validate input
            const validationErrors = DriverService.validateDriverData({
                language,
                device_token
            });
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            const driverData = {
                language,
                device_token,
                total_quizzes: 0,
                total_correct: 0,
                streak: 0
            };

            const driver = await DriverService.createDriver(driverData);

            res.status(201).json({
                success: true,
                message: 'Driver created successfully',
                data: {
                    id: driver.id,
                    language: driver.language,
                    device_token: driver.device_token,
                    total_quizzes: driver.total_quizzes,
                    total_correct: driver.total_correct,
                    streak: driver.streak,
                    created_at: driver.created_at
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get driver by ID
     */
    static async getDriverById(req, res, next) {
        try {
            const {
                id
            } = req.params;

            const driver = await DriverService.getDriverById(id);
            if (!driver) {
                return res.status(404).json({
                    success: false,
                    message: 'Driver not found'
                });
            }

            res.json({
                success: true,
                data: {
                    id: driver.id,
                    language: driver.language,
                    device_token: driver.device_token,
                    total_quizzes: driver.total_quizzes,
                    total_correct: driver.total_correct,
                    streak: driver.streak,
                    last_quiz_date: driver.last_quiz_date,
                    accuracy: driver.calculateAccuracy(),
                    created_at: driver.created_at,
                    updated_at: driver.updated_at
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all drivers (admin)
     */
    static async getAllDrivers(req, res, next) {
        try {
            const {
                limit = 20,
                    offset = 0,
                    language,
                    active_today = false
            } = req.query;

            const drivers = await DriverService.getAllDrivers({
                limit,
                offset,
                language,
                active_today: active_today === 'true'
            });

            const formattedDrivers = drivers.rows.map(driver => ({
                id: driver.id,
                language: driver.language,
                device_token: driver.device_token,
                total_quizzes: driver.total_quizzes,
                total_correct: driver.total_correct,
                streak: driver.streak,
                last_quiz_date: driver.last_quiz_date,
                accuracy: driver.calculateAccuracy(),
                created_at: driver.created_at,
                updated_at: driver.updated_at
            }));

            res.json({
                success: true,
                data: {
                    drivers: formattedDrivers,
                    total: drivers.count,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update driver information
     */
    static async updateDriver(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const updateData = req.body;

            // Validate input
            const validationErrors = DriverService.validateDriverData(updateData);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            const driver = await DriverService.updateDriver(id, updateData);
            if (!driver) {
                return res.status(404).json({
                    success: false,
                    message: 'Driver not found'
                });
            }

            res.json({
                success: true,
                message: 'Driver updated successfully',
                data: {
                    id: driver.id,
                    language: driver.language,
                    device_token: driver.device_token,
                    total_quizzes: driver.total_quizzes,
                    total_correct: driver.total_correct,
                    streak: driver.streak,
                    last_quiz_date: driver.last_quiz_date,
                    accuracy: driver.calculateAccuracy(),
                    created_at: driver.created_at,
                    updated_at: driver.updated_at
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update driver language
     */
    static async updateDriverLanguage(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const {
                language
            } = req.body;

            if (!language || !['en', 'de'].includes(language)) {
                return res.status(400).json({
                    success: false,
                    message: 'Language must be either "en" or "de"'
                });
            }

            const driver = await DriverService.updateDriverLanguage(id, language);
            if (!driver) {
                return res.status(404).json({
                    success: false,
                    message: 'Driver not found'
                });
            }

            res.json({
                success: true,
                message: 'Driver language updated successfully',
                data: {
                    id: driver.id,
                    language: driver.language
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update driver device token
     */
    static async updateDeviceToken(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const {
                device_token
            } = req.body;

            if (!device_token) {
                return res.status(400).json({
                    success: false,
                    message: 'Device token is required'
                });
            }

            const driver = await DriverService.updateDeviceToken(id, device_token);
            if (!driver) {
                return res.status(404).json({
                    success: false,
                    message: 'Driver not found'
                });
            }

            res.json({
                success: true,
                message: 'Device token updated successfully',
                data: {
                    id: driver.id,
                    device_token: driver.device_token
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
                id
            } = req.params;

            const stats = await DriverService.getDriverStats(id);
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
     * Get drivers by language
     */
    static async getDriversByLanguage(req, res, next) {
        try {
            const {
                language
            } = req.params;
            const {
                limit = 20,
                    offset = 0
            } = req.query;

            if (!['en', 'de'].includes(language)) {
                return res.status(400).json({
                    success: false,
                    message: 'Language must be either "en" or "de"'
                });
            }

            const drivers = await DriverService.getDriversByLanguage(language, {
                limit,
                offset
            });

            const formattedDrivers = drivers.rows.map(driver => ({
                id: driver.id,
                language: driver.language,
                total_quizzes: driver.total_quizzes,
                total_correct: driver.total_correct,
                streak: driver.streak,
                last_quiz_date: driver.last_quiz_date,
                accuracy: driver.calculateAccuracy(),
                created_at: driver.created_at
            }));

            res.json({
                success: true,
                data: {
                    drivers: formattedDrivers,
                    total: drivers.count,
                    language: language,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get active drivers today
     */
    static async getActiveDriversToday(req, res, next) {
        try {
            const {
                limit = 20,
                    offset = 0
            } = req.query;

            const drivers = await DriverService.getActiveDriversToday({
                limit,
                offset
            });

            const formattedDrivers = drivers.rows.map(driver => ({
                id: driver.id,
                language: driver.language,
                total_quizzes: driver.total_quizzes,
                total_correct: driver.total_correct,
                streak: driver.streak,
                last_quiz_date: driver.last_quiz_date,
                accuracy: driver.calculateAccuracy()
            }));

            res.json({
                success: true,
                data: {
                    drivers: formattedDrivers,
                    total: drivers.count,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get top performing drivers
     */
    static async getTopDrivers(req, res, next) {
        try {
            const {
                limit = 10,
                    min_quizzes = 5
            } = req.query;

            const topDrivers = await DriverService.getTopDrivers({
                limit: parseInt(limit),
                minQuizzes: parseInt(min_quizzes)
            });

            res.json({
                success: true,
                data: {
                    drivers: topDrivers,
                    limit: parseInt(limit),
                    min_quizzes: parseInt(min_quizzes)
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = DriverController;
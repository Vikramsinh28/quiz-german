const {
    Driver
} = require('../models');
const {
    sendLocalizedResponse
} = require('../utils/responseMessages');

class AuthController {
    /**
     * Test Firebase authentication
     */
    static async testAuth(req, res, next) {
        try {
            const firebaseUser = req.firebaseUser;
            console.log('firebaseUser', firebaseUser);

            res.json({
                success: true,
                message: 'Firebase authentication successful',
                data: {
                    firebase_uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    phone_number: firebaseUser.phone_number,
                    email_verified: firebaseUser.email_verified,
                    auth_time: new Date(firebaseUser.auth_time * 1000).toISOString(),
                    exp: new Date(firebaseUser.exp * 1000).toISOString()
                }
            });
        } catch (error) {
            console.error('❌ Test Auth Error:', error);
            next(error);
        }
    }

    /**
     * Login driver with Firebase token
     */
    static async loginDriver(req, res, next) {
        try {
            const firebaseUser = req.firebaseUser;
            const {
                fcm_token,
                language = 'en'
            } = req.body;

            // Check if driver exists
            let driver = await Driver.findOne({
                where: {
                    firebase_uid: firebaseUser.uid
                }
            });

            if (!driver) {
                // Create new driver
                driver = await Driver.create({
                    firebase_uid: firebaseUser.uid,
                    phone_number: firebaseUser.phone_number || null,
                    fcm_token: fcm_token || null,
                    language: language,
                    total_quizzes: 0,
                    total_correct: 0,
                    streak: 0
                });
                console.log('✅ New driver created:', driver.firebase_uid);
            } else {
                // Update existing driver
                if (fcm_token) driver.fcm_token = fcm_token;
                if (language) driver.language = language;
                await driver.save();
                console.log('✅ Driver updated:', driver.firebase_uid);
            }

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    driver: {
                        id: driver.id,
                        firebase_uid: driver.firebase_uid,
                        phone_number: driver.phone_number,
                        language: driver.language,
                        total_quizzes: driver.total_quizzes,
                        total_correct: driver.total_correct,
                        streak: driver.streak,
                        accuracy: driver.calculateAccuracy()
                    }
                }
            });
        } catch (error) {
            console.error('❌ Login Error:', error);
            next(error);
        }
    }

    /**
     * Get driver profile
     */
    static async getDriverProfile(req, res, next) {
        try {
            const firebaseUser = req.firebaseUser;

            const driver = await Driver.findOne({
                where: {
                    firebase_uid: firebaseUser.uid
                }
            });

            if (!driver) {
                return res.status(404).json({
                    success: false,
                    message: 'Driver not found',
                    code: 'DRIVER_NOT_FOUND'
                });
            }

            res.json({
                success: true,
                data: {
                    driver: {
                        id: driver.id,
                        firebase_uid: driver.firebase_uid,
                        phone_number: driver.phone_number,
                        language: driver.language,
                        total_quizzes: driver.total_quizzes,
                        total_correct: driver.total_correct,
                        streak: driver.streak,
                        accuracy: driver.calculateAccuracy(),
                        created_at: driver.created_at
                    }
                }
            });
        } catch (error) {
            console.error('❌ Get Profile Error:', error);
            next(error);
        }
    }
}

module.exports = AuthController;
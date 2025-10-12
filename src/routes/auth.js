const express = require('express');
const {
    Driver,
    Admin
} = require('../models');
const {
    verifyFirebaseToken,
    getFirebaseUser,
    createCustomToken,
    setCustomUserClaims
} = require('../config/firebase');
const {
    verifyFirebaseAuth,
    requireAdmin
} = require('../middlewares/firebaseAuth');
const {
    sendLocalizedResponse,
    isLanguageSupported
} = require('../utils/i18n');
const router = express.Router();

/**
 * Firebase Authentication Routes
 * Handles mobile authentication and user management
 */

// Verify Firebase token and get user info
router.post('/verify', async (req, res, next) => {
    try {
        const {
            token
        } = req.body;

        if (!token) {
            return sendLocalizedResponse(res, 400, 'api.validation_error', {
                message: 'Firebase token is required'
            }, req.userLanguage);
        }

        // Verify the Firebase token
        const decodedToken = await verifyFirebaseToken(token);

        // Get additional user info from Firebase
        const userRecord = await getFirebaseUser(decodedToken.uid);

        // Check if user exists in our database
        let localUser = null;
        let userType = 'unknown';

        // Check if it's a driver
        const driver = await Driver.findOne({
            where: {
                firebase_uid: decodedToken.uid
            }
        });
        if (driver) {
            localUser = driver;
            userType = 'driver';
        }

        // Check if it's an admin
        const admin = await Admin.findOne({
            where: {
                firebase_uid: decodedToken.uid
            }
        });
        if (admin) {
            localUser = admin;
            userType = 'admin';
        }

        const responseData = {
            firebase: {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified,
                name: decodedToken.name,
                picture: decodedToken.picture,
                phoneNumber: userRecord.phoneNumber,
                customClaims: decodedToken.custom_claims || {},
                metadata: {
                    creationTime: userRecord.metadata.creationTime,
                    lastSignInTime: userRecord.metadata.lastSignInTime
                }
            },
            local: localUser ? {
                id: localUser.id,
                type: userType,
                ...localUser.toJSON()
            } : null,
            userType
        };

        return sendLocalizedResponse(res, 200, 'api.success', responseData, req.userLanguage);
    } catch (error) {
        next(error);
    }
});

// Register a new driver with Firebase UID
router.post('/register/driver', async (req, res, next) => {
    try {
        const {
            token,
            driver_license_number,
            phone_number,
            preferred_language = 'en'
        } = req.body;

        if (!token) {
            return sendLocalizedResponse(res, 400, 'api.validation_error', {
                message: 'Firebase token is required'
            }, req.userLanguage);
        }

        if (!driver_license_number) {
            return sendLocalizedResponse(res, 400, 'api.validation_error', {
                message: 'Driver license number is required'
            }, req.userLanguage);
        }

        // Verify the Firebase token
        const decodedToken = await verifyFirebaseToken(token);

        // Check if user already exists
        const existingDriver = await Driver.findOne({
            where: {
                firebase_uid: decodedToken.uid
            }
        });

        if (existingDriver) {
            return sendLocalizedResponse(res, 409, 'driver.already_exists', null, req.userLanguage);
        }

        // Check if driver license already exists
        const existingLicense = await Driver.findOne({
            where: {
                driver_license_number
            }
        });

        if (existingLicense) {
            return sendLocalizedResponse(res, 409, 'api.validation_error', {
                message: 'Driver license number already exists'
            }, req.userLanguage);
        }

        // Validate language
        if (!isLanguageSupported(preferred_language)) {
            return sendLocalizedResponse(res, 400, 'api.validation_error', {
                message: 'Unsupported language'
            }, req.userLanguage);
        }

        // Create new driver
        const newDriver = await Driver.create({
            firebase_uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name || 'Unknown Driver',
            driver_license_number,
            phone_number: phone_number || decodedToken.phone_number,
            language: preferred_language,
            is_active: true
        });

        // Set custom claims for the user
        await setCustomUserClaims(decodedToken.uid, {
            driver: true,
            driverId: newDriver.id
        });

        const responseData = {
            driver: newDriver.toJSON(),
            firebase: {
                uid: decodedToken.uid,
                email: decodedToken.email,
                customClaims: {
                    driver: true,
                    driverId: newDriver.id
                }
            }
        };

        return sendLocalizedResponse(res, 201, 'api.success', responseData, req.userLanguage);
    } catch (error) {
        next(error);
    }
});

// Register a new admin with Firebase UID
router.post('/register/admin', verifyFirebaseAuth, requireAdmin, async (req, res, next) => {
    try {
        const {
            token,
            admin_code,
            name,
            role = 'admin'
        } = req.body;

        if (!token) {
            return sendLocalizedResponse(res, 400, 'api.validation_error', {
                message: 'Firebase token is required'
            }, req.userLanguage);
        }

        if (!admin_code) {
            return sendLocalizedResponse(res, 400, 'api.validation_error', {
                message: 'Admin code is required'
            }, req.userLanguage);
        }

        // Verify the Firebase token
        const decodedToken = await verifyFirebaseToken(token);

        // Check if user already exists
        const existingAdmin = await Admin.findOne({
            where: {
                firebase_uid: decodedToken.uid
            }
        });

        if (existingAdmin) {
            return sendLocalizedResponse(res, 409, 'api.validation_error', {
                message: 'Admin already exists'
            }, req.userLanguage);
        }

        // Create new admin
        const newAdmin = await Admin.create({
            firebase_uid: decodedToken.uid,
            email: decodedToken.email,
            name: name || decodedToken.name || 'Unknown Admin',
            admin_code,
            role,
            is_active: true
        });

        // Set custom claims for the user
        await setCustomUserClaims(decodedToken.uid, {
            admin: true,
            adminId: newAdmin.id,
            role: role
        });

        const responseData = {
            admin: newAdmin.toJSON(),
            firebase: {
                uid: decodedToken.uid,
                email: decodedToken.email,
                customClaims: {
                    admin: true,
                    adminId: newAdmin.id,
                    role: role
                }
            }
        };

        return sendLocalizedResponse(res, 201, 'api.success', responseData, req.userLanguage);
    } catch (error) {
        next(error);
    }
});

// Get current user profile
router.get('/profile', verifyFirebaseAuth, async (req, res, next) => {
    try {
        const {
            uid
        } = req.firebaseUser;

        // Get local user data
        let localUser = null;
        let userType = 'unknown';

        const driver = await Driver.findOne({
            where: {
                firebase_uid: uid
            }
        });
        if (driver) {
            localUser = driver;
            userType = 'driver';
        }

        const admin = await Admin.findOne({
            where: {
                firebase_uid: uid
            }
        });
        if (admin) {
            localUser = admin;
            userType = 'admin';
        }

        const responseData = {
            firebase: req.firebaseUser,
            local: localUser ? localUser.toJSON() : null,
            userType
        };

        return sendLocalizedResponse(res, 200, 'api.success', responseData, req.userLanguage);
    } catch (error) {
        next(error);
    }
});

// Update user profile
router.put('/profile', verifyFirebaseAuth, async (req, res, next) => {
    try {
        const {
            uid
        } = req.firebaseUser;
        const {
            name,
            phone_number,
            language
        } = req.body;

        // Find local user
        let localUser = null;

        const driver = await Driver.findOne({
            where: {
                firebase_uid: uid
            }
        });
        if (driver) {
            localUser = driver;
        }

        const admin = await Admin.findOne({
            where: {
                firebase_uid: uid
            }
        });
        if (admin) {
            localUser = admin;
        }

        if (!localUser) {
            return sendLocalizedResponse(res, 404, 'api.not_found', {
                message: 'User profile not found'
            }, req.userLanguage);
        }

        // Update fields
        const updateData = {};
        if (name) updateData.name = name;
        if (phone_number) updateData.phone_number = phone_number;
        if (language && isLanguageSupported(language)) updateData.language = language;

        await localUser.update(updateData);

        const responseData = {
            firebase: req.firebaseUser,
            local: localUser.toJSON()
        };

        return sendLocalizedResponse(res, 200, 'api.success', responseData, req.userLanguage);
    } catch (error) {
        next(error);
    }
});

// Create custom token for testing
router.post('/custom-token', verifyFirebaseAuth, requireAdmin, async (req, res, next) => {
    try {
        const {
            uid,
            claims = {}
        } = req.body;

        if (!uid) {
            return sendLocalizedResponse(res, 400, 'api.validation_error', {
                message: 'UID is required'
            }, req.userLanguage);
        }

        const customToken = await createCustomToken(uid, claims);

        return sendLocalizedResponse(res, 200, 'api.success', {
            customToken,
            uid,
            claims
        }, req.userLanguage);
    } catch (error) {
        next(error);
    }
});

// Set custom user claims
router.post('/set-claims', verifyFirebaseAuth, requireAdmin, async (req, res, next) => {
    try {
        const {
            uid,
            claims
        } = req.body;

        if (!uid || !claims) {
            return sendLocalizedResponse(res, 400, 'api.validation_error', {
                message: 'UID and claims are required'
            }, req.userLanguage);
        }

        await setCustomUserClaims(uid, claims);

        return sendLocalizedResponse(res, 200, 'api.success', {
            uid,
            claims
        }, req.userLanguage);
    } catch (error) {
        next(error);
    }
});

// Delete user account
router.delete('/account', verifyFirebaseAuth, async (req, res, next) => {
    try {
        const {
            uid
        } = req.firebaseUser;

        // Delete local user data
        const driver = await Driver.findOne({
            where: {
                firebase_uid: uid
            }
        });
        if (driver) {
            await driver.destroy();
        }

        const admin = await Admin.findOne({
            where: {
                firebase_uid: uid
            }
        });
        if (admin) {
            await admin.destroy();
        }

        return sendLocalizedResponse(res, 200, 'api.success', {
            message: 'Account deleted successfully'
        }, req.userLanguage);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
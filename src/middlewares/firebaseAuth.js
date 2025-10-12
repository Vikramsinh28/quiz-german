const {
    verifyFirebaseToken,
    getFirebaseUser
} = require('../config/firebase');
const {
    sendLocalizedResponse
} = require('../utils/i18n');

/**
 * Firebase Authentication Middleware
 * Verifies Firebase ID tokens and adds user information to request
 */

// Middleware to verify Firebase token
const verifyFirebaseAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendLocalizedResponse(res, 401, 'api.unauthorized', {
                message: 'No valid authorization header found'
            }, req.userLanguage);
        }

        const token = authHeader.split('Bearer ')[1];

        if (!token) {
            return sendLocalizedResponse(res, 401, 'api.unauthorized', {
                message: 'No token provided'
            }, req.userLanguage);
        }

        // Verify the Firebase token
        const decodedToken = await verifyFirebaseToken(token);

        // Add user information to request
        req.firebaseUser = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            name: decodedToken.name,
            picture: decodedToken.picture,
            customClaims: decodedToken.custom_claims || {}
        };

        // Get additional user info from Firebase
        try {
            const userRecord = await getFirebaseUser(decodedToken.uid);
            req.firebaseUser.phoneNumber = userRecord.phoneNumber;
            req.firebaseUser.disabled = userRecord.disabled;
            req.firebaseUser.metadata = {
                creationTime: userRecord.metadata.creationTime,
                lastSignInTime: userRecord.metadata.lastSignInTime
            };
        } catch (error) {
            console.warn('Could not fetch additional user info:', error.message);
        }

        next();
    } catch (error) {
        console.error('Firebase auth verification failed:', error.message);
        return sendLocalizedResponse(res, 401, 'api.unauthorized', {
            message: 'Invalid or expired token'
        }, req.userLanguage);
    }
};

// Optional Firebase auth middleware (doesn't fail if no token)
const optionalFirebaseAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split('Bearer ')[1];

            if (token) {
                try {
                    const decodedToken = await verifyFirebaseToken(token);
                    req.firebaseUser = {
                        uid: decodedToken.uid,
                        email: decodedToken.email,
                        emailVerified: decodedToken.email_verified,
                        name: decodedToken.name,
                        picture: decodedToken.picture,
                        customClaims: decodedToken.custom_claims || {}
                    };
                } catch (error) {
                    console.warn('Optional Firebase auth failed:', error.message);
                    // Continue without authentication
                }
            }
        }

        next();
    } catch (error) {
        console.warn('Optional Firebase auth error:', error.message);
        next(); // Continue without authentication
    }
};

// Middleware to check if user has specific custom claims
const requireCustomClaim = (claimKey, claimValue = true) => {
    return (req, res, next) => {
        if (!req.firebaseUser) {
            return sendLocalizedResponse(res, 401, 'api.unauthorized', {
                message: 'Authentication required'
            }, req.userLanguage);
        }

        const userClaims = req.firebaseUser.customClaims || {};

        if (userClaims[claimKey] !== claimValue) {
            return sendLocalizedResponse(res, 403, 'api.forbidden', {
                message: `Required claim '${claimKey}' not found or invalid`
            }, req.userLanguage);
        }

        next();
    };
};

// Middleware to check if user is admin
const requireAdmin = requireCustomClaim('admin', true);

// Middleware to check if user is driver
const requireDriver = requireCustomClaim('driver', true);

// Middleware to check if user email is verified
const requireEmailVerified = (req, res, next) => {
    if (!req.firebaseUser) {
        return sendLocalizedResponse(res, 401, 'api.unauthorized', {
            message: 'Authentication required'
        }, req.userLanguage);
    }

    if (!req.firebaseUser.emailVerified) {
        return sendLocalizedResponse(res, 403, 'api.forbidden', {
            message: 'Email verification required'
        }, req.userLanguage);
    }

    next();
};

// Middleware to extract Firebase UID from token without full verification
const extractFirebaseUID = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split('Bearer ')[1];

            if (token) {
                try {
                    const decodedToken = await verifyFirebaseToken(token);
                    req.firebaseUID = decodedToken.uid;
                } catch (error) {
                    // Token invalid, continue without UID
                }
            }
        }

        next();
    } catch (error) {
        next(); // Continue without UID
    }
};

module.exports = {
    verifyFirebaseAuth,
    optionalFirebaseAuth,
    requireCustomClaim,
    requireAdmin,
    requireDriver,
    requireEmailVerified,
    extractFirebaseUID
};
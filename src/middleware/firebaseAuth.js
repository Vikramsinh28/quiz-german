const admin = require('../config/firebase');

/**
 * Middleware to verify Firebase ID token
 * This middleware extracts and verifies the Firebase ID token from the Authorization header
 */
async function verifyFirebaseToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Missing or invalid authorization header. Expected: Bearer <token>',
                code: 'MISSING_TOKEN'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
                code: 'NO_TOKEN'
            });
        }

        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Add Firebase user info to request object
        req.firebaseUser = {
            uid: decodedToken.uid,
            phone_number: decodedToken.phone_number,
            email: decodedToken.email,
            email_verified: decodedToken.email_verified,
            firebase: decodedToken.firebase,
            auth_time: decodedToken.auth_time,
            iat: decodedToken.iat,
            exp: decodedToken.exp
        };

        console.log(`✅ Firebase token verified for user: ${decodedToken.uid}`);
        next();
    } catch (error) {
        console.error('❌ Firebase Auth Error:', error.message);

        let errorMessage = 'Invalid or expired token';
        let errorCode = 'INVALID_TOKEN';

        if (error.code === 'auth/id-token-expired') {
            errorMessage = 'Token has expired';
            errorCode = 'TOKEN_EXPIRED';
        } else if (error.code === 'auth/id-token-revoked') {
            errorMessage = 'Token has been revoked';
            errorCode = 'TOKEN_REVOKED';
        } else if (error.code === 'auth/invalid-id-token') {
            errorMessage = 'Invalid token format';
            errorCode = 'INVALID_TOKEN_FORMAT';
        }

        return res.status(401).json({
            success: false,
            message: errorMessage,
            code: errorCode,
            timestamp: new Date().toISOString()
        });
    }
}

/**
 * Optional Firebase authentication middleware
 * This middleware tries to verify the token but doesn't fail if no token is provided
 */
async function optionalFirebaseAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without authentication
            req.firebaseUser = null;
            return next();
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            req.firebaseUser = null;
            return next();
        }

        // Try to verify the token
        const decodedToken = await admin.auth().verifyIdToken(token);

        req.firebaseUser = {
            uid: decodedToken.uid,
            phone_number: decodedToken.phone_number,
            email: decodedToken.email,
            email_verified: decodedToken.email_verified,
            firebase: decodedToken.firebase,
            auth_time: decodedToken.auth_time,
            iat: decodedToken.iat,
            exp: decodedToken.exp
        };

        console.log(`✅ Optional Firebase token verified for user: ${decodedToken.uid}`);
        next();
    } catch (error) {
        console.log(`⚠️ Optional Firebase auth failed: ${error.message}`);
        // Don't fail the request, just set user to null
        req.firebaseUser = null;
        next();
    }
}

module.exports = {
    verifyFirebaseToken,
    optionalFirebaseAuth
};
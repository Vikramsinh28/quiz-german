const admin = require('../config/firebase');

async function verifyFirebaseToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Missing Firebase token',
                code: 'MISSING_TOKEN'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format',
                code: 'INVALID_TOKEN_FORMAT'
            });
        }

        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log('decodedToken', decodedToken);

        // Add user information to request
        req.firebaseUser = decodedToken;

        next();
    } catch (error) {
        console.error('Firebase Auth Error:', error.message);

        let errorMessage = 'Invalid or expired token';
        let errorCode = 'INVALID_TOKEN';

        if (error.code === 'auth/id-token-expired') {
            errorMessage = 'Token has expired';
            errorCode = 'TOKEN_EXPIRED';
        } else if (error.code === 'auth/invalid-id-token') {
            errorMessage = 'Invalid token format';
            errorCode = 'INVALID_TOKEN_FORMAT';
        }

        return res.status(401).json({
            success: false,
            message: errorMessage,
            code: errorCode
        });
    }
}

module.exports = {
    verifyFirebaseToken
};
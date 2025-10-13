const admin = require('firebase-admin');
const fs = require('fs');
require('dotenv').config();

let serviceAccount;

try {
    // Try to read the service account file
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
        serviceAccount = JSON.parse(
            fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
        );
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        // Alternative: read from environment variable
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
        throw new Error('Firebase service account not configured');
    }

    // Initialize Firebase Admin SDK
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    console.log('🔥 Firebase Admin SDK initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.log('⚠️  Firebase authentication will not be available');
}

module.exports = admin;
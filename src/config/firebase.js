const admin = require('firebase-admin');
const fs = require('fs');
require('dotenv').config();

let firebaseInitialized = false;

try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (!serviceAccountPath) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is not defined in environment variables');
    }

    if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(`Firebase service account file not found at: ${serviceAccountPath}`);
    }

    const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, 'utf8')
    );

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    console.log('🔥 Firebase Admin SDK initialized successfully');
    console.log(`📁 Service account loaded from: ${serviceAccountPath}`);
} catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error.message);
    console.warn('⚠️  Continuing without Firebase (some features may not work)');
    console.warn('💡 Make sure to configure FIREBASE_SERVICE_ACCOUNT_PATH and the service account file on Render');
}

module.exports = {
    admin,
    firebaseInitialized
};
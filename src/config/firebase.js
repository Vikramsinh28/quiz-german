const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
let firebaseApp = null;

function initializeFirebase() {
    if (firebaseApp) {
        return firebaseApp;
    }

    try {
        // Method 1: Use environment variable for service account path
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

        if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
            console.log('🔐 Loading Firebase service account from file:', serviceAccountPath);
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id
            });
        }
        // Method 2: Use environment variables directly
        else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
            console.log('🔐 Loading Firebase service account from environment variables');

            const serviceAccount = {
                type: "service_account",
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: "https://accounts.google.com/o/oauth2/auth",
                token_uri: "https://oauth2.googleapis.com/token",
                auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
                client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
            };

            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id
            });
        }
        // Method 3: Use default credentials (for production environments like Google Cloud)
        else {
            console.log('🔐 Using default Firebase credentials');
            firebaseApp = admin.initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID || 'quiz-german'
            });
        }

        console.log('✅ Firebase Admin SDK initialized successfully');
        return firebaseApp;

    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
        throw error;
    }
}

// Get Firebase Admin instance
function getFirebaseAdmin() {
    if (!firebaseApp) {
        initializeFirebase();
    }
    return admin;
}

// Verify Firebase token
async function verifyFirebaseToken(token) {
    try {
        const admin = getFirebaseAdmin();
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error('Firebase token verification failed:', error.message);
        throw new Error('Invalid Firebase token');
    }
}

// Get user by UID
async function getFirebaseUser(uid) {
    try {
        const admin = getFirebaseAdmin();
        const userRecord = await admin.auth().getUser(uid);
        return userRecord;
    } catch (error) {
        console.error('Failed to get Firebase user:', error.message);
        throw new Error('User not found');
    }
}

// Create custom token for testing
async function createCustomToken(uid, additionalClaims = {}) {
    try {
        const admin = getFirebaseAdmin();
        const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
        return customToken;
    } catch (error) {
        console.error('Failed to create custom token:', error.message);
        throw new Error('Failed to create custom token');
    }
}

// Delete user
async function deleteFirebaseUser(uid) {
    try {
        const admin = getFirebaseAdmin();
        await admin.auth().deleteUser(uid);
        return true;
    } catch (error) {
        console.error('Failed to delete Firebase user:', error.message);
        throw new Error('Failed to delete user');
    }
}

// Set custom user claims
async function setCustomUserClaims(uid, claims) {
    try {
        const admin = getFirebaseAdmin();
        await admin.auth().setCustomUserClaims(uid, claims);
        return true;
    } catch (error) {
        console.error('Failed to set custom user claims:', error.message);
        throw new Error('Failed to set user claims');
    }
}

module.exports = {
    initializeFirebase,
    getFirebaseAdmin,
    verifyFirebaseToken,
    getFirebaseUser,
    createCustomToken,
    deleteFirebaseUser,
    setCustomUserClaims
};
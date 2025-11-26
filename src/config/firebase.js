const admin = require('firebase-admin');

let firebaseInitialized = false;

try {
    // Firebase service account configuration
    const serviceAccount = {
        "type": "service_account",
        "project_id": "quiz-german",
        "private_key_id": "a87e8a6c2da9eb113ee02ce1e332765f6da36e78",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC8Vt6e2qFOQ7jE\nyIGsGjloQezD14WIFe+or6sq9BzE5Ex8Ou4bKLGxQmOAlAmlc4xY4d2in7MOcFfS\nqfQlBWNQZZU0IuWdlYged0hhjCZ1iHtK4jiv5v3wdM0keZp8eVXMf4UPAIlhrlTb\nRl+C84r7R3UC2ItfXAO1ZEHmNzCETfNC71LwRoTfenO+jHkxaI/4wmc+mU6SGBMv\nEbT+jUeX1wWshuSohzacSJGNQFry8RvuJbOUQ1JXIi786puOBsX3TL73foWUPbq+\nAjl0iybZ4lacivhEKb3HhKAyvwziVElP3htybPWIOdoax2dloDuMT1Mn276p7nGd\nwNbrLjtxAgMBAAECggEABoCeobASrve6QrEEKRj5WmwhlzFdtDEYW86U2PV3TiTu\nWcD/Gi5G1EPig5HuM1Ql8vukAfVZjT9mXijtUPSP/+VB8tGG8/CHCTuSYtZ1OCGa\nKspcrVYK9mj8nCxxSlLgxMqyTAOiD/P2N2Ev8v7NkZdfUYCAb1kR7QqlFnmupyKq\njROfigrmRBJAXQ1kjaFTcmG3p8DVDygn6FMUHOia0/7Cpl3RiI2Sgr79/ran2qGV\n3fZZJTBfl5yD8ieNJ0wt8h/qMlpm/J7ScNdYkKrky/S77/nKkqGQuPCxBenP2aLB\nPzoWn8yFSYOZAjGGyZTI9Ti3Gd05rajHFPLR3JskMQKBgQD4tSqTn+yCOr4FPE3Y\nFh46cCHMzziurWPohneqFiwlIyObl8qYmTXTul03Ui+yEut3+Ts2DzEZWarjTPu8\nTfrYajgIAV+eMhRgxokqU0D/tJqcVHtFSmlFBhYjnBnKQ1A4LeggtQ3OnLd7afAE\n8XvNkcZNvpRTN9+hjUr8dHhw5wKBgQDB3JH9lEMLqQ1kLbfisB83/9JOPO/YKc75\nRlv974oLwoNLVH51RshdkQrMFW2/gi22HEO/CwJLZWR9KskV/V50m1o45GcpkXnc\n8krjrrOV2iHgEM3KAi8fA/MENq7dwxO7OR3ltVKCG4geX/+NPxcEmygi1nXvRIYO\nBWI53mJt5wKBgQDodDvVOtZNaiYMsq53V0TtjbyptszdxsXooTXbTVn5Y/x2Asuj\nESAUQs25VSGrKK/YtKO5BT342aw1QtDO0XuxJqY0JUR/kYMmaKnvW10XInCXyQZm\nXwRBNU0f/1jDiWLC/3VEjLTY9fUwbnWdyS7TlnpoU8ZCeaiVUIBTsXCY5QKBgQCt\n+kQufaMZ0NJKyFjRoNuzhut2+WsJ5KNxxHoET7fky+DGdwKyPx7MEcHN26FNkAdz\n+rO1vKyHe2wOhJpIGMVvAoiarCgE/yCNcAhTgtJ6NnPWQV5d303omMO8UVLnhA2u\nJRk2sF5mk0y6bc7LNQZ0RMZlVXArlaR06tH3OyO8mwKBgQCCCgfPUrOr89wlYWZC\nhClDDI3UYN8U3y4dnQeg7XhE3j7oLBDDPStuB7nWVNdMSw9qMacuK9gAJVC8BZ+n\nd03ogmFhLjeSN5MHsDg9rr0Zspld0WfEFO9eX72fNH/bjMxCbZfSpej7NcB/4LzP\nF/slgroGzBD57TBLk5CZi8Z6OQ==\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-fbsvc@quiz-german.iam.gserviceaccount.com",
        "client_id": "112664334990274609578",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40quiz-german.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
    };

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    console.log('🔥 Firebase Admin SDK initialized successfully');
    console.log('📁 Service account loaded from config');
} catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error.message);
    console.warn('⚠️  Continuing without Firebase (some features may not work)');
}

module.exports = {
    admin,
    firebaseInitialized
};
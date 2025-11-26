const admin = require('firebase-admin');

let firebaseInitialized = false;

try {
    // Firebase service account configuration
    const serviceAccount = {
          "type": "service_account",
          "project_id": "quiz-german",
          "private_key_id": "93a49ef0b7e627af0171e0ee8baf0baf3c05c8c8",
          "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCVPN6jH/ySjq2Q\nTQysrKIKsM+qhsD5HOLVXNSMMnWGJjTdiaB5P6x91mYXj5/xLOMHl+2Fz1w8w3Kd\nzq+EZLw9VizQ+5W7WpufVyXD74lmxIrZ72hSnMfHdqch/HtVPnRY5ofBHqHh8a/D\nascOhRHxEvbbzZBkMdTuGtNcwbVnTcXPyJiNBJz14/ZND18WRAmRy98cQZ9yzQl0\nTBBCZKLz6jyVj8C27s57WTBk22hqktYtpPByHZDFEj/qh0OupRWLKV+Zbky0RkVl\nwCzx1TR3FhEg5NrzMDjqgyJSAb16XImFhiB/AnAJ5ngqXAg4iYtSmxzQcEQyoh/N\nAwqZQ2iLAgMBAAECggEAPQdh4mKTxpk7SA4CN2D3eRi6K7mkk5ro9ijasKR35A6e\nwtPjwIG199Xj9RGibh2VkAbktrpINX8V0YvywdjyE8E4XZPstOvGRUB9rKU50sFg\nKORbDKGZnyuaCG94PjFmoe5QKLzupXfREUCKu5jWb/f55IQpXpf0RBTLR5zdoqsO\n5W+t0fwDK55bQo/99WKLJaasmpXwXshJ9O4X2aJ7aatTzmNkItynxhMWapCOb2d+\nDU4Ch74fcMB0HP4dcKCKZrltP885ZDz1iX+lG0691qjwCIRy9234Fu73E5VhLkWj\nR+3w16a0kvkW3CV1t9MFlAQ/skskDlB92Ts3T2gMfQKBgQDIiddtIue6g1jYy5e9\nyUDDbP9lv7eBVayX1fwtBK5wNt9EhTb6+ucLjb6Tl2MYozEM9PWlC+2gIdsxF1De\n7VprMbOq3UGfvMNmSc0MSKARaSK96RPIJ9pdrQiq1WvJsNmMAIzDNoxbb0ax1Scn\nAf0BFHl2tdNIRiSeUy4phriXLwKBgQC+gu5m3W6CnXmS9WmfLTpxDfTpCDpUZpq8\nj9D7KEEuIz9i283EC8+lhRnYlmcQvYoNm0fQWNxVdfQh98fFlPwPrhGdb3FsuFSe\nKQxy93z3j2SBbmvUzq3g4ue8yVFgIn2o5ac0WzsIQtMltnLBJ1XE+SI/o3tB1yyk\nKEVKzsutZQKBgHWNn9Og33fM4PsMtWGSJL2qGjh53scZArhqvo1hLiQndk+DS4xq\nIZ/7MhjwaC2cE/fFbG2YhW4WCphHU6eqOROXKfviAULy8xP19RXbSMGMAMqUY300\nJ2Q8N1V1D99GJPBVri4MvtAmdalvCqlqF/ZXGzCEO1sliveoSOocx/4PAoGARrJP\nxdxmJhJKCz8G8wrVpR6Iw/FJtAhfY5n68zj89yIdY5ItyZKYe9Pow3cMyCmOEX6O\nJ8LSAOTEs9Y/TBL9dtQhtUqlzLKatBaHiCJPPY74vQ889Lu9yrZpSKVsjUA/YW3X\nnpY8UdR6hoQuEX+HVJEfJH6GPuiaqFBJZnlXHAECgYEAkPjY4xjCiXGGKm5UAdWf\n3luq+h5h9sHTghrbfhxwshrIEptMfzvdnr1gTk+7peNk+5WF9XY+cvPS0CaPRwSK\nOfWtWbPZ2Gk9o2qjT79W+LjdY3q86vae/UBOi8pm8+vFhbnYdLMCky386yem0YnE\npPQol9H0PSB8wXXlLchXSkw=\n-----END PRIVATE KEY-----\n",
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

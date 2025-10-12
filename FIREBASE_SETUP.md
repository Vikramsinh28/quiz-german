# Firebase Mobile Authentication Setup Guide

This guide explains how to set up Firebase mobile authentication for your German Quiz Application.

## 🔐 Security Setup

### 1. Save Firebase Service Account Key Securely

**NEVER commit the Firebase service account key to your repository!**

Save the provided Firebase service account JSON as `firebase-service-account.json` in a secure location outside your project directory.

### 2. Environment Configuration

Create a `.env` file in your project root with the following variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quiz_german
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Server Configuration
PORT=3000
NODE_ENV=development

# Firebase Configuration
# Option 1: Service Account File Path (Recommended)
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/firebase-service-account.json

# Option 2: Environment Variables (Alternative)
FIREBASE_PROJECT_ID=quiz-german
FIREBASE_PRIVATE_KEY_ID=a87e8a6c2da9eb113ee02ce1e332765f6da36e78
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC8Vt6e2qFOQ7jE\nyIGsGjloQezD14WIFe+or6sq9BzE5Ex8Ou4bKLGxQmOAlAmlc4xY4d2in7MOcFfS\nqfQlBWNQZZU0IuWdlYged0hhjCZ1iHtK4jiv5v3wdM0keZp8eVXMf4UPAIlhrlTb\nRl+C84r7R3UC2ItfXAO1ZEHmNzCETfNC71LwRoTfenO+jHkxaI/4wmc+mU6SGBMv\nEbT+jUeX1wWshuSohzacSJGNQFry8RvuJbOUQ1JXIi786puOBsX3TL73foWUPbq+\nAjl0iybZ4lacivhEKb3HhKAyvwziVElP3htybPWIOdoax2dloDuMT1Mn276p7nGd\nwNbrLjtxAgMBAAECggEABoCeobASrve6QrEEKRj5WmwhlzFdtDEYW86U2PV3TiTu\nWcD/Gi5G1EPig5HuM1Ql8vukAfVZjT9mXijtUPSP/+VB8tGG8/CHCTuSYtZ1OCGa\nKspcrVYK9mj8nCxxSlLgxMqyTAOiD/P2N2Ev8v7NkZdfUYCAb1kR7QqlFnmupyKq\njROfigrmRBJAXQ1kjaFTcmG3p8DVDygn6FMUHOia0/7Cpl3RiI2Sgr79/ran2qGV\n3fZZJTBfl5yD8ieNJ0wt8h/qMlpm/J7ScNdYkKrky/S77/nKkqGQuPCxBenP2aLB\nPzoWn8yFSYOZAjGGyZTI9Ti3Gd05rajHFPLR3JskMQKBgQD4tSqTn+yCOr4FPE3Y\nFh46cCHMzziurWPohneqFiwlIyObl8qYmTXTul03Ui+yEut3+Ts2DzEZWarjTPu8\nTfrYajgIAV+eMhRgxokqU0D/tJqcVHtFSmlFBhYjnBnKQ1A4LeggtQ3OnLd7afAE\n8XvNkcZNvpRTN9+hjUr8dHhw5wKBgQDB3JH9lEMLqQ1kLbfisB83/9JOPO/YKc75\nRlv974oLwoNLVH51RshdkQrMFW2/gi22HEO/CwJLZWR9KskV/V50m1o45GcpkXnc\n8krjrrOV2iHgEM3KAi8fA/MENq7dwxO7OR3ltVKCG4geX/+NPxcEmygi1nXvRIYO\nBWI53mJt5wKBgQDodDvVOtZNaiYMsq53V0TtjbyptszdxsXooTXbTVn5Y/x2Asuj\nESAUQs25VSGrKK/YtKO5BT342aw1QtDO0XuxJqY0JUR/kYMmaKnvW10XInCXyQZm\nXwRBNU0f/1jDiWLC/3VEjLTY9fUwbnWdyS7TlnpoU8ZCeaiVUIBTsXCY5QKBgQCt\n+kQufaMZ0NJKyFjRoNuzhut2+WsJ5KNxxHoET7fky+DGdwKyPx7MEcHN26FNkAdz\n+rO1vKyHe2wOhJpIGMVvAoiarCgE/yCNcAhTgtJ6NnPWQV5d303omMO8UVLnhA2u\nJRk2sF5mk0y6bc7LNQZ0RMZlVXArlaR06tH3OyO8mwKBgQCCCgfPUrOr89wlYWZC\nhClDDI3UYN8U3y4dnQeg7XhE3j7oLBDDPStuB7nWVNdMSw9qMacuK9gAJVC8BZ+n\nd03ogmFhLjeSN5MHsDg9rr0Zspld0WfEFO9eX72fNH/bjMxCbZfSpej7NcB/4LzP\nF/slgroGzBD57TBLk5CZi8Z6OQ==\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@quiz-german.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=112664334990274609578
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40quiz-german.iam.gserviceaccount.com
```

## 🚀 Setup Steps

### 1. Run Database Migration

```bash
# Run the migration to add Firebase fields
npm run db:migrate
```

### 2. Start the Server

```bash
npm run dev
```

The server will automatically initialize Firebase Admin SDK on startup.

## 📱 Mobile App Integration

### Firebase Client SDK Setup

In your mobile app (React Native, Flutter, etc.), configure Firebase:

```javascript
// React Native example
import auth from '@react-native-firebase/auth';

// Sign in with email/password
const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const token = await userCredential.user.getIdToken();
    return token;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Sign up with email/password
const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const token = await userCredential.user.getIdToken();
    return token;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};
```

### API Authentication

Use the Firebase ID token in API requests:

```javascript
// Make authenticated API requests
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const token = await auth().currentUser.getIdToken();
  
  const response = await fetch(`http://your-api-url${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept-Language': 'de', // For German language
      ...options.headers
    }
  });
  
  return response.json();
};
```

## 🔧 API Endpoints

### Authentication Endpoints

#### Verify Firebase Token
```bash
POST /api/v1/auth/verify
Content-Type: application/json

{
  "token": "firebase_id_token_here"
}
```

#### Register Driver
```bash
POST /api/v1/auth/register/driver
Content-Type: application/json

{
  "token": "firebase_id_token_here",
  "driver_license_number": "DL123456789",
  "phone_number": "+49123456789",
  "preferred_language": "de"
}
```

#### Register Admin
```bash
POST /api/v1/auth/register/admin
Authorization: Bearer firebase_id_token_here
Content-Type: application/json

{
  "token": "firebase_id_token_here",
  "admin_code": "ADMIN123",
  "name": "Admin Name",
  "role": "admin"
}
```

#### Get User Profile
```bash
GET /api/v1/auth/profile
Authorization: Bearer firebase_id_token_here
```

#### Update User Profile
```bash
PUT /api/v1/auth/profile
Authorization: Bearer firebase_id_token_here
Content-Type: application/json

{
  "name": "Updated Name",
  "phone_number": "+49123456789",
  "language": "de"
}
```

### Protected Quiz Endpoints

All quiz endpoints now support Firebase authentication:

```bash
# Start quiz (authenticated)
POST /api/v1/quiz/start/driver-id
Authorization: Bearer firebase_id_token_here
Content-Type: application/json

{
  "language": "de",
  "count": 5,
  "topic": "Traffic Rules"
}
```

## 🛡️ Security Features

### Custom Claims

The system automatically sets custom claims for users:

- **Drivers**: `{ driver: true, driverId: "uuid" }`
- **Admins**: `{ admin: true, adminId: "uuid", role: "admin" }`

### Middleware Protection

Use the provided middleware to protect routes:

```javascript
const { verifyFirebaseAuth, requireAdmin, requireDriver } = require('./middlewares/firebaseAuth');

// Require authentication
router.get('/protected', verifyFirebaseAuth, (req, res) => {
  // req.firebaseUser contains user info
});

// Require admin role
router.get('/admin-only', verifyFirebaseAuth, requireAdmin, (req, res) => {
  // Only admins can access
});

// Require driver role
router.get('/driver-only', verifyFirebaseAuth, requireDriver, (req, res) => {
  // Only drivers can access
});
```

## 🧪 Testing

### Test Firebase Authentication

```bash
# Test with curl
curl -X POST http://localhost:3000/api/v1/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "your_firebase_token_here"}'
```

### Test Protected Endpoints

```bash
# Test authenticated request
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer your_firebase_token_here"
```

## 🔄 Migration from Existing System

The system supports both Firebase and traditional authentication:

1. **Existing users** can continue using username/password
2. **New users** can register with Firebase
3. **Gradual migration** is possible

## 🚨 Important Security Notes

1. **Never commit** the Firebase service account key to version control
2. **Use environment variables** for production
3. **Rotate keys** regularly
4. **Monitor** Firebase usage in the console
5. **Set up** proper Firebase security rules

## 📚 Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [React Native Firebase](https://rnfirebase.io/)
- [Flutter Firebase](https://firebase.flutter.dev/)

## 🆘 Troubleshooting

### Common Issues

1. **"Firebase Admin SDK not initialized"**
   - Check if the service account file path is correct
   - Verify environment variables are set

2. **"Invalid Firebase token"**
   - Ensure the token is fresh (tokens expire)
   - Check if the token is properly formatted

3. **"User not found"**
   - User might not be registered in the local database
   - Check if the Firebase UID matches

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will provide detailed Firebase initialization and authentication logs.

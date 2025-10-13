const express = require('express');
const AuthController = require('../controllers/AuthController');
const {
    verifyFirebaseToken
} = require('../middlewares/firebaseAuth');
const {
    languageMiddleware
} = require('../utils/responseMessages');
const router = express.Router();

// Apply language middleware
router.use(languageMiddleware);

/**
 * @swagger
 * /api/v1/auth/status:
 *   get:
 *     summary: Get authentication status
 *     description: Check if authentication is working
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Authentication status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Authentication system ready"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "ready"
 *                     firebase:
 *                       type: string
 *                       example: "not_configured"
 */
router.get('/status', (req, res) => {
    res.json({
        success: true,
        message: 'Authentication system ready',
        data: {
            status: 'ready',
            firebase: 'not_configured',
            supabase: 'connected'
        }
    });
});

/**
 * @swagger
 * /api/v1/auth/test:
 *   get:
 *     summary: Test authentication endpoint
 *     description: Simple test endpoint for authentication
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Test successful
 */
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Auth test endpoint working',
        timestamp: new Date().toISOString()
    });
});

/**
 * @swagger
 * /api/v1/auth/firebase-test:
 *   get:
 *     summary: Test Firebase authentication
 *     description: Test Firebase token verification
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Firebase authentication successful
 *       401:
 *         description: Invalid or missing Firebase token
 */
router.get('/firebase-test', verifyFirebaseToken, AuthController.testAuth);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login driver with Firebase token
 *     description: Authenticate driver using Firebase ID token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcm_token:
 *                 type: string
 *                 description: Firebase Cloud Messaging token
 *               language:
 *                 type: string
 *                 enum: [en, de]
 *                 default: en
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid Firebase token
 */
router.post('/login', verifyFirebaseToken, AuthController.loginDriver);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get driver profile
 *     description: Get driver profile information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Invalid Firebase token
 *       404:
 *         description: Driver not found
 */
router.get('/profile', verifyFirebaseToken, AuthController.getDriverProfile);

module.exports = router;
const express = require('express');
const AuthController = require('../controllers/AuthController');
const DriverController = require('../controllers/DriverController');
const QuizController = require('../controllers/QuizController');
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
 *     tags: [Drivers]
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
 *     tags: [Drivers]
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
 *     tags: [Drivers]
 *     security:
 *       - firebaseAuth: []
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
 *     tags: [Drivers]
 *     security:
 *       - firebaseAuth: []
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
 *     tags: [Drivers]
 *     security:
 *       - firebaseAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Invalid Firebase token
 *       404:
 *         description: Driver not found
 */
router.get('/profile', verifyFirebaseToken, AuthController.getDriverProfile);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     summary: Update driver profile
 *     description: Update driver profile information (authenticated driver only)
 *     tags: [Drivers]
 *     security:
 *       - firebaseAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "+1234567890"
 *               fcm_token:
 *                 type: string
 *                 example: "fcm_token_123"
 *               device_token:
 *                 type: string
 *                 example: "device_token_456"
 *               language:
 *                 type: string
 *                 enum: [en, fr, es, de, it, pt, ru, zh, ja, ko]
 *                 example: "en"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: "male"
 *               address_line1:
 *                 type: string
 *                 example: "123 Main Street"
 *               address_line2:
 *                 type: string
 *                 example: "Apt 4B"
 *               city:
 *                 type: string
 *                 example: "Berlin"
 *               state_province:
 *                 type: string
 *                 example: "Berlin"
 *               postal_code:
 *                 type: string
 *                 example: "10115"
 *               country:
 *                 type: string
 *                 example: "Germany"
 *               driver_license_number:
 *                 type: string
 *                 example: "DL123456789"
 *               license_issue_date:
 *                 type: string
 *                 format: date
 *                 example: "2020-01-01"
 *               license_expiry_date:
 *                 type: string
 *                 format: date
 *                 example: "2030-01-01"
 *               emergency_contact_name:
 *                 type: string
 *                 example: "Jane Doe"
 *               emergency_contact_phone:
 *                 type: string
 *                 example: "+1234567890"
 *               emergency_contact_relationship:
 *                 type: string
 *                 example: "Spouse"
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: "Profile updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     firebase_uid:
 *                       type: string
 *                       example: "firebase_uid_123"
 *                     phone_number:
 *                       type: string
 *                       example: "+1234567890"
 *                     language:
 *                       type: string
 *                       example: "en"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                       example: "1990-01-01"
 *                     gender:
 *                       type: string
 *                       example: "male"
 *                     address:
 *                       type: object
 *                       properties:
 *                         line1:
 *                           type: string
 *                           example: "123 Main Street"
 *                         line2:
 *                           type: string
 *                           example: "Apt 4B"
 *                         city:
 *                           type: string
 *                           example: "Berlin"
 *                         state_province:
 *                           type: string
 *                           example: "Berlin"
 *                         postal_code:
 *                           type: string
 *                           example: "10115"
 *                         country:
 *                           type: string
 *                           example: "Germany"
 *                     license:
 *                       type: object
 *                       properties:
 *                         number:
 *                           type: string
 *                           example: "DL123456789"
 *                         issue_date:
 *                           type: string
 *                           format: date
 *                           example: "2020-01-01"
 *                         expiry_date:
 *                           type: string
 *                           format: date
 *                           example: "2030-01-01"
 *                     emergency_contact:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Jane Doe"
 *                         phone:
 *                           type: string
 *                           example: "+1234567890"
 *                         relationship:
 *                           type: string
 *                           example: "Spouse"
 *                     profile_completed:
 *                       type: boolean
 *                       example: true
 *                     profile_completion_percentage:
 *                       type: integer
 *                       example: 85
 *                     quiz_stats:
 *                       type: object
 *                       properties:
 *                         total_quizzes:
 *                           type: integer
 *                           example: 10
 *                         total_correct:
 *                           type: integer
 *                           example: 45
 *                         accuracy:
 *                           type: integer
 *                           example: 90
 *                         streak:
 *                           type: integer
 *                           example: 5
 *                         last_quiz_date:
 *                           type: string
 *                           format: date
 *                           example: "2024-01-01"
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Email must be a valid email address"]
 *       401:
 *         description: Invalid Firebase token
 *       404:
 *         description: Driver not found
 */
router.put('/profile', verifyFirebaseToken, DriverController.updateDriverProfile);

/**
 * @swagger
 * /api/v1/auth/daily-quiz:
 *   get:
 *     summary: Get daily quiz for driver
 *     description: Get today's quiz questions for authenticated driver
 *     tags: [Drivers]
 *     security:
 *       - firebaseAuth: []
 *     responses:
 *       200:
 *         description: Daily quiz retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     questions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/QuizQuestion'
 *                     session_id:
 *                       type: integer
 *                       example: 1
 *                     language:
 *                       type: string
 *                       example: "en"
 *       400:
 *         description: Quiz already completed today
 *       404:
 *         description: No questions available
 */
router.get('/daily-quiz', verifyFirebaseToken, QuizController.getDailyQuiz);

/**
 * @swagger
 * /api/v1/auth/quiz/answer:
 *   post:
 *     summary: Submit quiz answer
 *     description: Submit an answer to a quiz question (authenticated driver)
 *     tags: [Drivers]
 *     security:
 *       - firebaseAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question_id, selected_option]
 *             properties:
 *               question_id:
 *                 type: integer
 *                 example: 1
 *               selected_option:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 3
 *                 example: 0
 *     responses:
 *       200:
 *         description: Answer submitted successfully
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
 *                   example: "Answer submitted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     correct:
 *                       type: boolean
 *                       example: true
 *                     correct_option:
 *                       type: integer
 *                       example: 0
 *                     explanation:
 *                       type: string
 *                       example: "School zones typically have a speed limit of 20 km/h for safety."
 *                     session_stats:
 *                       type: object
 *                       properties:
 *                         total_questions:
 *                           type: integer
 *                           example: 3
 *                         total_correct:
 *                           type: integer
 *                           example: 2
 *                         score:
 *                           type: number
 *                           format: float
 *                           example: 66.67
 *       404:
 *         description: Quiz session or question not found
 */
router.post('/quiz/answer', verifyFirebaseToken, QuizController.submitDailyQuizAnswer);

/**
 * @swagger
 * /api/v1/auth/quiz/complete:
 *   post:
 *     summary: Complete daily quiz
 *     description: Mark today's quiz as completed (authenticated driver)
 *     tags: [Drivers]
 *     security:
 *       - firebaseAuth: []
 *     responses:
 *       200:
 *         description: Quiz completed successfully
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
 *                   example: "Quiz completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     session_id:
 *                       type: integer
 *                       example: 1
 *                     total_questions:
 *                       type: integer
 *                       example: 5
 *                     total_correct:
 *                       type: integer
 *                       example: 4
 *                     score:
 *                       type: number
 *                       format: float
 *                       example: 80.0
 *                     completed:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Quiz session not found
 */
router.post('/quiz/complete', verifyFirebaseToken, QuizController.completeDailyQuiz);

/**
 * @swagger
 * /api/v1/auth/quiz/history:
 *   get:
 *     summary: Get driver quiz history
 *     description: Get quiz history for authenticated driver
 *     tags: [Drivers]
 *     security:
 *       - firebaseAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Number of sessions to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Number of sessions to skip
 *     responses:
 *       200:
 *         description: Quiz history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/QuizSession'
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     offset:
 *                       type: integer
 *                       example: 0
 */
router.get('/quiz/history', verifyFirebaseToken, QuizController.getDriverQuizHistory);

module.exports = router;
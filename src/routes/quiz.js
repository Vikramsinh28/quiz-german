const express = require('express');
const QuizController = require('../controllers/QuizController');
const {
    languageMiddleware
} = require('../utils/responseMessages');
const router = express.Router();

// Apply language middleware
router.use(languageMiddleware);

/**
 * @swagger
 * /api/v1/quiz/session/{driverId}:
 *   get:
 *     summary: Get quiz session for driver
 *     description: Get or create today's quiz session for a driver
 *     tags: [Quiz]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Driver ID
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [en, de]
 *           default: en
 *         description: Language for quiz content
 *     responses:
 *       200:
 *         description: Quiz session retrieved successfully
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
 *                   example: Operation successful.
 *                 data:
 *                   type: object
 *                   properties:
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           question_text:
 *                             type: string
 *                             example: "What is the speed limit in school zones?"
 *                           options:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["20 km/h", "30 km/h", "40 km/h", "50 km/h"]
 *                           topic:
 *                             type: string
 *                             example: "Traffic Rules"
 *                     session_id:
 *                       type: integer
 *                       example: 1
 *                     language:
 *                       type: string
 *                       example: "en"
 *       400:
 *         description: Quiz already completed today
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No questions available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/session/:driverId', QuizController.getQuizSession);

/**
 * @swagger
 * /api/v1/quiz/start:
 *   post:
 *     summary: Start quiz session
 *     description: Start a new quiz session for a driver
 *     tags: [Quiz]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [driverId]
 *             properties:
 *               driverId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               language:
 *                 type: string
 *                 enum: [en, de]
 *                 default: en
 *                 example: en
 *     responses:
 *       200:
 *         description: Quiz started successfully
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
 *                   example: Operation successful.
 *                 data:
 *                   type: object
 *                   properties:
 *                     session_id:
 *                       type: integer
 *                       example: 1
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           question_text:
 *                             type: string
 *                             example: "What is the speed limit in school zones?"
 *                           options:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["20 km/h", "30 km/h", "40 km/h", "50 km/h"]
 *                           topic:
 *                             type: string
 *                             example: "Traffic Rules"
 *                     language:
 *                       type: string
 *                       example: "en"
 *       400:
 *         description: Quiz already completed today
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No questions available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/start', QuizController.startQuiz);

/**
 * @swagger
 * /api/v1/quiz/answer:
 *   post:
 *     summary: Submit answer
 *     description: Submit an answer to a quiz question
 *     tags: [Quiz]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [session_id, question_id, selected_option]
 *             properties:
 *               session_id:
 *                 type: integer
 *                 example: 1
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
 *                   example: Answer submitted successfully
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/answer', QuizController.submitAnswer);

/**
 * @swagger
 * /api/v1/quiz/complete/{sessionId}:
 *   post:
 *     summary: Complete quiz
 *     description: Mark a quiz session as completed
 *     tags: [Quiz]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz session ID
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
 *                   example: Quiz completed successfully
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/complete/:sessionId', QuizController.completeQuiz);

/**
 * @swagger
 * /api/v1/quiz/history/{driverId}:
 *   get:
 *     summary: Get quiz history
 *     description: Retrieve quiz history for a driver
 *     tags: [Quiz]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Driver ID
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
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           quiz_date:
 *                             type: string
 *                             format: date
 *                             example: "2024-01-01"
 *                           total_questions:
 *                             type: integer
 *                             example: 5
 *                           total_correct:
 *                             type: integer
 *                             example: 4
 *                           score:
 *                             type: number
 *                             format: float
 *                             example: 80.0
 *                           completed:
 *                             type: boolean
 *                             example: true
 *                           created_at:
 *                             type: string
 *                             format: date-time
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
router.get('/history/:driverId', QuizController.getQuizHistory);

/**
 * @swagger
 * /api/v1/quiz/session/{sessionId}:
 *   get:
 *     summary: Get quiz session details
 *     description: Retrieve detailed information about a quiz session
 *     tags: [Quiz]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz session ID
 *     responses:
 *       200:
 *         description: Quiz session details retrieved successfully
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
 *                     session:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         driver_id:
 *                           type: string
 *                           format: uuid
 *                           example: "550e8400-e29b-41d4-a716-446655440000"
 *                         quiz_date:
 *                           type: string
 *                           format: date
 *                           example: "2024-01-01"
 *                         total_questions:
 *                           type: integer
 *                           example: 5
 *                         total_correct:
 *                           type: integer
 *                           example: 4
 *                         score:
 *                           type: number
 *                           format: float
 *                           example: 80.0
 *                         completed:
 *                           type: boolean
 *                           example: true
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                     responses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           question_id:
 *                             type: integer
 *                             example: 1
 *                           selected_option:
 *                             type: integer
 *                             example: 0
 *                           correct:
 *                             type: boolean
 *                             example: true
 *                           answered_at:
 *                             type: string
 *                             format: date-time
 *       404:
 *         description: Quiz session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/session/:sessionId', QuizController.getQuizSessionDetails);

/**
 * @swagger
 * /api/v1/quiz/stats/{driverId}:
 *   get:
 *     summary: Get driver statistics
 *     description: Retrieve detailed statistics for a driver
 *     tags: [Quiz]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Driver ID
 *     responses:
 *       200:
 *         description: Driver statistics retrieved successfully
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
 *                     driver:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: "550e8400-e29b-41d4-a716-446655440000"
 *                         total_quizzes:
 *                           type: integer
 *                           example: 10
 *                         total_correct:
 *                           type: integer
 *                           example: 45
 *                         streak:
 *                           type: integer
 *                           example: 5
 *                         last_quiz_date:
 *                           type: string
 *                           format: date
 *                           example: "2024-01-01"
 *                         accuracy:
 *                           type: number
 *                           format: float
 *                           example: 90.0
 *                     sessions:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 10
 *                         total_correct:
 *                           type: integer
 *                           example: 45
 *                         total_questions:
 *                           type: integer
 *                           example: 50
 *                         overall_accuracy:
 *                           type: integer
 *                           example: 90
 *       404:
 *         description: Driver not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats/:driverId', QuizController.getDriverStats);

module.exports = router;
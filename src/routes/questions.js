const express = require('express');
const QuestionController = require('../controllers/QuestionController');
const {
    languageMiddleware
} = require('../utils/responseMessages');
const router = express.Router();

// Apply language middleware
router.use(languageMiddleware);

/**
 * @swagger
 * /api/v1/questions/random:
 *   get:
 *     summary: Get random questions
 *     description: Retrieve random questions for quiz
 *     tags: [Questions]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 5
 *           minimum: 1
 *           maximum: 20
 *         description: Number of random questions to return
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [en, de]
 *           default: en
 *         description: Language for question content
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *         description: Filter by topic
 *     responses:
 *       200:
 *         description: Random questions retrieved successfully
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
 *                           explanation:
 *                             type: string
 *                             example: "School zones typically have a speed limit of 20 km/h for safety."
 *                     count:
 *                       type: integer
 *                       example: 5
 *                     language:
 *                       type: string
 *                       example: "en"
 *       404:
 *         description: No questions available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/random', QuestionController.getRandomQuestions);

/**
 * @swagger
 * /api/v1/questions/{id}:
 *   get:
 *     summary: Get question by ID
 *     description: Retrieve a specific question by ID
 *     tags: [Questions]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [en, de]
 *           default: en
 *         description: Language for question content
 *     responses:
 *       200:
 *         description: Question retrieved successfully
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
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     question_text:
 *                       type: string
 *                       example: "What is the speed limit in school zones?"
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["20 km/h", "30 km/h", "40 km/h", "50 km/h"]
 *                     topic:
 *                       type: string
 *                       example: "Traffic Rules"
 *                     explanation:
 *                       type: string
 *                       example: "School zones typically have a speed limit of 20 km/h for safety."
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total_responses:
 *                           type: integer
 *                           example: 150
 *                         correct_responses:
 *                           type: integer
 *                           example: 120
 *                         accuracy:
 *                           type: integer
 *                           example: 80
 *       404:
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', QuestionController.getQuestionById);

/**
 * @swagger
 * /api/v1/questions/topic/{topic}:
 *   get:
 *     summary: Get questions by topic
 *     description: Retrieve questions filtered by topic
 *     tags: [Questions]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: topic
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Number of questions to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Number of questions to skip
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [en, de]
 *           default: en
 *         description: Language for question content
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
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
 *                           explanation:
 *                             type: string
 *                             example: "School zones typically have a speed limit of 20 km/h for safety."
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     offset:
 *                       type: integer
 *                       example: 0
 *                     topic:
 *                       type: string
 *                       example: "Traffic Rules"
 */
router.get('/topic/:topic', QuestionController.getQuestionsByTopic);

/**
 * @swagger
 * /api/v1/questions/topics:
 *   get:
 *     summary: Get all topics
 *     description: Retrieve a list of all available topics
 *     tags: [Questions]
 *     security: []
 *     responses:
 *       200:
 *         description: Topics retrieved successfully
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
 *                     topics:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Traffic Rules", "Safety", "Driving Rules", "Traffic Signs"]
 */
router.get('/topics', QuestionController.getAllTopics);

module.exports = router;
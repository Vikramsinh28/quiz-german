const express = require('express');
const DriverController = require('../controllers/DriverController');
const router = express.Router();

/**
 * @swagger
 * /api/v1/drivers:
 *   post:
 *     summary: Create a new driver
 *     description: Create a new driver account
 *     tags: [Drivers]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [en, de]
 *                 default: en
 *                 example: en
 *               device_token:
 *                 type: string
 *                 example: "device_token_123"
 *     responses:
 *       201:
 *         description: Driver created successfully
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
 *                   example: Driver created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     language:
 *                       type: string
 *                       example: "en"
 *                     device_token:
 *                       type: string
 *                       example: "device_token_123"
 *                     total_quizzes:
 *                       type: integer
 *                       example: 0
 *                     total_correct:
 *                       type: integer
 *                       example: 0
 *                     streak:
 *                       type: integer
 *                       example: 0
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', DriverController.createDriver);

/**
 * @swagger
 * /api/v1/drivers/{id}:
 *   get:
 *     summary: Get driver by ID
 *     description: Retrieve a specific driver by ID
 *     tags: [Drivers]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Driver ID
 *     responses:
 *       200:
 *         description: Driver retrieved successfully
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
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     language:
 *                       type: string
 *                       example: "en"
 *                     device_token:
 *                       type: string
 *                       example: "device_token_123"
 *                     total_quizzes:
 *                       type: integer
 *                       example: 10
 *                     total_correct:
 *                       type: integer
 *                       example: 45
 *                     streak:
 *                       type: integer
 *                       example: 5
 *                     last_quiz_date:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-01"
 *                     accuracy:
 *                       type: number
 *                       format: float
 *                       example: 90.0
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Driver not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', DriverController.getDriverById);

/**
 * @swagger
 * /api/v1/drivers/{id}:
 *   put:
 *     summary: Update driver information
 *     description: Update driver information
 *     tags: [Drivers]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Driver ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [en, de]
 *                 example: de
 *               device_token:
 *                 type: string
 *                 example: "new_device_token_456"
 *     responses:
 *       200:
 *         description: Driver updated successfully
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
 *                   example: Driver updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     language:
 *                       type: string
 *                       example: "de"
 *                     device_token:
 *                       type: string
 *                       example: "new_device_token_456"
 *                     total_quizzes:
 *                       type: integer
 *                       example: 10
 *                     total_correct:
 *                       type: integer
 *                       example: 45
 *                     streak:
 *                       type: integer
 *                       example: 5
 *                     last_quiz_date:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-01"
 *                     accuracy:
 *                       type: number
 *                       format: float
 *                       example: 90.0
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Driver not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', DriverController.updateDriver);

/**
 * @swagger
 * /api/v1/drivers/{id}/language:
 *   patch:
 *     summary: Update driver language
 *     description: Update driver language preference
 *     tags: [Drivers]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Driver ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [language]
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [en, de]
 *                 example: de
 *     responses:
 *       200:
 *         description: Driver language updated successfully
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
 *                   example: Driver language updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     language:
 *                       type: string
 *                       example: "de"
 *       400:
 *         description: Invalid language
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Driver not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/language', DriverController.updateDriverLanguage);

/**
 * @swagger
 * /api/v1/drivers/{id}/device-token:
 *   patch:
 *     summary: Update driver device token
 *     description: Update driver device token for push notifications
 *     tags: [Drivers]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Driver ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [device_token]
 *             properties:
 *               device_token:
 *                 type: string
 *                 example: "new_device_token_456"
 *     responses:
 *       200:
 *         description: Device token updated successfully
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
 *                   example: Device token updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     device_token:
 *                       type: string
 *                       example: "new_device_token_456"
 *       400:
 *         description: Device token is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Driver not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/device-token', DriverController.updateDeviceToken);

/**
 * @swagger
 * /api/v1/drivers/{id}/stats:
 *   get:
 *     summary: Get driver statistics
 *     description: Retrieve detailed statistics for a driver
 *     tags: [Drivers]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *                         language:
 *                           type: string
 *                           example: "en"
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
router.get('/:id/stats', DriverController.getDriverStats);

module.exports = router;
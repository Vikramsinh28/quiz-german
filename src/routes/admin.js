const express = require('express');
const AdminController = require('../controllers/AdminController');
const QuestionController = require('../controllers/QuestionController');
const QuoteController = require('../controllers/QuoteController');
const DriverController = require('../controllers/DriverController');
const {
    authenticateToken,
    requireRole,
    logAdminAction,
    loginRateLimit,
    adminRateLimit
} = require('../middlewares/auth');
const router = express.Router();

// Apply rate limiting
router.use(adminRateLimit);

// ==================== AUTHENTICATION ====================

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticate admin user and get JWT token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             username: admin
 *             password: admin123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 */
router.post('/login', loginRateLimit, AdminController.login);

/**
 * @swagger
 * /api/v1/admin/logout:
 *   post:
 *     summary: Admin logout
 *     description: Logout admin user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authenticateToken, AdminController.logout);

/**
 * @swagger
 * /api/v1/admin/verify:
 *   get:
 *     summary: Verify token
 *     description: Verify if the provided JWT token is valid
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 */
router.get('/verify', authenticateToken, AdminController.verifyToken);

/**
 * @swagger
 * /api/v1/admin/refresh:
 *   post:
 *     summary: Refresh token
 *     description: Get a new JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post('/refresh', authenticateToken, AdminController.refreshToken);

// ==================== ADMIN MANAGEMENT ====================

/**
 * @swagger
 * /api/v1/admin/profile:
 *   get:
 *     summary: Get admin profile
 *     description: Get current admin user profile
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
router.get('/profile', authenticateToken, AdminController.getProfile);

/**
 * @swagger
 * /api/v1/admin/create:
 *   post:
 *     summary: Create new admin
 *     description: Create a new admin user (admin role only)
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: newadmin
 *               password:
 *                 type: string
 *                 format: password
 *                 example: newpass123
 *               role:
 *                 type: string
 *                 enum: [admin, editor, viewer]
 *                 default: editor
 *                 example: editor
 *     responses:
 *       201:
 *         description: Admin created successfully
 */
router.post('/create', authenticateToken, requireRole(['admin']), logAdminAction('CREATE_ADMIN'), AdminController.createAdmin);

/**
 * @swagger
 * /api/v1/admin/change-password:
 *   patch:
 *     summary: Change admin password
 *     description: Change current admin password
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: oldpass123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: newpass123
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.patch('/change-password', authenticateToken, logAdminAction('CHANGE_PASSWORD'), AdminController.changePassword);

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     description: Retrieve dashboard statistics including question counts, user stats, and recent activity
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 */
router.get('/dashboard', authenticateToken, requireRole(['admin', 'editor', 'viewer']), AdminController.getDashboard);

/**
 * @swagger
 * /api/v1/admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     description: Retrieve audit logs with filtering options
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of logs to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of logs to skip
 *       - in: query
 *         name: actor
 *         schema:
 *           type: string
 *         description: Filter by actor
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 */
router.get('/audit-logs', authenticateToken, requireRole(['admin']), AdminController.getAuditLogs);

// ==================== QUESTION MANAGEMENT ====================

/**
 * @swagger
 * /api/v1/admin/questions:
 *   get:
 *     summary: Get all questions (admin)
 *     description: Retrieve all questions with filtering options
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of questions to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of questions to skip
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *         description: Filter by topic
 *       - in: query
 *         name: active_only
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Show only active questions
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 */
router.get('/questions', authenticateToken, requireRole(['admin', 'editor', 'viewer']), QuestionController.getAllQuestions);

/**
 * @swagger
 * /api/v1/admin/questions:
 *   post:
 *     summary: Create new question
 *     description: Create a new question with multilingual support
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question_text, options, correct_option]
 *             properties:
 *               question_text:
 *                 type: object
 *                 properties:
 *                   en:
 *                     type: string
 *                     example: "What is the speed limit in residential areas?"
 *                   de:
 *                     type: string
 *                     example: "Wie hoch ist die Geschwindigkeitsbegrenzung in Wohngebieten?"
 *               options:
 *                 type: object
 *                 properties:
 *                   en:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["30 km/h", "50 km/h", "60 km/h", "70 km/h"]
 *                   de:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["30 km/h", "50 km/h", "60 km/h", "70 km/h"]
 *               correct_option:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 3
 *                 example: 0
 *               explanation:
 *                 type: object
 *                 properties:
 *                   en:
 *                     type: string
 *                     example: "The speed limit is 30 km/h in residential areas."
 *                   de:
 *                     type: string
 *                     example: "Die Geschwindigkeitsbegrenzung beträgt 30 km/h in Wohngebieten."
 *               topic:
 *                 type: string
 *                 example: "Traffic Rules"
 *               language:
 *                 type: string
 *                 enum: [en, de]
 *                 default: en
 *                 example: en
 *     responses:
 *       201:
 *         description: Question created successfully
 */
router.post('/questions', authenticateToken, requireRole(['admin', 'editor']), logAdminAction('CREATE_QUESTION'), QuestionController.createQuestion);

/**
 * @swagger
 * /api/v1/admin/questions/{id}:
 *   get:
 *     summary: Get question by ID (admin)
 *     description: Retrieve a specific question with full details
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 */
router.get('/questions/:id', authenticateToken, requireRole(['admin', 'editor', 'viewer']), QuestionController.getQuestionByIdAdmin);

/**
 * @swagger
 * /api/v1/admin/questions/{id}:
 *   put:
 *     summary: Update question
 *     description: Update an existing question
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question_text:
 *                 type: object
 *                 properties:
 *                   en:
 *                     type: string
 *                   de:
 *                     type: string
 *               options:
 *                 type: object
 *                 properties:
 *                   en:
 *                     type: array
 *                     items:
 *                       type: string
 *                   de:
 *                     type: array
 *                     items:
 *                       type: string
 *               correct_option:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 3
 *               explanation:
 *                 type: object
 *                 properties:
 *                   en:
 *                     type: string
 *                   de:
 *                     type: string
 *               topic:
 *                 type: string
 *               language:
 *                 type: string
 *                 enum: [en, de]
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Question updated successfully
 */
router.put('/questions/:id', authenticateToken, requireRole(['admin', 'editor']), logAdminAction('UPDATE_QUESTION'), QuestionController.updateQuestion);

/**
 * @swagger
 * /api/v1/admin/questions/{id}:
 *   delete:
 *     summary: Delete question (soft delete)
 *     description: Deactivate a question by setting is_active to false
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question deactivated successfully
 */
router.delete('/questions/:id', authenticateToken, requireRole(['admin', 'editor']), logAdminAction('DELETE_QUESTION'), QuestionController.deleteQuestion);
// ==================== QUOTE MANAGEMENT ====================

/**
 * @swagger
 * /api/v1/admin/quotes:
 *   get:
 *     summary: Get all quotes (admin)
 *     description: Retrieve all quotes with filtering options
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of quotes to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of quotes to skip
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [en, de]
 *         description: Filter by language
 *       - in: query
 *         name: active_only
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Show only active quotes
 *     responses:
 *       200:
 *         description: Quotes retrieved successfully
 */
router.get('/quotes', authenticateToken, requireRole(['admin', 'editor', 'viewer']), QuoteController.getAllQuotesAdmin);

/**
 * @swagger
 * /api/v1/admin/quotes:
 *   post:
 *     summary: Create new quote
 *     description: Create a new quote with multilingual support
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: object
 *                 properties:
 *                   en:
 *                     type: string
 *                     example: "Drive safely today and every day."
 *                   de:
 *                     type: string
 *                     example: "Fahren Sie heute und jeden Tag sicher."
 *               language:
 *                 type: string
 *                 enum: [en, de]
 *                 default: en
 *                 example: en
 *               scheduled_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *     responses:
 *       201:
 *         description: Quote created successfully
 */
router.post('/quotes', authenticateToken, requireRole(['admin', 'editor']), logAdminAction('CREATE_QUOTE'), QuoteController.createQuote);

/**
 * @swagger
 * /api/v1/admin/quotes/{id}:
 *   put:
 *     summary: Update quote
 *     description: Update an existing quote
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quote ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: object
 *                 properties:
 *                   en:
 *                     type: string
 *                   de:
 *                     type: string
 *               language:
 *                 type: string
 *                 enum: [en, de]
 *               scheduled_date:
 *                 type: string
 *                 format: date
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Quote updated successfully
 */
router.put('/quotes/:id', authenticateToken, requireRole(['admin', 'editor']), logAdminAction('UPDATE_QUOTE'), QuoteController.updateQuote);

/**
 * @swagger
 * /api/v1/admin/quotes/{id}:
 *   delete:
 *     summary: Delete quote (soft delete)
 *     description: Deactivate a quote by setting is_active to false
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quote ID
 *     responses:
 *       200:
 *         description: Quote deactivated successfully
 */
router.delete('/quotes/:id', authenticateToken, requireRole(['admin', 'editor']), logAdminAction('DELETE_QUOTE'), QuoteController.deleteQuote);

/**
 * @swagger
 * /api/v1/admin/quotes/{id}/schedule:
 *   patch:
 *     summary: Schedule quote
 *     description: Schedule a quote for a specific date
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quote ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [scheduled_date]
 *             properties:
 *               scheduled_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *     responses:
 *       200:
 *         description: Quote scheduled successfully
 */
router.patch('/quotes/:id/schedule', authenticateToken, requireRole(['admin', 'editor']), logAdminAction('SCHEDULE_QUOTE'), QuoteController.scheduleQuote);

// ==================== DRIVER MANAGEMENT ====================

/**
 * @swagger
 * /api/v1/admin/drivers:
 *   get:
 *     summary: Get all drivers (admin)
 *     description: Retrieve all drivers with filtering options
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of drivers to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of drivers to skip
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [en, de]
 *         description: Filter by language
 *       - in: query
 *         name: active_today
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Show only drivers active today
 *     responses:
 *       200:
 *         description: Drivers retrieved successfully
 */
router.get('/drivers', authenticateToken, requireRole(['admin', 'editor', 'viewer']), DriverController.getAllDrivers);

/**
 * @swagger
 * /api/v1/admin/drivers/{id}:
 *   get:
 *     summary: Get driver by ID (admin)
 *     description: Retrieve a specific driver with full details
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
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
 */
router.get('/drivers/:id', authenticateToken, requireRole(['admin', 'editor', 'viewer']), DriverController.getDriverById);

/**
 * @swagger
 * /api/v1/admin/drivers/{id}/stats:
 *   get:
 *     summary: Get driver statistics
 *     description: Retrieve detailed statistics for a specific driver
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
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
 */
router.get('/drivers/:id/stats', authenticateToken, requireRole(['admin', 'editor', 'viewer']), DriverController.getDriverStats);

/**
 * @swagger
 * /api/v1/admin/drivers/top:
 *   get:
 *     summary: Get top performing drivers
 *     description: Retrieve top performing drivers based on accuracy
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top drivers to return
 *       - in: query
 *         name: min_quizzes
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Minimum number of quizzes required
 *     responses:
 *       200:
 *         description: Top drivers retrieved successfully
 */
router.get('/drivers/top', authenticateToken, requireRole(['admin', 'editor', 'viewer']), DriverController.getTopDrivers);

/**
 * @swagger
 * /api/v1/admin/drivers/active-today:
 *   get:
 *     summary: Get active drivers today
 *     description: Retrieve drivers who took a quiz today
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of drivers to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of drivers to skip
 *     responses:
 *       200:
 *         description: Active drivers retrieved successfully
 */
router.get('/drivers/active-today', authenticateToken, requireRole(['admin', 'editor', 'viewer']), DriverController.getActiveDriversToday);

module.exports = router;
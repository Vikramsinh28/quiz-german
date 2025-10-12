const express = require('express');
const jwt = require('jsonwebtoken');
const {
    Admin,
    Question,
    Quote,
    Driver,
    QuizSession,
    AuditLog
} = require('../models');
const {
    authenticateToken,
    requireRole,
    logAdminAction,
    loginRateLimit,
    adminRateLimit,
    generateToken,
    validatePermission
} = require('../middlewares/auth');
const router = express.Router();

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
 *             example:
 *               success: true
 *               message: Login successful
 *               data:
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 admin:
 *                   id: 550e8400-e29b-41d4-a716-446655440001
 *                   username: admin
 *                   role: admin
 *                   created_at: 2024-01-01T00:00:00.000Z
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: Invalid credentials
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Admin login with rate limiting
router.post('/login', loginRateLimit, async (req, res, next) => {
    try {
        const {
            username,
            password
        } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const admin = await Admin.authenticate(username, password);
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token using the middleware function
        const token = generateToken(admin);

        // Log login action
        await AuditLog.logAdminAction(admin.username, 'LOGIN', {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                admin: {
                    id: admin.id,
                    username: admin.username,
                    role: admin.role,
                    created_at: admin.created_at
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/v1/admin/logout:
 *   post:
 *     summary: Admin logout
 *     description: Logout admin user (client-side token removal)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: Logout successful
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Admin logout (client-side token removal)
router.post('/logout', authenticateToken, logAdminAction('LOGOUT'), (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        data: {
            admin: {
                id: req.admin.id,
                username: req.admin.username,
                role: req.admin.role,
                created_at: req.admin.created_at
            }
        }
    });
});

// Refresh token endpoint
router.post('/refresh', authenticateToken, async (req, res, next) => {
    try {
        // Generate new token
        const newToken = generateToken(req.admin);

        // Log token refresh
        await AuditLog.logAdminAction(req.admin.username, 'REFRESH_TOKEN', {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                token: newToken,
                admin: {
                    id: req.admin.id,
                    username: req.admin.username,
                    role: req.admin.role,
                    created_at: req.admin.created_at
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Apply rate limiting to all admin routes
router.use(adminRateLimit);

/**
 * @swagger
 * /api/v1/admin/profile:
 *   get:
 *     summary: Get admin profile
 *     description: Get current authenticated admin profile information
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Admin'
 *             example:
 *               success: true
 *               data:
 *                 id: 550e8400-e29b-41d4-a716-446655440001
 *                 username: admin
 *                 role: admin
 *                 created_at: 2024-01-01T00:00:00.000Z
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get admin profile
router.get('/profile', authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: {
            id: req.admin.id,
            username: req.admin.username,
            role: req.admin.role,
            created_at: req.admin.created_at
        }
    });
});

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
 *                   example: Admin created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Admin'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Create new admin (only super admins can create other admins)
router.post('/create', authenticateToken, requireRole(['admin']), logAdminAction('CREATE_ADMIN'), async (req, res, next) => {
    try {
        const {
            username,
            password,
            role = 'editor'
        } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Validate role
        const validRoles = ['admin', 'editor', 'viewer'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be one of: admin, editor, viewer'
            });
        }

        // Check if username already exists
        const existingAdmin = await Admin.findOne({
            where: {
                username
            }
        });

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Create the admin
        const newAdmin = await Admin.createAdmin(username, password, role);

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: {
                id: newAdmin.id,
                username: newAdmin.username,
                role: newAdmin.role,
                created_at: newAdmin.created_at
            }
        });
    } catch (error) {
        next(error);
    }
});

// Change admin password
router.patch('/change-password', authenticateToken, async (req, res, next) => {
    try {
        const {
            current_password,
            new_password
        } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        // Verify current password
        const isValid = await req.admin.validatePassword(current_password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        await Admin.updatePassword(req.admin.id, new_password);

        // Log password change
        await AuditLog.logAdminAction(req.admin.username, 'CHANGE_PASSWORD');

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
});

// ==================== QUESTION MANAGEMENT ====================

// Get all questions (admin)
router.get('/questions', authenticateToken, requireRole(['admin', 'editor', 'viewer']), async (req, res, next) => {
    try {
        const {
            limit = 20, offset = 0, topic, language, active_only = true
        } = req.query;

        const whereClause = {};
        if (active_only === 'true') {
            whereClause.is_active = true;
        }
        if (topic) {
            whereClause.topic = topic;
        }
        if (language) {
            whereClause.language = language;
        }

        const questions = await Question.findAndCountAll({
            where: whereClause,
            order: [
                ['created_at', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [{
                model: Admin,
                as: 'creator',
                attributes: ['id', 'username']
            }]
        });

        res.json({
            success: true,
            data: {
                questions: questions.rows,
                total: questions.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        next(error);
    }
});

// Create new question
router.post('/questions', authenticateToken, requireRole(['admin', 'editor']), logAdminAction('CREATE_QUESTION'), async (req, res, next) => {
    try {
        const {
            question_text,
            options,
            correct_option,
            explanation,
            topic,
            language = 'en'
        } = req.body;

        if (!question_text || !options || correct_option === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Question text, options, and correct option are required'
            });
        }

        const question = await Question.create({
            question_text,
            options,
            correct_option,
            explanation,
            topic,
            language,
            created_by: req.admin.id,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            data: question
        });
    } catch (error) {
        next(error);
    }
});

// Update question
router.put('/questions/:id', authenticateToken, requireRole(['admin', 'editor']), logAdminAction('UPDATE_QUESTION'), async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const updateData = req.body;

        const question = await Question.findByPk(id);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        await question.update(updateData);

        res.json({
            success: true,
            message: 'Question updated successfully',
            data: question
        });
    } catch (error) {
        next(error);
    }
});

// Delete question (soft delete)
router.delete('/questions/:id', authenticateToken, requireRole(['admin', 'editor']), logAdminAction('DELETE_QUESTION'), async (req, res, next) => {
    try {
        const {
            id
        } = req.params;

        const question = await Question.findByPk(id);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        await question.update({
            is_active: false
        });

        res.json({
            success: true,
            message: 'Question deactivated successfully'
        });
    } catch (error) {
        next(error);
    }
});

// ==================== QUOTE MANAGEMENT ====================

// Get all quotes (admin)
router.get('/quotes', authenticateToken, requireRole(['admin', 'editor', 'viewer']), async (req, res, next) => {
    try {
        const {
            limit = 20, offset = 0, language, active_only = true
        } = req.query;

        const whereClause = {};
        if (active_only === 'true') {
            whereClause.is_active = true;
        }
        if (language) {
            whereClause.language = language;
        }

        const quotes = await Quote.findAndCountAll({
            where: whereClause,
            order: [
                ['created_at', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                quotes: quotes.rows,
                total: quotes.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        next(error);
    }
});

// Create new quote
router.post('/quotes', authenticateToken, requireRole(['admin', 'editor']), logAdminAction('CREATE_QUOTE'), async (req, res, next) => {
    try {
        const {
            text,
            language = 'en',
            scheduled_date
        } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Quote text is required'
            });
        }

        const quote = await Quote.create({
            text,
            language,
            scheduled_date,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'Quote created successfully',
            data: quote
        });
    } catch (error) {
        next(error);
    }
});

// Update quote
router.put('/quotes/:id', authenticateToken, requireRole(['admin', 'editor']), logAdminAction('UPDATE_QUOTE'), async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const updateData = req.body;

        const quote = await Quote.findByPk(id);
        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        await quote.update(updateData);

        res.json({
            success: true,
            message: 'Quote updated successfully',
            data: quote
        });
    } catch (error) {
        next(error);
    }
});

// Schedule quote for specific date
router.patch('/quotes/:id/schedule', authenticateToken, requireRole(['admin', 'editor']), logAdminAction('SCHEDULE_QUOTE'), async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const {
            scheduled_date
        } = req.body;

        if (!scheduled_date) {
            return res.status(400).json({
                success: false,
                message: 'Scheduled date is required'
            });
        }

        const quote = await Quote.scheduleQuote(id, scheduled_date);
        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        res.json({
            success: true,
            message: 'Quote scheduled successfully',
            data: quote
        });
    } catch (error) {
        next(error);
    }
});

// ==================== DASHBOARD STATS ====================

// Get dashboard statistics
router.get('/dashboard', authenticateToken, requireRole(['admin', 'editor', 'viewer']), async (req, res, next) => {
    try {
        const {
            period = '30'
        } = req.query; // days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        // Get basic counts
        const totalDrivers = await Driver.count();
        const totalQuestions = await Question.count({
            where: {
                is_active: true
            }
        });
        const totalQuotes = await Quote.count({
            where: {
                is_active: true
            }
        });
        const totalSessions = await QuizSession.count({
            where: {
                completed: true
            }
        });

        // Get recent activity
        const recentSessions = await QuizSession.count({
            where: {
                completed: true,
                created_at: {
                    [require('sequelize').Op.gte]: startDate
                }
            }
        });

        // Get average scores
        const avgScoreResult = await QuizSession.findOne({
            where: {
                completed: true
            },
            attributes: [
                [require('sequelize').fn('AVG', require('sequelize').literal('(total_correct::float / total_questions * 100)')), 'avg_score']
            ],
            raw: true
        });

        // Get top topics
        const topTopics = await Question.findAll({
            attributes: [
                'topic',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
            ],
            where: {
                is_active: true,
                topic: {
                    [require('sequelize').Op.ne]: null
                }
            },
            group: ['topic'],
            order: [
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']
            ],
            limit: 5,
            raw: true
        });

        res.json({
            success: true,
            data: {
                overview: {
                    total_drivers: totalDrivers,
                    total_questions: totalQuestions,
                    total_quotes: totalQuotes,
                    total_sessions: totalSessions,
                    recent_sessions: recentSessions,
                    average_score: avgScoreResult ? Math.round(avgScoreResult.avg_score) : 0
                },
                top_topics: topTopics.map(topic => ({
                    topic: topic.topic,
                    count: parseInt(topic.count)
                }))
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get audit logs
router.get('/audit-logs', authenticateToken, requireRole(['admin']), async (req, res, next) => {
    try {
        const {
            limit = 50, offset = 0, actor, action
        } = req.query;

        const whereClause = {};
        if (actor) {
            whereClause.actor = actor;
        }
        if (action) {
            whereClause.action = action;
        }

        const logs = await AuditLog.findAndCountAll({
            where: whereClause,
            order: [
                ['created_at', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                logs: logs.rows,
                total: logs.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
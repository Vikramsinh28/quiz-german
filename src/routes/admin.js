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
    logAdminAction
} = require('../middlewares/auth');
const router = express.Router();

// Admin login
router.post('/login', async (req, res, next) => {
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

        // Generate JWT token
        const token = jwt.sign({
                id: admin.id,
                username: admin.username,
                role: admin.role
            },
            process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN || '7d'
            }
        );

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
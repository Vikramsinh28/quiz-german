const {
    Admin,
    Question,
    Quote,
    Driver,
    QuizSession,
    AuditLog
} = require('../models');
const bcrypt = require('bcryptjs');
const {
    Op
} = require('sequelize');

class AdminService {
    /**
     * Authenticate admin user
     */
    static async authenticateAdmin(username, password) {
        const admin = await Admin.findOne({
            where: {
                username
            }
        });

        if (!admin) {
            return null;
        }

        const isValidPassword = await admin.validatePassword(password);
        if (!isValidPassword) {
            return null;
        }

        return admin;
    }

    /**
     * Create a new admin
     */
    static async createAdmin(username, password, role = 'editor') {
        const hashedPassword = await bcrypt.hash(password, 12);

        return await Admin.create({
            username,
            password_hash: hashedPassword,
            role
        });
    }

    /**
     * Get admin by ID
     */
    static async getAdminById(id) {
        return await Admin.findByPk(id);
    }

    /**
     * Update admin password
     */
    static async updateAdminPassword(id, newPassword) {
        const admin = await Admin.findByPk(id);
        if (!admin) {
            return null;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        admin.password_hash = hashedPassword;
        return await admin.save();
    }

    /**
     * Get dashboard statistics
     */
    static async getDashboardStats() {
        const today = new Date().toISOString().split('T')[0];

        // Get question statistics
        const totalQuestions = await Question.count();
        const activeQuestions = await Question.count({
            where: {
                is_active: true
            }
        });
        const questionsByLanguage = await Question.findAll({
            attributes: [
                'language',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
            ],
            where: {
                is_active: true
            },
            group: ['language']
        });

        // Get quote statistics
        const totalQuotes = await Quote.count();
        const activeQuotes = await Quote.count({
            where: {
                is_active: true
            }
        });

        // Get driver statistics
        const totalDrivers = await Driver.count();
        const activeDriversToday = await Driver.count({
            where: {
                last_quiz_date: today
            }
        });

        // Get quiz session statistics
        const totalQuizSessions = await QuizSession.count();
        const todayQuizSessions = await QuizSession.count({
            where: {
                quiz_date: today
            }
        });
        const completedQuizSessions = await QuizSession.count({
            where: {
                completed: true
            }
        });

        // Format language statistics
        const languageStats = {};
        questionsByLanguage.forEach(stat => {
            languageStats[stat.language] = parseInt(stat.dataValues.count);
        });

        return {
            questions: {
                total: totalQuestions,
                active: activeQuestions,
                by_language: languageStats
            },
            quotes: {
                total: totalQuotes,
                active: activeQuotes
            },
            drivers: {
                total: totalDrivers,
                active_today: activeDriversToday
            },
            quiz_sessions: {
                total: totalQuizSessions,
                today: todayQuizSessions,
                completed: completedQuizSessions
            }
        };
    }

    /**
     * Get audit logs
     */
    static async getAuditLogs(options = {}) {
        const {
            limit = 50,
                offset = 0,
                actor,
                action,
                startDate,
                endDate
        } = options;

        const whereClause = {};
        if (actor) {
            whereClause.actor = actor;
        }
        if (action) {
            whereClause.action = action;
        }
        if (startDate || endDate) {
            whereClause.created_at = {};
            if (startDate) {
                whereClause.created_at[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                whereClause.created_at[Op.lte] = new Date(endDate);
            }
        }

        return await AuditLog.findAndCountAll({
            where: whereClause,
            order: [
                ['created_at', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    }

    /**
     * Log admin action
     */
    static async logAdminAction(actor, action, meta = null) {
        return await AuditLog.create({
            actor,
            action,
            meta
        });
    }

    /**
     * Validate admin data
     */
    static validateAdminData(data) {
        const errors = [];

        if (!data.username) {
            errors.push('Username is required');
        } else if (data.username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        }

        if (!data.password) {
            errors.push('Password is required');
        } else if (data.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        if (data.role && !['admin', 'editor', 'viewer'].includes(data.role)) {
            errors.push('Role must be one of: admin, editor, viewer');
        }

        return errors;
    }

    /**
     * Check if username exists
     */
    static async usernameExists(username) {
        const admin = await Admin.findOne({
            where: {
                username
            }
        });
        return !!admin;
    }
}

module.exports = AdminService;
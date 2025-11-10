const AdminService = require('../services/AdminService');
const {
    generateToken
} = require('../middlewares/auth');

class AdminController {
    /**
     * Admin login
     */
    static async login(req, res, next) {
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

            const admin = await AdminService.authenticateAdmin(username, password);
            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Log the login action
            await AdminService.logAdminAction(username, 'LOGIN');

            const token = generateToken({
                id: admin.id,
                username: admin.username,
                role: admin.role
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
    }

    /**
     * Admin logout
     */
    static async logout(req, res, next) {
        try {
            // Log the logout action
            await AdminService.logAdminAction(req.admin.username, 'LOGOUT');

            res.json({
                success: true,
                message: 'Logout successful'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verify token
     */
    static async verifyToken(req, res, next) {
        try {
            res.json({
                success: true,
                message: 'Token is valid',
                data: {
                    admin: {
                        id: req.admin.id,
                        username: req.admin.username,
                        role: req.admin.role
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Refresh token
     */
    static async refreshToken(req, res, next) {
        try {
            const newToken = generateToken({
                id: req.admin.id,
                username: req.admin.username,
                role: req.admin.role
            });

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    token: newToken
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get admin profile
     */
    static async getProfile(req, res, next) {
        try {
            const admin = await AdminService.getAdminById(req.admin.id);
            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            res.json({
                success: true,
                data: {
                    id: admin.id,
                    username: admin.username,
                    role: admin.role,
                    created_at: admin.created_at
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new admin
     */
    static async createAdmin(req, res, next) {
        try {
            const {
                username,
                password,
                role = 'editor'
            } = req.body;

            // Validate input
            const validationErrors = AdminService.validateAdminData({
                username,
                password,
                role
            });
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            // Check if username already exists
            const usernameExists = await AdminService.usernameExists(username);
            if (usernameExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
            }

            const newAdmin = await AdminService.createAdmin(username, password, role);

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
    }

    /**
     * Change admin password
     */
    static async changePassword(req, res, next) {
        try {
            const {
                currentPassword,
                newPassword
            } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
            }

            // Verify current password
            const admin = await AdminService.getAdminById(req.admin.id);
            const isValidPassword = await admin.validatePassword(currentPassword);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Validate new password (only validate password, not username)
            const validationErrors = AdminService.validateAdminData({
                password: newPassword
            }, {
                requireUsername: false,
                requirePassword: true
            });
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'New password validation failed',
                    errors: validationErrors
                });
            }

            await AdminService.updateAdminPassword(req.admin.id, newPassword);

            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get dashboard statistics
     */
    static async getDashboard(req, res, next) {
        try {
            const stats = await AdminService.getDashboardStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get comprehensive analysis
     */
    static async getComprehensiveAnalysis(req, res, next) {
        try {
            const {
                start_date,
                end_date,
                driver_id,
                language
            } = req.query;

            const AnalysisService = require('../services/AnalysisService');
            const analysis = await AnalysisService.getComprehensiveAnalysis({
                start_date,
                end_date,
                driver_id: driver_id ? parseInt(driver_id) : null,
                language
            });

            res.json({
                success: true,
                message: 'Comprehensive analysis retrieved successfully',
                data: analysis
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get audit logs
     */
    static async getAuditLogs(req, res, next) {
        try {
            const {
                limit = 50,
                    offset = 0,
                    actor,
                    action,
                    startDate,
                    endDate
            } = req.query;

            const logs = await AdminService.getAuditLogs({
                limit,
                offset,
                actor,
                action,
                startDate,
                endDate
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
    }
}

module.exports = AdminController;
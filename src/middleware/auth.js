const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const {
    Admin,
    AuditLog
} = require('../models');
const {
    sendLocalizedResponse
} = require('../utils/responseMessages');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return sendLocalizedResponse(res, 401, 'api.unauthorized', null, req.userLanguage, {
                reason: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findByPk(decoded.id);

        if (!admin) {
            return sendLocalizedResponse(res, 401, 'api.unauthorized', null, req.userLanguage, {
                reason: 'Admin not found'
            });
        }

        req.admin = admin;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return sendLocalizedResponse(res, 401, 'api.unauthorized', null, req.userLanguage, {
                reason: 'Token expired'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return sendLocalizedResponse(res, 401, 'api.unauthorized', null, req.userLanguage, {
                reason: 'Invalid token'
            });
        }
        return sendLocalizedResponse(res, 401, 'api.unauthorized', null, req.userLanguage, {
            reason: 'Authentication failed'
        });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return sendLocalizedResponse(res, 401, 'api.unauthorized', null, req.userLanguage, {
                reason: 'Authentication required'
            });
        }

        if (!roles.includes(req.admin.role)) {
            return sendLocalizedResponse(res, 403, 'api.unauthorized', null, req.userLanguage, {
                reason: 'Insufficient permissions',
                required_roles: roles,
                current_role: req.admin.role
            });
        }

        next();
    };
};

const logAdminAction = (action) => {
    return async (req, res, next) => {
        // Store original res.json to intercept response
        const originalJson = res.json;

        res.json = function (data) {
            // Log the action after response is sent
            setImmediate(async () => {
                try {
                    await AuditLog.logAdminAction(
                        req.admin?.username || 'unknown',
                        action, {
                            method: req.method,
                            path: req.path,
                            body: req.body,
                            params: req.params,
                            query: req.query,
                            statusCode: res.statusCode,
                            success: data.success
                        }
                    );
                } catch (error) {
                    console.error('Failed to log admin action:', error);
                }
            });

            return originalJson.call(this, data);
        };

        next();
    };
};

// Rate limiting for login attempts
const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for admin operations
const adminRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const admin = await Admin.findByPk(decoded.id);
            if (admin) {
                req.admin = admin;
            }
        }
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

// Check if admin is active
const requireActiveAdmin = (req, res, next) => {
    if (!req.admin) {
        return sendLocalizedResponse(res, 401, 'api.unauthorized', null, req.userLanguage, {
            reason: 'Authentication required'
        });
    }
    // Add any additional checks for admin status here
    next();
};

// Validate admin permissions for specific actions
const validatePermission = (permission) => {
    return (req, res, next) => {
        if (!req.admin) {
            return sendLocalizedResponse(res, 401, 'api.unauthorized', null, req.userLanguage, {
                reason: 'Authentication required'
            });
        }

        // Define permission mappings
        const permissions = {
            'admin': ['*'], // Admin has all permissions
            'editor': ['create_question', 'update_question', 'delete_question', 'create_quote', 'update_quote', 'view_dashboard'],
            'viewer': ['view_dashboard', 'view_questions', 'view_quotes']
        };

        const adminPermissions = permissions[req.admin.role] || [];

        if (!adminPermissions.includes('*') && !adminPermissions.includes(permission)) {
            return sendLocalizedResponse(res, 403, 'api.unauthorized', null, req.userLanguage, {
                reason: 'Insufficient permissions',
                required_permission: permission,
                current_role: req.admin.role
            });
        }

        next();
    };
};

// Generate JWT token
const generateToken = (admin) => {
    return jwt.sign({
            id: admin.id,
            username: admin.username,
            role: admin.role
        },
        process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        }
    );
};

// Verify token and return admin info
const verifyToken = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findByPk(decoded.id);
        return admin;
    } catch (error) {
        return null;
    }
};

module.exports = {
    authenticateToken,
    requireRole,
    logAdminAction,
    loginRateLimit,
    adminRateLimit,
    optionalAuth,
    requireActiveAdmin,
    validatePermission,
    generateToken,
    verifyToken
};
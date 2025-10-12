const jwt = require('jsonwebtoken');
const {
    Admin,
    AuditLog
} = require('../models');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findByPk(decoded.id);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        req.admin = admin;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
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

module.exports = {
    authenticateToken,
    requireRole,
    logAdminAction
};
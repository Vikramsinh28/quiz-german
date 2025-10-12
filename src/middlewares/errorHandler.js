const {
    sendLocalizedResponse
} = require('../utils/i18n');

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Get user language for localized error messages
    const userLanguage = req.userLanguage || 'en';

    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(e => ({
            field: e.path,
            message: e.message,
            value: e.value
        }));

        return sendLocalizedResponse(res, 400, 'api.validation_error', {
            errors
        }, userLanguage);
    }

    // Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        const errors = err.errors.map(e => ({
            field: e.path,
            message: `${e.path} must be unique`,
            value: e.value
        }));

        return sendLocalizedResponse(res, 409, 'api.validation_error', {
            errors
        }, userLanguage);
    }

    // Sequelize foreign key constraint errors
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return sendLocalizedResponse(res, 400, 'api.validation_error', {
            message: 'The referenced record does not exist'
        }, userLanguage);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return sendLocalizedResponse(res, 401, 'api.unauthorized', null, userLanguage);
    }

    if (err.name === 'TokenExpiredError') {
        return sendLocalizedResponse(res, 401, 'api.unauthorized', null, userLanguage);
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const messageKey = statusCode >= 500 ? 'api.server_error' : 'api.error';

    const errorResponse = {
        success: false,
        message: res.t ? res.t(messageKey) : messageKey,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            originalMessage: err.message
        })
    };

    res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
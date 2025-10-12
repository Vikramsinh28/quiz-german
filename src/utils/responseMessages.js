/**
 * Simple response message localization system
 * Only handles API response messages, not data content
 */

const messages = {
    en: {
        // Success messages
        'question.created': 'Question created successfully!',
        'question.updated': 'Question updated successfully!',
        'question.deleted': 'Question deleted successfully!',
        'question.not_found': 'Question not found',

        'driver.created': 'Driver created successfully!',
        'driver.updated': 'Driver updated successfully!',
        'driver.deleted': 'Driver deleted successfully!',
        'driver.not_found': 'Driver not found',

        'admin.created': 'Admin created successfully!',
        'admin.updated': 'Admin updated successfully!',
        'admin.deleted': 'Admin deleted successfully!',
        'admin.not_found': 'Admin not found',

        'quiz.started': 'Quiz started successfully!',
        'quiz.completed': 'Quiz completed successfully!',
        'quiz.session_not_found': 'Quiz session not found',
        'quiz.already_completed': 'Quiz already completed today',
        'quiz.no_questions': 'No questions available',

        'quote.created': 'Quote created successfully!',
        'quote.updated': 'Quote updated successfully!',
        'quote.deleted': 'Quote deleted successfully!',
        'quote.not_found': 'Quote not found',
        'quote.no_quote_today': 'No quote available for today',

        // General messages
        'api.success': 'Success',
        'api.error': 'Error',
        'api.not_found': 'Resource not found',
        'api.unauthorized': 'Unauthorized access',
        'api.forbidden': 'Access forbidden',
        'api.validation_error': 'Validation error',
        'api.server_error': 'Internal server error',
        'api.created': 'Resource created successfully!',
        'api.updated': 'Resource updated successfully!',
        'api.deleted': 'Resource deleted successfully!'
    },
    de: {
        // Success messages
        'question.created': 'Frage erfolgreich erstellt!',
        'question.updated': 'Frage erfolgreich aktualisiert!',
        'question.deleted': 'Frage erfolgreich gelöscht!',
        'question.not_found': 'Frage nicht gefunden',

        'driver.created': 'Fahrer erfolgreich erstellt!',
        'driver.updated': 'Fahrer erfolgreich aktualisiert!',
        'driver.deleted': 'Fahrer erfolgreich gelöscht!',
        'driver.not_found': 'Fahrer nicht gefunden',

        'admin.created': 'Administrator erfolgreich erstellt!',
        'admin.updated': 'Administrator erfolgreich aktualisiert!',
        'admin.deleted': 'Administrator erfolgreich gelöscht!',
        'admin.not_found': 'Administrator nicht gefunden',

        'quiz.started': 'Quiz erfolgreich gestartet!',
        'quiz.completed': 'Quiz erfolgreich abgeschlossen!',
        'quiz.session_not_found': 'Quiz-Sitzung nicht gefunden',
        'quiz.already_completed': 'Quiz heute bereits abgeschlossen',
        'quiz.no_questions': 'Keine Fragen verfügbar',

        'quote.created': 'Zitat erfolgreich erstellt!',
        'quote.updated': 'Zitat erfolgreich aktualisiert!',
        'quote.deleted': 'Zitat erfolgreich gelöscht!',
        'quote.not_found': 'Zitat nicht gefunden',
        'quote.no_quote_today': 'Kein Zitat für heute verfügbar',

        // General messages
        'api.success': 'Erfolg',
        'api.error': 'Fehler',
        'api.not_found': 'Ressource nicht gefunden',
        'api.unauthorized': 'Unbefugter Zugriff',
        'api.forbidden': 'Zugriff verweigert',
        'api.validation_error': 'Validierungsfehler',
        'api.server_error': 'Interner Serverfehler',
        'api.created': 'Ressource erfolgreich erstellt!',
        'api.updated': 'Ressource erfolgreich aktualisiert!',
        'api.deleted': 'Ressource erfolgreich gelöscht!'
    }
};

/**
 * Get localized message
 * @param {string} key - Message key
 * @param {string} language - Language code (en, de)
 * @returns {string} - Localized message
 */
function getMessage(key, language = 'en') {
    const lang = language.toLowerCase();
    const messageSet = messages[lang] || messages.en;
    return messageSet[key] || messages.en[key] || key;
}

/**
 * Create a standardized API response with localized message
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} messageKey - Message key for localization
 * @param {Object} data - Response data
 * @param {string} language - Language code
 * @returns {Object} - Express response
 */
function sendLocalizedResponse(res, statusCode, messageKey, data = null, language = 'en') {
    const response = {
        success: statusCode >= 200 && statusCode < 300,
        message: getMessage(messageKey, language),
        timestamp: new Date().toISOString()
    };

    if (data) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
}

/**
 * Get language from request (query param, header, or default)
 * @param {Object} req - Express request object
 * @returns {string} - Language code
 */
function getLanguageFromRequest(req) {
    // Check query parameter first
    if (req.query && req.query.lang && ['en', 'de'].includes(req.query.lang)) {
        return req.query.lang;
    }

    // Check Accept-Language header
    if (req.headers && req.headers['accept-language']) {
        const acceptLanguage = req.headers['accept-language'];
        const languages = acceptLanguage.split(',').map(lang => {
            const [code] = lang.trim().split(';');
            return code.toLowerCase();
        });

        // Find first supported language
        for (const lang of languages) {
            if (['en', 'de'].includes(lang)) {
                return lang;
            }
        }
    }

    return 'en'; // Default to English
}

/**
 * Middleware to add language information to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function languageMiddleware(req, res, next) {
    req.userLanguage = getLanguageFromRequest(req);
    req.sendLocalizedResponse = (statusCode, messageKey, data) =>
        sendLocalizedResponse(res, statusCode, messageKey, data, req.userLanguage);
    next();
}

module.exports = {
    getMessage,
    sendLocalizedResponse,
    getLanguageFromRequest,
    languageMiddleware
};
const {
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE
} = require('../config/i18n');

/**
 * Language utility functions for handling multilingual content
 */

/**
 * Get the best available language from a request
 * @param {Object} req - Express request object
 * @returns {string} - Language code (en, de, etc.)
 */
function getLanguageFromRequest(req) {
    // Check query parameter first
    if (req.query && req.query.lang && SUPPORTED_LANGUAGES.includes(req.query.lang)) {
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
            if (SUPPORTED_LANGUAGES.includes(lang)) {
                return lang;
            }
        }
    }

    // Check if i18next detected a language
    if (req.language && SUPPORTED_LANGUAGES.includes(req.language)) {
        return req.language;
    }

    return DEFAULT_LANGUAGE;
}

/**
 * Get localized content from a multilingual object
 * @param {Object} content - Object with language keys (e.g., {en: "Hello", de: "Hallo"})
 * @param {string} language - Target language code
 * @param {string} fallbackLanguage - Fallback language code (default: 'en')
 * @returns {string} - Localized content
 */
function getLocalizedContent(content, language = DEFAULT_LANGUAGE, fallbackLanguage = DEFAULT_LANGUAGE) {
    if (!content || typeof content !== 'object') {
        return null;
    }

    // Try requested language first
    if (content[language]) {
        return content[language];
    }

    // Try fallback language
    if (content[fallbackLanguage]) {
        return content[fallbackLanguage];
    }

    // Try any available language
    const availableLanguages = Object.keys(content);
    if (availableLanguages.length > 0) {
        return content[availableLanguages[0]];
    }

    return null;
}

/**
 * Create a localized response object
 * @param {Object} data - Response data
 * @param {string} language - Target language
 * @returns {Object} - Localized response object
 */
function createLocalizedResponse(data, language = DEFAULT_LANGUAGE) {
    if (!data) return data;

    const localized = {
        ...data
    };

    // Handle questions
    if (localized.questions && Array.isArray(localized.questions)) {
        localized.questions = localized.questions.map(question => ({
            ...question,
            question_text: getLocalizedContent(question.question_text, language),
            options: getLocalizedContent(question.options, language),
            explanation: getLocalizedContent(question.explanation, language)
        }));
    }

    // Handle single question
    if (localized.question_text) {
        localized.question_text = getLocalizedContent(localized.question_text, language);
    }
    if (localized.options) {
        localized.options = getLocalizedContent(localized.options, language);
    }
    if (localized.explanation) {
        localized.explanation = getLocalizedContent(localized.explanation, language);
    }

    // Handle quotes
    if (localized.quotes && Array.isArray(localized.quotes)) {
        localized.quotes = localized.quotes.map(quote => ({
            ...quote,
            text: getLocalizedContent(quote.text, language)
        }));
    }

    // Handle single quote
    if (localized.text) {
        localized.text = getLocalizedContent(localized.text, language);
    }

    return localized;
}

/**
 * Validate if a language code is supported
 * @param {string} language - Language code to validate
 * @returns {boolean} - True if supported
 */
function isLanguageSupported(language) {
    return SUPPORTED_LANGUAGES.includes(language);
}

/**
 * Get all supported languages
 * @returns {Array} - Array of supported language codes
 */
function getSupportedLanguages() {
    return [...SUPPORTED_LANGUAGES];
}

/**
 * Middleware to add language information to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function languageMiddleware(req, res, next) {
    req.userLanguage = getLanguageFromRequest(req);
    req.getLocalizedContent = (content, fallbackLanguage = DEFAULT_LANGUAGE) =>
        getLocalizedContent(content, req.userLanguage, fallbackLanguage);
    req.createLocalizedResponse = (data) =>
        createLocalizedResponse(data, req.userLanguage);
    next();
}

/**
 * Create a standardized API response with localization
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} messageKey - i18n message key
 * @param {Object} data - Response data
 * @param {string} language - Language code
 * @returns {Object} - Express response
 */
function sendLocalizedResponse(res, statusCode, messageKey, data = null, language = DEFAULT_LANGUAGE) {
    const response = {
        success: statusCode >= 200 && statusCode < 300,
        message: res.t ? res.t(messageKey) : messageKey,
        timestamp: new Date().toISOString()
    };

    if (data) {
        response.data = createLocalizedResponse(data, language);
    }

    return res.status(statusCode).json(response);
}

module.exports = {
    getLanguageFromRequest,
    getLocalizedContent,
    createLocalizedResponse,
    isLanguageSupported,
    getSupportedLanguages,
    languageMiddleware,
    sendLocalizedResponse,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE
};
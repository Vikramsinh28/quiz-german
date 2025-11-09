const translateService = require('../services/translate/translateService');

/**
 * Response Translation Middleware
 * 
 * This middleware automatically translates GET response data when a language parameter is provided.
 * It only translates if:
 * - Request method is GET
 * - Language parameter is provided in query string
 * - Language is different from 'en' (or source language)
 * 
 * Usage: Add ?lang=es to any GET request to get translated response
 */

/**
 * Check if a string should be translated
 * @param {string} str - String to check
 * @param {string} key - Object key name (for context)
 * @returns {boolean} True if should be translated
 */
function shouldTranslateString(str, key = '') {
    // Skip empty strings
    if (!str || str.trim().length === 0) {
        return false;
    }

    // Skip very short strings (likely IDs, codes, etc.)
    if (str.length < 3) {
        return false;
    }

    // Skip keys that shouldn't be translated
    const skipKeys = ['id', 'created_at', 'updated_at', 'timestamp', 'success', 'count', 'total',
        'limit', 'offset', 'score', 'accuracy', 'streak', 'phone_number', 'email',
        'firebase_uid', 'device_token', 'fcm_token', 'driver_id', 'question_id',
        'session_id', 'quiz_session_id', 'selected_option', 'correct_option'
    ];

    if (skipKeys.includes(key.toLowerCase())) {
        return false;
    }

    // Skip URLs
    if (str.startsWith('http://') || str.startsWith('https://')) {
        return false;
    }

    // Skip emails
    if (str.includes('@') && str.includes('.')) {
        return false;
    }

    // Skip pure numbers
    if (/^\d+$/.test(str)) {
        return false;
    }

    // Skip UUIDs and similar patterns
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
        return false;
    }

    // Skip uppercase codes/IDs (like ISO codes)
    if (/^[A-Z0-9_-]+$/.test(str) && str.length < 10) {
        return false;
    }

    // Skip dates in ISO format
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        return false;
    }

    return true;
}

/**
 * Recursively translate string values in an object
 * @param {any} obj - Object to translate
 * @param {string} targetLanguage - Target language code
 * @param {string} sourceLanguage - Source language code (default: 'en')
 * @param {string} parentKey - Parent key name for context
 * @returns {Promise<any>} Translated object
 */
async function translateObject(obj, targetLanguage, sourceLanguage = 'en', parentKey = '') {
    // Skip translation if target is same as source
    if (targetLanguage.toLowerCase() === sourceLanguage.toLowerCase()) {
        return obj;
    }

    // Handle null/undefined
    if (obj === null || obj === undefined) {
        return obj;
    }

    // Handle strings - translate them
    if (typeof obj === 'string') {
        if (!shouldTranslateString(obj, parentKey)) {
            return obj;
        }

        try {
            const result = await translateService.translateText(obj, targetLanguage, sourceLanguage);
            return result.translatedText;
        } catch (error) {
            // If translation fails, return original text
            console.warn(`Translation failed for text: ${obj.substring(0, 50)}... Error: ${error.message}`);
            return obj;
        }
    }

    // Handle arrays - translate each element
    if (Array.isArray(obj)) {
        // Process array items sequentially to avoid overwhelming AWS Translate
        const translatedArray = [];
        for (let i = 0; i < obj.length; i++) {
            const translatedItem = await translateObject(obj[i], targetLanguage, sourceLanguage, parentKey);
            translatedArray.push(translatedItem);
        }
        return translatedArray;
    }

    // Handle objects - translate each property
    if (typeof obj === 'object') {
        const translatedObj = {};
        const keys = Object.keys(obj);

        // Process keys sequentially to avoid rate limiting
        for (const key of keys) {
            const translatedValue = await translateObject(obj[key], targetLanguage, sourceLanguage, key);
            translatedObj[key] = translatedValue;
        }

        return translatedObj;
    }

    // Return primitive values as-is (numbers, booleans, etc.)
    return obj;
}

/**
 * Middleware to translate GET response data
 * Only activates if language parameter is provided
 */
function translateResponseMiddleware(req, res, next) {
    // Only process GET requests
    if (req.method !== 'GET') {
        return next();
    }

    // Check if language parameter is provided
    const targetLanguage = req.query.lang;

    // If no language parameter, skip translation
    if (!targetLanguage) {
        return next();
    }

    // Validate language code
    if (!translateService.isLanguageSupported(targetLanguage)) {
        // Invalid language code - skip translation but continue
        console.warn(`Unsupported language code: ${targetLanguage}. Skipping translation.`);
        return next();
    }

    // Skip if target language is English (no translation needed)
    if (targetLanguage.toLowerCase() === 'en') {
        return next();
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to translate response
    res.json = async function (data) {
        try {
            // Only translate if data exists and is an object
            if (data && typeof data === 'object') {
                // Translate the data
                const translatedData = await translateObject(data, targetLanguage, 'en');

                // Add metadata about translation
                if (translatedData && typeof translatedData === 'object' && !Array.isArray(translatedData)) {
                    translatedData._translated = true;
                    translatedData._targetLanguage = targetLanguage;
                }

                // Send translated response
                return originalJson(translatedData);
            } else {
                // Non-object response - send as-is
                return originalJson(data);
            }
        } catch (error) {
            // If translation fails, log error and send original response
            console.error('Translation middleware error:', error.message);
            return originalJson(data);
        }
    };

    next();
}

module.exports = translateResponseMiddleware;
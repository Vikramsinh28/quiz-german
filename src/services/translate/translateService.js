const {
    TranslateTextCommand
} = require('@aws-sdk/client-translate');
const translateClient = require('./translateClient');

/**
 * AWS Translate Service
 * 
 * This service provides functions to translate text using AWS Translate.
 * Supports automatic language detection and manual source/target language specification.
 */

/**
 * Supported language codes by AWS Translate
 * Common languages:
 * - en: English
 * - es: Spanish
 * - fr: French
 * - de: German
 * - it: Italian
 * - pt: Portuguese
 * - ru: Russian
 * - zh: Chinese
 * - ja: Japanese
 * - ko: Korean
 * - ar: Arabic
 * - hi: Hindi
 * 
 * Full list: https://docs.aws.amazon.com/translate/latest/dg/what-is.html#what-is-languages
 */
const SUPPORTED_LANGUAGES = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi',
    'nl', 'pl', 'tr', 'sv', 'da', 'fi', 'no', 'cs', 'ro', 'hu', 'bg', 'hr',
    'sk', 'sl', 'et', 'lv', 'lt', 'mt', 'ga', 'cy', 'is', 'mk', 'sq', 'sr',
    'th', 'vi', 'id', 'ms', 'tl', 'sw', 'af', 'zu', 'xh', 'yo', 'ig', 'ha'
];

/**
 * Translate text from source language to target language
 * 
 * @param {string} text - The text to translate
 * @param {string} targetLanguage - Target language code (e.g., 'en', 'es', 'fr')
 * @param {string} [sourceLanguage='auto'] - Source language code or 'auto' for auto-detection
 * @returns {Promise<Object>} Translation result with translated text and detected source language
 * @throws {Error} If translation fails
 * 
 * @example
 * // Auto-detect source language
 * const result = await translateText('Hello world', 'es');
 * console.log(result.translatedText); // "Hola mundo"
 * console.log(result.sourceLanguage); // "en"
 * 
 * @example
 * // Specify source language
 * const result = await translateText('Bonjour', 'en', 'fr');
 * console.log(result.translatedText); // "Hello"
 */
async function translateText(text, targetLanguage, sourceLanguage = 'auto') {
    try {
        // Validate input
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            throw new Error('Text to translate is required and must be a non-empty string');
        }

        if (!targetLanguage || typeof targetLanguage !== 'string') {
            throw new Error('Target language is required and must be a string');
        }

        // Validate target language
        if (!SUPPORTED_LANGUAGES.includes(targetLanguage.toLowerCase())) {
            throw new Error(`Unsupported target language: ${targetLanguage}. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`);
        }

        // Prepare translation parameters
        const params = {
            Text: text,
            SourceLanguageCode: sourceLanguage.toLowerCase() === 'auto' ? 'auto' : sourceLanguage.toLowerCase(),
            TargetLanguageCode: targetLanguage.toLowerCase()
        };

        // Validate source language if not auto
        if (params.SourceLanguageCode !== 'auto' && !SUPPORTED_LANGUAGES.includes(params.SourceLanguageCode)) {
            throw new Error(`Unsupported source language: ${sourceLanguage}. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`);
        }

        // Create and execute translation command
        const command = new TranslateTextCommand(params);
        const response = await translateClient.send(command);

        // Return formatted result
        return {
            originalText: text,
            translatedText: response.TranslatedText,
            sourceLanguage: response.SourceLanguageCode,
            targetLanguage: targetLanguage.toLowerCase(),
            success: true
        };
    } catch (error) {
        console.log(error);
        // Enhanced error handling
        if (error.name === 'ValidationException') {
            throw new Error(`Translation validation error: ${error.message}`);
        } else if (error.name === 'UnsupportedLanguagePairException') {
            throw new Error(`Unsupported language pair: ${sourceLanguage} to ${targetLanguage}`);
        } else if (error.name === 'TextSizeLimitExceededException') {
            throw new Error('Text size exceeds AWS Translate limit (10,000 bytes)');
        } else if (error.name === 'TooManyRequestsException') {
            throw new Error('Too many translation requests. Please try again later.');
        } else if (error.name === 'InternalServerException') {
            throw new Error('AWS Translate service error. Please try again later.');
        } else if (error.code === 'CredentialsError' || error.message.includes('credentials')) {
            throw new Error('AWS credentials not configured. Please check your environment variables.');
        } else {
            throw new Error(`Translation failed: ${error.message}`);
        }
    }
}

/**
 * Translate multiple texts in batch
 * 
 * @param {Array<string>} texts - Array of texts to translate
 * @param {string} targetLanguage - Target language code
 * @param {string} [sourceLanguage='auto'] - Source language code or 'auto'
 * @returns {Promise<Array<Object>>} Array of translation results
 * 
 * @example
 * const texts = ['Hello', 'World', 'How are you?'];
 * const results = await translateBatch(texts, 'es');
 * results.forEach(result => console.log(result.translatedText));
 */
async function translateBatch(texts, targetLanguage, sourceLanguage = 'auto') {
    try {
        if (!Array.isArray(texts) || texts.length === 0) {
            throw new Error('Texts must be a non-empty array');
        }

        // Translate each text (AWS Translate doesn't have native batch API for multiple texts)
        // We'll process them sequentially to avoid rate limits
        const results = [];

        for (const text of texts) {
            try {
                const result = await translateText(text, targetLanguage, sourceLanguage);
                results.push(result);
            } catch (error) {
                // Continue with other translations even if one fails
                results.push({
                    originalText: text,
                    translatedText: null,
                    error: error.message,
                    success: false
                });
            }

            // Small delay to avoid rate limiting (optional)
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return results;
    } catch (error) {
        throw new Error(`Batch translation failed: ${error.message}`);
    }
}

/**
 * Get list of supported languages
 * 
 * @returns {Array<string>} Array of supported language codes
 */
function getSupportedLanguages() {
    return [...SUPPORTED_LANGUAGES];
}

/**
 * Validate if a language code is supported
 * 
 * @param {string} languageCode - Language code to validate
 * @returns {boolean} True if language is supported
 */
function isLanguageSupported(languageCode) {
    return SUPPORTED_LANGUAGES.includes(languageCode.toLowerCase());
}

module.exports = {
    translateText,
    translateBatch,
    getSupportedLanguages,
    isLanguageSupported
};
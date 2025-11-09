const express = require('express');
const router = express.Router();
const translateService = require('../services/translate/translateService');

/**
 * @swagger
 * /api/v1/translate:
 *   post:
 *     summary: Translate text using AWS Translate
 *     description: Translate text from source language to target language with optional auto-detection
 *     tags: [Translation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - targetLanguage
 *             properties:
 *               text:
 *                 type: string
 *                 description: Text to translate
 *                 example: "Hello, how are you?"
 *               targetLanguage:
 *                 type: string
 *                 description: Target language code (e.g., 'es', 'fr', 'de')
 *                 example: "es"
 *               sourceLanguage:
 *                 type: string
 *                 description: Source language code or 'auto' for auto-detection
 *                 default: "auto"
 *                 example: "auto"
 *     responses:
 *       200:
 *         description: Translation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     originalText:
 *                       type: string
 *                       example: "Hello, how are you?"
 *                     translatedText:
 *                       type: string
 *                       example: "Hola, ¿cómo estás?"
 *                     sourceLanguage:
 *                       type: string
 *                       example: "en"
 *                     targetLanguage:
 *                       type: string
 *                       example: "es"
 *       400:
 *         description: Bad request - Invalid input
 *       500:
 *         description: Server error - Translation failed
 */

/**
 * POST /api/v1/translate
 * Translate text from source language to target language
 * 
 * Request body:
 * {
 *   "text": "Hello, how are you?",
 *   "targetLanguage": "es",
 *   "sourceLanguage": "auto"  // optional, defaults to "auto"
 * }
 */
router.post('/', async (req, res, next) => {
    try {
        const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;

        // Validate required fields
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text to translate is required',
                error: 'MISSING_TEXT'
            });
        }

        if (!targetLanguage) {
            return res.status(400).json({
                success: false,
                message: 'Target language is required',
                error: 'MISSING_TARGET_LANGUAGE'
            });
        }

        // Validate text length (AWS Translate limit is 10,000 bytes)
        if (Buffer.byteLength(text, 'utf8') > 10000) {
            return res.status(400).json({
                success: false,
                message: 'Text exceeds maximum size of 10,000 bytes',
                error: 'TEXT_TOO_LARGE'
            });
        }

        // Perform translation
        const result = await translateService.translateText(text, targetLanguage, sourceLanguage);

        // Return success response
        res.json({
            success: true,
            message: 'Translation completed successfully',
            data: result
        });
    } catch (error) {
        // Pass error to error handler middleware
        next(error);
    }
});

/**
 * @swagger
 * /api/v1/translate/batch:
 *   post:
 *     summary: Translate multiple texts in batch
 *     description: Translate an array of texts from source language to target language
 *     tags: [Translation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - texts
 *               - targetLanguage
 *             properties:
 *               texts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of texts to translate
 *                 example: ["Hello", "World", "How are you?"]
 *               targetLanguage:
 *                 type: string
 *                 description: Target language code
 *                 example: "es"
 *               sourceLanguage:
 *                 type: string
 *                 description: Source language code or 'auto'
 *                 default: "auto"
 *                 example: "auto"
 *     responses:
 *       200:
 *         description: Batch translation completed
 */
router.post('/batch', async (req, res, next) => {
    try {
        const { texts, targetLanguage, sourceLanguage = 'auto' } = req.body;

        // Validate required fields
        if (!texts || !Array.isArray(texts) || texts.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Texts array is required and must not be empty',
                error: 'MISSING_TEXTS'
            });
        }

        if (!targetLanguage) {
            return res.status(400).json({
                success: false,
                message: 'Target language is required',
                error: 'MISSING_TARGET_LANGUAGE'
            });
        }

        // Validate each text size
        for (const text of texts) {
            if (Buffer.byteLength(text, 'utf8') > 10000) {
                return res.status(400).json({
                    success: false,
                    message: `Text "${text.substring(0, 50)}..." exceeds maximum size of 10,000 bytes`,
                    error: 'TEXT_TOO_LARGE'
                });
            }
        }

        // Perform batch translation
        const results = await translateService.translateBatch(texts, targetLanguage, sourceLanguage);

        // Count successful translations
        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        res.json({
            success: true,
            message: `Batch translation completed: ${successCount} successful, ${failCount} failed`,
            data: {
                results: results,
                summary: {
                    total: results.length,
                    successful: successCount,
                    failed: failCount
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/v1/translate/languages:
 *   get:
 *     summary: Get list of supported languages
 *     description: Returns an array of all supported language codes
 *     tags: [Translation]
 *     responses:
 *       200:
 *         description: List of supported languages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     languages:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["en", "es", "fr", "de", "it", "pt"]
 *                     count:
 *                       type: integer
 *                       example: 6
 */
router.get('/languages', (req, res) => {
    try {
        const languages = translateService.getSupportedLanguages();
        
        res.json({
            success: true,
            message: 'Supported languages retrieved successfully',
            data: {
                languages: languages,
                count: languages.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve supported languages',
            error: error.message
        });
    }
});

module.exports = router;


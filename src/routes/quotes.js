const express = require('express');
const QuoteController = require('../controllers/QuoteController');
const {
    languageMiddleware
} = require('../utils/responseMessages');
const router = express.Router();

// Apply language middleware
router.use(languageMiddleware);

/**
 * @swagger
 * /api/v1/quotes/today:
 *   get:
 *     summary: Get today's quote
 *     description: Retrieve today's motivational quote
 *     tags: [Quotes]
 *     security: []
 *     parameters:
 *       - $ref: '#/components/parameters/LanguageParameter'
 *     responses:
 *       200:
 *         description: Today's quote retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Operation successful.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     text:
 *                       type: string
 *                       example: "Drive safely today and every day."
 *                     language:
 *                       type: string
 *                       example: "en"
 *                     scheduled_date:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-01"
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: No quote available for today
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/today', QuoteController.getTodaysQuote);

/**
 * @swagger
 * /api/v1/quotes/random:
 *   get:
 *     summary: Get random quote
 *     description: Retrieve a random motivational quote
 *     tags: [Quotes]
 *     security: []
 *     parameters:
 *       - $ref: '#/components/parameters/LanguageParameter'
 *     responses:
 *       200:
 *         description: Random quote retrieved successfully
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
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     text:
 *                       type: string
 *                       example: "Drive safely today and every day."
 *                     language:
 *                       type: string
 *                       example: "en"
 *                     scheduled_date:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       example: null
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: No quotes available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/random', QuoteController.getRandomQuote);

/**
 * @swagger
 * /api/v1/quotes/{id}:
 *   get:
 *     summary: Get quote by ID
 *     description: Retrieve a specific quote by ID
 *     tags: [Quotes]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quote ID
 *       - $ref: '#/components/parameters/LanguageParameter'
 *     responses:
 *       200:
 *         description: Quote retrieved successfully
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
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     text:
 *                       type: string
 *                       example: "Drive safely today and every day."
 *                     language:
 *                       type: string
 *                       example: "en"
 *                     scheduled_date:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       example: null
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Quote not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', QuoteController.getQuoteById);

/**
 * @swagger
 * /api/v1/quotes:
 *   get:
 *     summary: Get all quotes
 *     description: Retrieve all quotes with pagination
 *     tags: [Quotes]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Number of quotes to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Number of quotes to skip
 *       - $ref: '#/components/parameters/LanguageParameter'
 *     responses:
 *       200:
 *         description: Quotes retrieved successfully
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
 *                     quotes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           text:
 *                             type: string
 *                             example: "Drive safely today and every day."
 *                           language:
 *                             type: string
 *                             example: "en"
 *                           scheduled_date:
 *                             type: string
 *                             format: date
 *                             nullable: true
 *                             example: null
 *                           is_active:
 *                             type: boolean
 *                             example: true
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     offset:
 *                       type: integer
 *                       example: 0
 */
router.get('/', QuoteController.getAllQuotes);

module.exports = router;
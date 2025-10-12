const express = require('express');
const {
    Quote
} = require('../models');
const {
    sendLocalizedResponse,
    isLanguageSupported
} = require('../utils/i18n');
const router = express.Router();

// Get today's quote
router.get('/today', async (req, res, next) => {
    try {
        const {
            language
        } = req.query;

        // Use language from query, request, or default
        const quoteLanguage = language || req.userLanguage || 'en';

        if (!isLanguageSupported(quoteLanguage)) {
            return sendLocalizedResponse(res, 400, 'api.validation_error', {
                field: 'language',
                message: 'Unsupported language'
            }, req.userLanguage);
        }

        const quote = await Quote.getTodaysQuote(quoteLanguage);

        if (!quote) {
            return sendLocalizedResponse(res, 404, 'quote.no_quote_today', null, req.userLanguage);
        }

        const responseData = {
            id: quote.id,
            text: quote.getText(),
            language: quote.language,
            scheduled_date: quote.scheduled_date,
            is_active: quote.is_active
        };

        return sendLocalizedResponse(res, 200, 'api.success', responseData, req.userLanguage);
    } catch (error) {
        next(error);
    }
});

// Get random quote
router.get('/random', async (req, res, next) => {
    try {
        const {
            language = 'en'
        } = req.query;

        const quote = await Quote.getRandomQuote(language);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'No quotes available'
            });
        }

        res.json({
            success: true,
            data: {
                id: quote.id,
                text: quote.getText(),
                language: quote.language,
                scheduled_date: quote.scheduled_date,
                is_active: quote.is_active
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get quote by ID
router.get('/:id', async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const {
            language = 'en'
        } = req.query;

        const quote = await Quote.findByPk(id);
        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: quote.id,
                text: quote.getText(),
                language: quote.language,
                scheduled_date: quote.scheduled_date,
                is_active: quote.is_active,
                created_at: quote.created_at,
                updated_at: quote.updated_at
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get all quotes (with pagination)
router.get('/', async (req, res, next) => {
    try {
        const {
            language = 'en', limit = 20, offset = 0, active_only = true
        } = req.query;

        const whereClause = {};
        if (active_only === 'true') {
            whereClause.is_active = true;
        }

        const quotes = await Quote.findAndCountAll({
            where: whereClause,
            order: [
                ['created_at', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const formattedQuotes = quotes.rows.map(quote => ({
            id: quote.id,
            text: quote.getText(),
            language: quote.language,
            scheduled_date: quote.scheduled_date,
            is_active: quote.is_active,
            created_at: quote.created_at
        }));

        res.json({
            success: true,
            data: {
                quotes: formattedQuotes,
                total: quotes.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
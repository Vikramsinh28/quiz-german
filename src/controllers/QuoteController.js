const QuoteService = require('../services/QuoteService');
const {
    sendLocalizedResponse
} = require('../utils/responseMessages');

class QuoteController {
    /**
     * Get today's quote (public)
     */
    static async getTodaysQuote(req, res, next) {
        try {
            const {
                lang
            } = req.query;
            const quoteLanguage = lang || req.userLanguage || 'en';

            const quote = await QuoteService.getTodaysQuote(quoteLanguage);

            if (!quote) {
                return sendLocalizedResponse(res, 404, 'quote.no_quote_today', null, req.userLanguage);
            }

            const responseData = {
                id: quote.id,
                text: quote.getText(quoteLanguage),
                language: quote.language,
                scheduled_date: quote.scheduled_date,
                is_active: quote.is_active
            };

            return sendLocalizedResponse(res, 200, 'api.success', responseData, req.userLanguage);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get random quote (public)
     */
    static async getRandomQuote(req, res, next) {
        try {
            const {
                language = 'en'
            } = req.query;

            const quote = await QuoteService.getRandomQuote(language);

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
                    text: quote.getText(language),
                    language: quote.language,
                    scheduled_date: quote.scheduled_date,
                    is_active: quote.is_active
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get quote by ID (public)
     */
    static async getQuoteById(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const {
                language = 'en'
            } = req.query;

            const quote = await QuoteService.getQuoteById(id);

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
                    text: quote.getText(language),
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
    }

    /**
     * Get all quotes (public)
     */
    static async getAllQuotes(req, res, next) {
        try {
            const {
                limit = 20,
                    offset = 0,
                    language = 'en'
            } = req.query;

            const quotes = await QuoteService.getAllQuotes({
                limit,
                offset,
                language
            });

            const formattedQuotes = quotes.rows.map(quote => ({
                id: quote.id,
                text: quote.getText(language),
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
    }

    /**
     * Get all quotes (admin)
     */
    static async getAllQuotesAdmin(req, res, next) {
        try {
            const {
                limit = 20,
                    offset = 0,
                    language,
                    active_only = true
            } = req.query;

            const quotes = await QuoteService.getAllQuotes({
                limit,
                offset,
                language,
                active_only: active_only === 'true'
            });

            res.json({
                success: true,
                data: {
                    quotes: quotes.rows,
                    total: quotes.count,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new quote (admin)
     */
    static async createQuote(req, res, next) {
        try {
            const {
                text,
                language = 'en',
                scheduled_date
            } = req.body;

            // Validate input
            const validationErrors = QuoteService.validateQuoteData({
                text
            });
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            const quoteData = {
                text,
                language,
                scheduled_date,
                is_active: true
            };

            const quote = await QuoteService.createQuote(quoteData);

            res.status(201).json({
                success: true,
                message: 'Quote created successfully',
                data: {
                    id: quote.id,
                    text: quote.text,
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
    }

    /**
     * Update quote (admin)
     */
    static async updateQuote(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const updateData = req.body;

            const quote = await QuoteService.updateQuote(id, updateData);

            if (!quote) {
                return res.status(404).json({
                    success: false,
                    message: 'Quote not found'
                });
            }

            res.json({
                success: true,
                message: 'Quote updated successfully',
                data: {
                    id: quote.id,
                    text: quote.text,
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
    }

    /**
     * Delete quote (admin)
     */
    static async deleteQuote(req, res, next) {
        try {
            const {
                id
            } = req.params;

            const quote = await QuoteService.deleteQuote(id);

            if (!quote) {
                return res.status(404).json({
                    success: false,
                    message: 'Quote not found'
                });
            }

            res.json({
                success: true,
                message: 'Quote deactivated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Schedule quote (admin)
     */
    static async scheduleQuote(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const {
                scheduled_date
            } = req.body;

            if (!scheduled_date) {
                return res.status(400).json({
                    success: false,
                    message: 'Scheduled date is required'
                });
            }

            const quote = await QuoteService.scheduleQuote(id, scheduled_date);

            if (!quote) {
                return res.status(404).json({
                    success: false,
                    message: 'Quote not found'
                });
            }

            res.json({
                success: true,
                message: 'Quote scheduled successfully',
                data: {
                    id: quote.id,
                    scheduled_date: quote.scheduled_date
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = QuoteController;
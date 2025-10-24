const {
    Quote
} = require('../models');

class QuoteService {
    /**
     * Get all quotes with filtering and pagination
     */
    static async getAllQuotes(options = {}) {
        const {
            limit = 20,
                offset = 0,
                language,
                active_only = true
        } = options;

        const whereClause = {};
        if (active_only) {
            whereClause.is_active = true;
        }
        if (language) {
            whereClause.language = language;
        }

        return await Quote.findAndCountAll({
            where: whereClause,
            order: [
                ['created_at', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    }

    /**
     * Get quote by ID
     */
    static async getQuoteById(id) {
        return await Quote.findByPk(id);
    }

    /**
     * Get today's quote
     */
    static async getTodaysQuote(language = 'en') {
        const today = new Date().toISOString().split('T')[0];

        // First try to get a scheduled quote for today
        let quote = await Quote.findOne({
            where: {
                scheduled_date: today,
                is_active: true,
                language: language
            }
        });

        // If no scheduled quote, get a random active quote
        if (!quote) {
            quote = await Quote.findOne({
                where: {
                    is_active: true,
                    scheduled_date: null,
                    language: language
                },
                order: Quote.sequelize.random()
            });
        }

        return quote;
    }

    /**
     * Get random quote
     */
    static async getRandomQuote(language = 'en') {
        return await Quote.findOne({
            where: {
                is_active: true
            },
            order: Quote.sequelize.random()
        });
    }

    /**
     * Create a new quote
     */
    static async createQuote(quoteData) {
        return await Quote.create(quoteData);
    }

    /**
     * Update a quote
     */
    static async updateQuote(id, updateData) {
        const quote = await Quote.findByPk(id);
        if (!quote) {
            return null;
        }

        await quote.update(updateData);
        return quote;
    }

    /**
     * Delete (deactivate) a quote
     */
    static async deleteQuote(id) {
        const quote = await Quote.findByPk(id);
        if (!quote) {
            return null;
        }

        await quote.update({
            is_active: false
        });
        return quote;
    }

    /**
     * Schedule a quote for a specific date
     */
    static async scheduleQuote(quoteId, date) {
        const quote = await Quote.findByPk(quoteId);
        if (!quote) {
            return null;
        }

        quote.scheduled_date = date;
        return await quote.save();
    }

    /**
     * Validate quote data
     */
    static validateQuoteData(data) {
        const errors = [];

        if (!data.text) {
            errors.push('Quote text is required');
        } else if (typeof data.text !== 'string' || data.text.trim() === '') {
            errors.push('Quote text must be a non-empty string');
        }

        if (data.language && !['en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'].includes(data.language)) {
            errors.push('Language must be one of: en, de, fr, es, it, pt, ru, zh, ja, ko');
        }

        return errors;
    }
}

module.exports = QuoteService;
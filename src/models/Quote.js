const {
    DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Quote = sequelize.define('Quote', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
                isString(value) {
                    if (typeof value !== 'string') {
                        throw new Error('text must be a string');
                    }
                }
            }
        },
        language: {
            type: DataTypes.STRING(10),
            defaultValue: 'en',
            validate: {
                isIn: [
                    ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']
                ]
            }
        },
        scheduled_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'quotes',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [{
                fields: ['language']
            },
            {
                fields: ['scheduled_date']
            },
            {
                fields: ['is_active']
            }
        ]
    });

    // Instance methods
    Quote.prototype.getText = function () {
        return this.text;
    };

    // Class methods
    Quote.getTodaysQuote = async function (language = 'en') {
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
                order: sequelize.random()
            });
        }

        return quote;
    };

    Quote.getRandomQuote = async function (language = 'en') {
        return await Quote.findOne({
            where: {
                is_active: true,
                language: language
            },
            order: sequelize.random()
        });
    };

    Quote.scheduleQuote = async function (quoteId, date) {
        const quote = await Quote.findByPk(quoteId);
        if (quote) {
            quote.scheduled_date = date;
            return await quote.save();
        }
        return null;
    };

    return Quote;
};
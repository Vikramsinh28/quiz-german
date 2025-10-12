const {
    DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Question = sequelize.define('Question', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        question_text: {
            type: DataTypes.JSONB,
            allowNull: false,
            validate: {
                isValidQuestionText(value) {
                    if (!value || typeof value !== 'object') {
                        throw new Error('Question text must be a valid JSON object');
                    }
                    // Check if at least English is provided
                    if (!value.en || typeof value.en !== 'string') {
                        throw new Error('Question text must include English (en) version');
                    }
                }
            }
        },
        options: {
            type: DataTypes.JSONB,
            allowNull: false,
            validate: {
                isValidOptions(value) {
                    if (!value || typeof value !== 'object') {
                        throw new Error('Options must be a valid JSON object');
                    }
                    // Check if at least English options are provided
                    if (!value.en || !Array.isArray(value.en) || value.en.length !== 4) {
                        throw new Error('Options must include English (en) array with exactly 4 options');
                    }
                }
            }
        },
        correct_option: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
                max: 3
            }
        },
        explanation: {
            type: DataTypes.JSONB,
            allowNull: true,
            validate: {
                isValidExplanation(value) {
                    if (value && typeof value !== 'object') {
                        throw new Error('Explanation must be a valid JSON object');
                    }
                }
            }
        },
        topic: {
            type: DataTypes.STRING(100),
            allowNull: true
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
        created_by: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'admins',
                key: 'id'
            }
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'questions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [{
                fields: ['topic']
            },
            {
                fields: ['language']
            },
            {
                fields: ['is_active']
            },
            {
                fields: ['created_by']
            }
        ]
    });

    // Instance methods
    Question.prototype.getQuestionText = function (language = 'en') {
        return this.question_text[language] || this.question_text.en;
    };

    Question.prototype.getOptions = function (language = 'en') {
        return this.options[language] || this.options.en;
    };

    Question.prototype.getExplanation = function (language = 'en') {
        if (!this.explanation) return null;
        return this.explanation[language] || this.explanation.en;
    };

    Question.prototype.isCorrectAnswer = function (selectedOption) {
        return selectedOption === this.correct_option;
    };

    // Class methods
    Question.getRandomQuestions = async function (count = 5, language = 'en', topic = null) {
        const whereClause = {
            is_active: true
        };

        if (topic) {
            whereClause.topic = topic;
        }

        return await Question.findAll({
            where: whereClause,
            order: sequelize.random(),
            limit: count
        });
    };

    return Question;
};
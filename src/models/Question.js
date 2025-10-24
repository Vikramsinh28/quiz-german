const {
    DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Question = sequelize.define('Question', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        question_text: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
                isString(value) {
                    if (typeof value !== 'string') {
                        throw new Error('question_text must be a string');
                    }
                }
            }
        },
        options: {
            type: DataTypes.JSON, // Store as simple array of strings
            allowNull: false,
            validate: {
                notEmpty: true
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
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                isString(value) {
                    if (value !== null && value !== undefined && typeof value !== 'string') {
                        throw new Error('explanation must be a string');
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
            type: DataTypes.BIGINT,
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
    Question.prototype.getQuestionText = function () {
        return this.question_text;
    };

    Question.prototype.getOptions = function () {
        // Handle both array and string formats
        if (Array.isArray(this.options)) {
            return this.options;
        }

        // If stored as string, try to parse as JSON array
        if (typeof this.options === 'string') {
            try {
                return JSON.parse(this.options);
            } catch (error) {
                // Fallback: split by comma if it's a simple string
                return this.options.split(',').map(option => option.trim());
            }
        }

        return this.options;
    };

    Question.prototype.getExplanation = function () {
        return this.explanation;
    };

    Question.prototype.isCorrectAnswer = function (selectedOption) {
        return selectedOption === this.correct_option;
    };

    // Class methods
    Question.getRandomQuestions = async function (count = 5, language = 'en', topic = null) {
        const whereClause = {
            is_active: true,
            language: language
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
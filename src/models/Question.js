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
            type: DataTypes.JSONB,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        options: {
            type: DataTypes.JSONB,
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
            type: DataTypes.JSONB,
            allowNull: true
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
        if (typeof this.question_text === 'string') {
            return this.question_text;
        }
        return this.question_text[language] || this.question_text.en || this.question_text;
    };

    Question.prototype.getOptions = function (language = 'en') {
        if (typeof this.options === 'string') {
            try {
                return JSON.parse(this.options);
            } catch (error) {
                return this.options.split(',').map(option => option.trim());
            }
        }

        // Handle JSONB options
        if (Array.isArray(this.options)) {
            return this.options.map(option => {
                if (typeof option === 'string') return option;
                return option[language] || option.en || option;
            });
        }

        // Handle object with language keys
        if (this.options[language]) {
            return this.options[language];
        }

        return this.options.en || this.options;
    };

    Question.prototype.getExplanation = function (language = 'en') {
        if (!this.explanation) return null;

        if (typeof this.explanation === 'string') {
            return this.explanation;
        }

        return this.explanation[language] || this.explanation.en || this.explanation;
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
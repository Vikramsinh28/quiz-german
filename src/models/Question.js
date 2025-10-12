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
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 1000]
            }
        },
        options: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 2000]
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
                len: [0, 1000]
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
    Question.prototype.getQuestionText = function () {
        return this.question_text;
    };

    Question.prototype.getOptions = function () {
        // Parse options from string (assuming comma-separated or JSON string)
        try {
            return JSON.parse(this.options);
        } catch (error) {
            // If not JSON, split by comma
            return this.options.split(',').map(option => option.trim());
        }
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
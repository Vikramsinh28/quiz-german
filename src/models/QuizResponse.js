const {
    DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const QuizResponse = sequelize.define('QuizResponse', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        quiz_session_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'quiz_sessions',
                key: 'id'
            }
        },
        question_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'questions',
                key: 'id'
            }
        },
        selected_option: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
                max: 3
            }
        },
        correct: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        answered_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'quiz_responses',
        timestamps: false,
        indexes: [{
                fields: ['quiz_session_id']
            },
            {
                fields: ['question_id']
            },
            {
                fields: ['answered_at']
            }
        ]
    });

    // Instance methods
    QuizResponse.prototype.getSelectedOptionText = function (language = 'en') {
        if (!this.question) return null;
        const options = this.question.getOptions(language);
        return options[this.selected_option];
    };

    QuizResponse.prototype.getCorrectOptionText = function (language = 'en') {
        if (!this.question) return null;
        const options = this.question.getOptions(language);
        return options[this.question.correct_option];
    };

    // Class methods
    QuizResponse.getSessionResponses = async function (quizSessionId) {
        return await QuizResponse.findAll({
            where: {
                quiz_session_id: quizSessionId
            },
            include: [{
                model: sequelize.models.Question,
                as: 'question'
            }],
            order: [
                ['answered_at', 'ASC']
            ]
        });
    };

    QuizResponse.getQuestionStats = async function (questionId) {
        const totalResponses = await QuizResponse.count({
            where: {
                question_id: questionId
            }
        });

        const correctResponses = await QuizResponse.count({
            where: {
                question_id: questionId,
                correct: true
            }
        });

        return {
            total_responses: totalResponses,
            correct_responses: correctResponses,
            accuracy: totalResponses > 0 ? Math.round((correctResponses / totalResponses) * 100) : 0
        };
    };

    return QuizResponse;
};
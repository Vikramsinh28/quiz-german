const {
    Question,
    Admin,
    QuizResponse
} = require('../models');
const {
    Op
} = require('sequelize');

class QuestionService {
    /**
     * Get all questions with filtering and pagination
     */
    static async getAllQuestions(options = {}) {
        const {
            limit = 20,
                offset = 0,
                topic,
                active_only = true,
                includeCreator = false
        } = options;

        const whereClause = {};
        if (active_only) {
            whereClause.is_active = true;
        }
        if (topic) {
            whereClause.topic = topic;
        }

        const includeOptions = [];
        if (includeCreator) {
            includeOptions.push({
                model: Admin,
                as: 'creator',
                attributes: ['id', 'username']
            });
        }

        return await Question.findAndCountAll({
            where: whereClause,
            order: [
                ['created_at', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: includeOptions
        });
    }

    /**
     * Get question by ID
     */
    static async getQuestionById(id, includeCreator = false) {
        const includeOptions = [];
        if (includeCreator) {
            includeOptions.push({
                model: Admin,
                as: 'creator',
                attributes: ['id', 'username']
            });
        }

        return await Question.findByPk(id, {
            include: includeOptions
        });
    }

    /**
     * Get random questions
     */
    static async getRandomQuestions(count = 5, language = 'en', topic = null) {
        const whereClause = {
            is_active: true
        };

        if (topic) {
            whereClause.topic = topic;
        }

        return await Question.findAll({
            where: whereClause,
            order: Question.sequelize.random(),
            limit: count
        });
    }

    /**
     * Create a new question
     */
    static async createQuestion(questionData) {
        return await Question.create(questionData);
    }

    /**
     * Update a question
     */
    static async updateQuestion(id, updateData) {
        const question = await Question.findByPk(id);
        if (!question) {
            return null;
        }

        await question.update(updateData);
        return question;
    }

    /**
     * Delete (deactivate) a question
     */
    static async deleteQuestion(id) {
        const question = await Question.findByPk(id);
        if (!question) {
            return null;
        }

        await question.update({
            is_active: false
        });
        return question;
    }

    /**
     * Get all unique topics
     */
    static async getAllTopics() {
        const topics = await Question.findAll({
            attributes: ['topic'],
            where: {
                topic: {
                    [Op.ne]: null
                }
            },
            group: ['topic'],
            order: [
                ['topic', 'ASC']
            ]
        });

        return topics.map(t => t.topic).filter(topic => topic);
    }

    /**
     * Get question statistics
     */
    static async getQuestionStats(questionId) {
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
    }

    /**
     * Get questions by topic with pagination
     */
    static async getQuestionsByTopic(topic, options = {}) {
        const {
            limit = 20,
                offset = 0,
                language = 'en'
        } = options;

        return await Question.findAndCountAll({
            where: {
                topic: topic,
                is_active: true
            },
            order: [
                ['created_at', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    }

    /**
     * Validate question data
     */
    static validateQuestionData(data) {
        const errors = [];

        if (!data.question_text) {
            errors.push('Question text is required');
        } else if (typeof data.question_text !== 'string' || data.question_text.trim() === '') {
            errors.push('Question text must be a non-empty string');
        }

        if (!data.options) {
            errors.push('Options are required');
        } else if (!Array.isArray(data.options) || data.options.length !== 4) {
            errors.push('Options must be an array with exactly 4 choices');
        } else {
            // Validate each option is a non-empty string
            for (let i = 0; i < data.options.length; i++) {
                if (typeof data.options[i] !== 'string' || data.options[i].trim() === '') {
                    errors.push(`Option ${i + 1} must be a non-empty string`);
                    break;
                }
            }
        }

        if (data.correct_option === undefined) {
            errors.push('Correct option is required');
        } else if (data.correct_option < 0 || data.correct_option > 3) {
            errors.push('Correct option must be between 0 and 3');
        }

        if (data.language && !['en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'].includes(data.language)) {
            errors.push('Language must be one of: en, de, fr, es, it, pt, ru, zh, ja, ko');
        }

        return errors;
    }
}

module.exports = QuestionService;
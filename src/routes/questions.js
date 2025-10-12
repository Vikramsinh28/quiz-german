const express = require('express');
const {
    Question,
    QuizResponse
} = require('../models');
const {
    sendLocalizedResponse,
    isLanguageSupported
} = require('../utils/i18n');
const router = express.Router();

// Get random questions (public endpoint)
router.get('/random', async (req, res, next) => {
    try {
        const {
            count = 5, language, topic
        } = req.query;

        // Use language from query, request, or default
        const questionLanguage = language || req.userLanguage || 'en';

        if (!isLanguageSupported(questionLanguage)) {
            return sendLocalizedResponse(res, 400, 'api.validation_error', {
                field: 'language',
                message: 'Unsupported language'
            }, req.userLanguage);
        }

        const questions = await Question.getRandomQuestions(
            parseInt(count),
            questionLanguage,
            topic
        );

        if (questions.length === 0) {
            return sendLocalizedResponse(res, 404, 'quiz.no_questions', null, req.userLanguage);
        }

        // Format questions for client (without correct answers)
        const formattedQuestions = questions.map(question => ({
            id: question.id,
            question_text: question.getQuestionText(questionLanguage),
            options: question.getOptions(questionLanguage),
            topic: question.topic,
            explanation: question.getExplanation(questionLanguage)
        }));

        const responseData = {
            questions: formattedQuestions,
            count: questions.length,
            language: questionLanguage
        };

        return sendLocalizedResponse(res, 200, 'api.success', responseData, req.userLanguage);
    } catch (error) {
        next(error);
    }
});

// Get question by ID (public endpoint)
router.get('/:id', async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const {
            language = 'en'
        } = req.query;

        const question = await Question.findByPk(id);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Get question statistics
        const stats = await QuizResponse.getQuestionStats(id);

        res.json({
            success: true,
            data: {
                id: question.id,
                question_text: question.getQuestionText(language),
                options: question.getOptions(language),
                topic: question.topic,
                explanation: question.getExplanation(language),
                is_active: question.is_active,
                created_at: question.created_at,
                stats: {
                    total_responses: stats.total_responses,
                    correct_responses: stats.correct_responses,
                    accuracy: stats.accuracy
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get questions by topic
router.get('/topic/:topic', async (req, res, next) => {
    try {
        const {
            topic
        } = req.params;
        const {
            language = 'en', limit = 10, offset = 0
        } = req.query;

        const questions = await Question.findAndCountAll({
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

        const formattedQuestions = questions.rows.map(question => ({
            id: question.id,
            question_text: question.getQuestionText(language),
            options: question.getOptions(language),
            topic: question.topic,
            explanation: question.getExplanation(language)
        }));

        res.json({
            success: true,
            data: {
                questions: formattedQuestions,
                total: questions.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get all available topics
router.get('/topics/list', async (req, res, next) => {
    try {
        const topics = await Question.findAll({
            attributes: ['topic'],
            where: {
                topic: {
                    [require('sequelize').Op.ne]: null
                },
                is_active: true
            },
            group: ['topic'],
            order: [
                ['topic', 'ASC']
            ]
        });

        const topicList = topics.map(q => q.topic).filter(Boolean);

        res.json({
            success: true,
            data: {
                topics: topicList
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get question statistics
router.get('/:id/stats', async (req, res, next) => {
    try {
        const {
            id
        } = req.params;

        const question = await Question.findByPk(id);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        const stats = await QuizResponse.getQuestionStats(id);

        // Get response breakdown by option
        const optionStats = await QuizResponse.findAll({
            where: {
                question_id: id
            },
            attributes: [
                'selected_option',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
            ],
            group: ['selected_option'],
            raw: true
        });

        res.json({
            success: true,
            data: {
                question_id: id,
                total_responses: stats.total_responses,
                correct_responses: stats.correct_responses,
                accuracy: stats.accuracy,
                option_breakdown: optionStats.map(stat => ({
                    option: stat.selected_option,
                    count: parseInt(stat.count)
                }))
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
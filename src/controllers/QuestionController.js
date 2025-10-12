const QuestionService = require('../services/QuestionService');
const {
    sendLocalizedResponse
} = require('../utils/responseMessages');

class QuestionController {
    /**
     * Get random questions (public)
     */
    static async getRandomQuestions(req, res, next) {
        try {
            const {
                count = 5,
                    language = 'en',
                    topic
            } = req.query;

            const questionLanguage = language || req.userLanguage || 'en';
            const questions = await QuestionService.getRandomQuestions(
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
    }

    /**
     * Get question by ID (public)
     */
    static async getQuestionById(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const {
                language = 'en'
            } = req.query;

            const question = await QuestionService.getQuestionById(id);
            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'Question not found'
                });
            }

            // Get question statistics
            const stats = await QuestionService.getQuestionStats(id);

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
    }

    /**
     * Get questions by topic (public)
     */
    static async getQuestionsByTopic(req, res, next) {
        try {
            const {
                topic
            } = req.params;
            const {
                limit = 20,
                    offset = 0,
                    language = 'en'
            } = req.query;

            const questions = await QuestionService.getQuestionsByTopic(topic, {
                limit,
                offset,
                language
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
                    offset: parseInt(offset),
                    topic: topic
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all topics (public)
     */
    static async getAllTopics(req, res, next) {
        try {
            const topics = await QuestionService.getAllTopics();

            res.json({
                success: true,
                data: {
                    topics: topics
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all questions (admin)
     */
    static async getAllQuestions(req, res, next) {
        try {
            const {
                limit = 20,
                    offset = 0,
                    topic,
                    active_only = true
            } = req.query;

            const questions = await QuestionService.getAllQuestions({
                limit,
                offset,
                topic,
                active_only: active_only === 'true',
                includeCreator: true
            });

            // Format questions for response
            const formattedQuestions = questions.rows.map(question => ({
                id: question.id,
                question_text: question.question_text,
                options: question.options,
                correct_option: question.correct_option,
                explanation: question.explanation,
                topic: question.topic,
                language: question.language,
                is_active: question.is_active,
                created_by: question.created_by,
                creator: question.creator,
                created_at: question.created_at,
                updated_at: question.updated_at
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
    }

    /**
     * Get question by ID (admin)
     */
    static async getQuestionByIdAdmin(req, res, next) {
        try {
            const {
                id
            } = req.params;

            const question = await QuestionService.getQuestionById(id, true);

            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'Question not found'
                });
            }

            res.json({
                success: true,
                data: {
                    id: question.id,
                    question_text: question.question_text,
                    options: question.options,
                    correct_option: question.correct_option,
                    explanation: question.explanation,
                    topic: question.topic,
                    language: question.language,
                    is_active: question.is_active,
                    created_by: question.created_by,
                    creator: question.creator,
                    created_at: question.created_at,
                    updated_at: question.updated_at
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new question (admin)
     */
    static async createQuestion(req, res, next) {
        try {
            const {
                question_text,
                options,
                correct_option,
                explanation,
                topic,
                language = 'en'
            } = req.body;

            // Validate input
            const validationErrors = QuestionService.validateQuestionData({
                question_text,
                options,
                correct_option
            });

            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            const questionData = {
                question_text,
                options,
                correct_option,
                explanation,
                topic,
                language,
                created_by: req.admin.id,
                is_active: true
            };

            const question = await QuestionService.createQuestion(questionData);

            res.status(201).json({
                success: true,
                message: 'Question created successfully',
                data: {
                    id: question.id,
                    question_text: question.question_text,
                    options: question.options,
                    correct_option: question.correct_option,
                    explanation: question.explanation,
                    topic: question.topic,
                    language: question.language,
                    is_active: question.is_active,
                    created_by: question.created_by,
                    created_at: question.created_at,
                    updated_at: question.updated_at
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update question (admin)
     */
    static async updateQuestion(req, res, next) {
        try {
            const {
                id
            } = req.params;
            const updateData = req.body;

            // Validate correct_option if provided
            if (updateData.correct_option !== undefined) {
                if (updateData.correct_option < 0 || updateData.correct_option > 3) {
                    return res.status(400).json({
                        success: false,
                        message: 'Correct option must be between 0 and 3'
                    });
                }
            }

            // Validate options if provided
            if (updateData.options) {
                const optionsArray = Array.isArray(updateData.options) ? updateData.options : (updateData.options.en || updateData.options.de || []);
                if (optionsArray.length !== 4) {
                    return res.status(400).json({
                        success: false,
                        message: 'Options must contain exactly 4 choices'
                    });
                }
            }

            const question = await QuestionService.updateQuestion(id, updateData);

            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'Question not found'
                });
            }

            res.json({
                success: true,
                message: 'Question updated successfully',
                data: {
                    id: question.id,
                    question_text: question.question_text,
                    options: question.options,
                    correct_option: question.correct_option,
                    explanation: question.explanation,
                    topic: question.topic,
                    language: question.language,
                    is_active: question.is_active,
                    created_by: question.created_by,
                    created_at: question.created_at,
                    updated_at: question.updated_at
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete question (admin)
     */
    static async deleteQuestion(req, res, next) {
        try {
            const {
                id
            } = req.params;

            const question = await QuestionService.deleteQuestion(id);

            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'Question not found'
                });
            }

            res.json({
                success: true,
                message: 'Question deactivated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all topics (admin)
     */
    static async getAllTopicsAdmin(req, res, next) {
        try {
            const topics = await QuestionService.getAllTopics();

            res.json({
                success: true,
                data: {
                    topics: topics
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = QuestionController;
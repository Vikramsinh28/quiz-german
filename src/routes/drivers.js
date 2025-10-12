const express = require('express');
const {
    Driver,
    QuizSession
} = require('../models');
const router = express.Router();

// Create or get driver by device token
router.post('/register', async (req, res, next) => {
    try {
        const {
            device_token,
            language = 'en'
        } = req.body;

        if (!device_token) {
            return res.status(400).json({
                success: false,
                message: 'Device token is required'
            });
        }

        // Check if driver already exists
        let driver = await Driver.findOne({
            where: {
                device_token
            }
        });

        if (!driver) {
            // Create new driver
            driver = await Driver.create({
                device_token,
                language
            });
        } else {
            // Update language if provided
            if (language !== driver.language) {
                driver.language = language;
                await driver.save();
            }
        }

        res.status(201).json({
            success: true,
            message: 'Driver registered successfully',
            data: {
                id: driver.id,
                language: driver.language,
                total_quizzes: driver.total_quizzes,
                total_correct: driver.total_correct,
                streak: driver.streak,
                last_quiz_date: driver.last_quiz_date,
                accuracy: driver.calculateAccuracy()
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get driver profile
router.get('/:id', async (req, res, next) => {
    try {
        const {
            id
        } = req.params;

        const driver = await Driver.findByPk(id);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: driver.id,
                language: driver.language,
                total_quizzes: driver.total_quizzes,
                total_correct: driver.total_correct,
                streak: driver.streak,
                last_quiz_date: driver.last_quiz_date,
                accuracy: driver.calculateAccuracy(),
                created_at: driver.created_at
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get driver statistics
router.get('/:id/stats', async (req, res, next) => {
    try {
        const {
            id
        } = req.params;

        const driver = await Driver.findByPk(id, {
            include: [{
                model: QuizSession,
                as: 'quizSessions',
                where: {
                    completed: true
                },
                required: false
            }]
        });

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Calculate additional statistics
        const completedSessions = driver.quizSessions || [];
        const totalSessions = completedSessions.length;
        const averageScore = totalSessions > 0 ?
            Math.round(completedSessions.reduce((sum, session) => sum + session.calculateScore(), 0) / totalSessions) :
            0;

        const bestScore = totalSessions > 0 ?
            Math.max(...completedSessions.map(session => session.calculateScore())) :
            0;

        res.json({
            success: true,
            data: {
                total_quizzes: driver.total_quizzes,
                total_correct: driver.total_correct,
                streak: driver.streak,
                accuracy: driver.calculateAccuracy(),
                average_score: averageScore,
                best_score: bestScore,
                total_sessions: totalSessions,
                last_quiz_date: driver.last_quiz_date
            }
        });
    } catch (error) {
        next(error);
    }
});

// Update driver language
router.patch('/:id/language', async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const {
            language
        } = req.body;

        if (!language) {
            return res.status(400).json({
                success: false,
                message: 'Language is required'
            });
        }

        const driver = await Driver.findByPk(id);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        driver.language = language;
        await driver.save();

        res.json({
            success: true,
            message: 'Language updated successfully',
            data: {
                id: driver.id,
                language: driver.language
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
require('dotenv').config();

const DatabaseManager = require('./utils/database');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const {
    languageMiddleware
} = require('./utils/responseMessages');

// Import routes
const authRoutes = require('./routes/authRoutes');
const driverRoutes = require('./routes/drivers');
const questionRoutes = require('./routes/questions');
const quizRoutes = require('./routes/quiz');
const adminRoutes = require('./routes/admin');
const quoteRoutes = require('./routes/quotes');
const translateRoutes = require('./routes/translateRoute');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({
    limit: '10mb'
}));
app.use(express.urlencoded({
    extended: true
}));

// Language middleware
app.use(languageMiddleware);

// Request logging middleware
app.use((req, res, next) => {
    // Filter out development-related requests from logs
    const devEndpoints = [
        '/__server_sent_events__',
        '/__webpack_hmr',
        '/hot',
        '/sockjs-node'
    ];

    if (!devEndpoints.includes(req.path)) {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    }
    next();
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check the health status of the API and database
 *     tags: [General]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T00:00:00.000Z
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-01T00:00:00.000Z
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: unhealthy
 *                 error:
 *                   type: string
 *                   example: Database connection failed
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T00:00:00.000Z
 */
// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const dbHealth = await DatabaseManager.healthCheck();
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: dbHealth,
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Health check failed',
            error: error.message
        });
    }
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'German Quiz App API Documentation'
}));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/quiz', quizRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/quotes', quoteRoutes);
app.use('/api/v1/translate', translateRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Information
 *     description: Get API information and available endpoints
 *     tags: [General]
 *     security: []
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Daily Quiz App API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 language:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: string
 *                       example: en
 *                     supported:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [en, de]
 *                     default:
 *                       type: string
 *                       example: en
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     health:
 *                       type: string
 *                       example: /health
 *                     drivers:
 *                       type: string
 *                       example: /api/v1/drivers
 *                     questions:
 *                       type: string
 *                       example: /api/v1/questions
 *                     quiz:
 *                       type: string
 *                       example: /api/v1/quiz
 *                     admin:
 *                       type: string
 *                       example: /api/v1/admin
 *                     quotes:
 *                       type: string
 *                       example: /api/v1/quotes
 *                     documentation:
 *                       type: string
 *                       example: /api-docs
 */
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Daily Quiz App API',
        version: '1.0.0',
        language: {
            current: req.userLanguage || 'en',
            supported: ['en', 'de'],
            default: 'en'
        },
        endpoints: {
            health: '/health',
            drivers: '/api/v1/drivers',
            questions: '/api/v1/questions',
            quiz: '/api/v1/quiz',
            admin: '/api/v1/admin',
            quotes: '/api/v1/quotes',
            documentation: '/api-docs'
        }
    });
});

/**
 * @swagger
 * /api/v1/languages:
 *   get:
 *     summary: Get supported languages
 *     description: Get list of supported languages for the application
 *     tags: [General]
 *     security: []
 *     responses:
 *       200:
 *         description: Languages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     languages:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [en, de]
 *                     current:
 *                       type: string
 *                       example: en
 *                     default:
 *                       type: string
 *                       example: en
 */
// Get supported languages
app.get('/api/v1/languages', (req, res) => {
    res.json({
        success: true,
        data: {
            current: req.userLanguage || 'en',
            supported: ['en', 'de'],
            default: 'en'
        }
    });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await DatabaseManager.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await DatabaseManager.close();
    process.exit(0);
});

// Start server
async function startServer() {
    try {
        // Initialize database
        await DatabaseManager.initialize();

        // Firebase and cron jobs will be added later
        console.log('⚠️  Firebase and cron jobs not configured yet');

        // Start listening
        app.listen(PORT, () => {
            console.log('🚀 Daily Quiz App Server Started!');
            console.log(`📡 Server running on port ${PORT}`);
            console.log(`🌍 Multi-language support: English & German`);
            console.log(`⏰ Scheduled jobs: Daily quotes (8 AM), Quiz reminders (6 PM), Token cleanup (Sun 2 AM)`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;
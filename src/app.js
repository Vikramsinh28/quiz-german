const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const DatabaseManager = require('./utils/database');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const {
    languageMiddleware
} = require('./utils/responseMessages');

// Import routes
const driverRoutes = require('./routes/drivers');
const questionRoutes = require('./routes/questions');
const quizRoutes = require('./routes/quiz');
const adminRoutes = require('./routes/admin');
const quoteRoutes = require('./routes/quotes');

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
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

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

// API Routes
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/quiz', quizRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/quotes', quoteRoutes);

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
            quotes: '/api/v1/quotes'
        }
    });
});

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

        // Start listening
        app.listen(PORT, () => {
            console.log('🚀 Daily Quiz App Server Started!');
            console.log(`📡 Server running on port ${PORT}`);
            console.log(`🌐 API available at http://localhost:${PORT}`);
            console.log(`❤️  Health check: http://localhost:${PORT}/health`);
            console.log(`📚 API docs: http://localhost:${PORT}/`);
            console.log(`🌍 Multi-language support: English & German`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;
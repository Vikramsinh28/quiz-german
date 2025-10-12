const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        availableEndpoints: {
            health: '/health',
            drivers: '/api/v1/drivers',
            questions: '/api/v1/questions',
            quiz: '/api/v1/quiz',
            admin: '/api/v1/admin',
            quotes: '/api/v1/quotes'
        }
    });
};

module.exports = notFound;
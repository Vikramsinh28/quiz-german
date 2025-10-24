const notFound = (req, res, next) => {
    // Handle development-related requests gracefully
    const devEndpoints = [
        '/__server_sent_events__',
        '/__webpack_hmr',
        '/hot',
        '/sockjs-node'
    ];

    if (devEndpoints.includes(req.originalUrl)) {
        // Silently handle development endpoints without logging errors
        return res.status(404).json({
            success: false,
            message: 'Development endpoint not available',
            endpoint: req.originalUrl
        });
    }

    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = notFound;
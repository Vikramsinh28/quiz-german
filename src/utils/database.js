const {
    sequelize
} = require('../models');

class DatabaseManager {
    static async initialize() {
        try {
            // Test the connection
            await sequelize.authenticate();
            console.log('✅ Database connection established successfully.');

            // Don't sync models - use migrations instead
            // await sequelize.sync({ alter: false });
            console.log('✅ Database connection ready. Run migrations to set up tables.');

            return true;
        } catch (error) {
            console.error('❌ Unable to connect to the database:', error);
            throw error;
        }
    }

    static async close() {
        try {
            await sequelize.close();
            console.log('✅ Database connection closed.');
        } catch (error) {
            console.error('❌ Error closing database connection:', error);
            throw error;
        }
    }

    static async reset() {
        try {
            await sequelize.sync({
                force: true
            });
            console.log('✅ Database reset successfully.');
        } catch (error) {
            console.error('❌ Error resetting database:', error);
            throw error;
        }
    }

    static async healthCheck() {
        try {
            await sequelize.authenticate();
            return {
                status: 'healthy',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

module.exports = DatabaseManager;
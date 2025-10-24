'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Update text from JSONB to TEXT
        await queryInterface.changeColumn('quotes', 'text', {
            type: Sequelize.TEXT,
            allowNull: false
        });

        // Ensure language column is properly configured
        await queryInterface.changeColumn('quotes', 'language', {
            type: Sequelize.STRING(10),
            allowNull: false,
            defaultValue: 'en'
        });
    },

    async down(queryInterface, Sequelize) {
        // Revert text back to JSONB
        await queryInterface.changeColumn('quotes', 'text', {
            type: Sequelize.JSONB,
            allowNull: false
        });
    }
};
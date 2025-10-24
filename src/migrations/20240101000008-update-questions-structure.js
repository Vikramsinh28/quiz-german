'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Update question_text from JSONB to TEXT
        await queryInterface.changeColumn('questions', 'question_text', {
            type: Sequelize.TEXT,
            allowNull: false
        });

        // Update options from JSONB to JSON (array of strings)
        await queryInterface.changeColumn('questions', 'options', {
            type: Sequelize.JSON,
            allowNull: false
        });

        // Update explanation from JSONB to TEXT
        await queryInterface.changeColumn('questions', 'explanation', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        // Add language column if it doesn't exist (it should already exist)
        // This is just to ensure it's properly configured
        await queryInterface.changeColumn('questions', 'language', {
            type: Sequelize.STRING(10),
            allowNull: false,
            defaultValue: 'en'
        });
    },

    async down(queryInterface, Sequelize) {
        // Revert question_text back to JSONB
        await queryInterface.changeColumn('questions', 'question_text', {
            type: Sequelize.JSONB,
            allowNull: false
        });

        // Revert options back to JSONB
        await queryInterface.changeColumn('questions', 'options', {
            type: Sequelize.JSONB,
            allowNull: false
        });

        // Revert explanation back to JSONB
        await queryInterface.changeColumn('questions', 'explanation', {
            type: Sequelize.JSONB,
            allowNull: true
        });
    }
};
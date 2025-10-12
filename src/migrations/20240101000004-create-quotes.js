'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('quotes', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            text: {
                type: Sequelize.JSONB,
                allowNull: false
            },
            language: {
                type: Sequelize.STRING(10),
                defaultValue: 'en'
            },
            scheduled_date: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            }
        });

        // Add indexes
        await queryInterface.addIndex('quotes', ['language']);
        await queryInterface.addIndex('quotes', ['scheduled_date']);
        await queryInterface.addIndex('quotes', ['is_active']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('quotes');
    }
};
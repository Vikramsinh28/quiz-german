'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('audit_logs', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            actor: {
                type: Sequelize.STRING(100),
                allowNull: true,
                comment: 'Username or identifier of who performed the action'
            },
            action: {
                type: Sequelize.STRING(100),
                allowNull: false,
                comment: 'Action performed (e.g., CREATE_QUESTION, UPDATE_DRIVER, LOGIN)'
            },
            meta: {
                type: Sequelize.JSONB,
                allowNull: true,
                comment: 'Additional metadata about the action'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            }
        });

        // Add indexes
        await queryInterface.addIndex('audit_logs', ['actor']);
        await queryInterface.addIndex('audit_logs', ['action']);
        await queryInterface.addIndex('audit_logs', ['created_at']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('audit_logs');
    }
};
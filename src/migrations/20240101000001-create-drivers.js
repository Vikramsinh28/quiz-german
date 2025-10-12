'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('drivers', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            device_token: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            language: {
                type: Sequelize.STRING(10),
                defaultValue: 'en'
            },
            total_quizzes: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            total_correct: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            streak: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            last_quiz_date: {
                type: Sequelize.DATEONLY,
                allowNull: true
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
        await queryInterface.addIndex('drivers', ['device_token']);
        await queryInterface.addIndex('drivers', ['language']);
        await queryInterface.addIndex('drivers', ['last_quiz_date']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('drivers');
    }
};
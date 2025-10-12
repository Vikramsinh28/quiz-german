'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('quiz_sessions', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            driver_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'drivers',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            quiz_date: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            completed: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            total_questions: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            total_correct: {
                type: Sequelize.INTEGER,
                defaultValue: 0
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

        // Add unique constraint for one quiz per driver per day
        await queryInterface.addConstraint('quiz_sessions', {
            fields: ['driver_id', 'quiz_date'],
            type: 'unique',
            name: 'unique_driver_quiz_date'
        });

        // Add indexes
        await queryInterface.addIndex('quiz_sessions', ['quiz_date']);
        await queryInterface.addIndex('quiz_sessions', ['completed']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('quiz_sessions');
    }
};
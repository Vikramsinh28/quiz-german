'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('quiz_responses', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            quiz_session_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'quiz_sessions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            question_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'questions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            selected_option: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            correct: {
                type: Sequelize.BOOLEAN,
                allowNull: false
            },
            answered_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            }
        });

        // Add constraints
        await queryInterface.addConstraint('quiz_responses', {
            fields: ['selected_option'],
            type: 'check',
            name: 'quiz_responses_selected_option_check',
            where: {
                selected_option: {
                    [Sequelize.Op.between]: [0, 3]
                }
            }
        });

        // Add indexes
        await queryInterface.addIndex('quiz_responses', ['quiz_session_id']);
        await queryInterface.addIndex('quiz_responses', ['question_id']);
        await queryInterface.addIndex('quiz_responses', ['answered_at']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('quiz_responses');
    }
};
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('questions', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            question_text: {
                type: Sequelize.JSONB,
                allowNull: false
            },
            options: {
                type: Sequelize.JSONB,
                allowNull: false
            },
            correct_option: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            explanation: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            topic: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            language: {
                type: Sequelize.STRING(10),
                defaultValue: 'en'
            },
            created_by: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'admins',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
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

        // Add constraints
        await queryInterface.addConstraint('questions', {
            fields: ['correct_option'],
            type: 'check',
            name: 'questions_correct_option_check',
            where: {
                correct_option: {
                    [Sequelize.Op.between]: [0, 3]
                }
            }
        });

        // Add indexes
        await queryInterface.addIndex('questions', ['topic']);
        await queryInterface.addIndex('questions', ['language']);
        await queryInterface.addIndex('questions', ['is_active']);
        await queryInterface.addIndex('questions', ['created_by']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('questions');
    }
};
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('admins', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            username: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            password_hash: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            role: {
                type: Sequelize.STRING(50),
                defaultValue: 'editor'
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
        await queryInterface.addIndex('admins', ['username'], {
            unique: true
        });
        await queryInterface.addIndex('admins', ['role']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('admins');
    }
};
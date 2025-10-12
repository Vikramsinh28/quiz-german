'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Add Firebase fields to drivers table
        await queryInterface.addColumn('drivers', 'firebase_uid', {
            type: Sequelize.STRING(128),
            allowNull: true,
            unique: true
        });

        await queryInterface.addColumn('drivers', 'email', {
            type: Sequelize.STRING(255),
            allowNull: true
        });

        await queryInterface.addColumn('drivers', 'name', {
            type: Sequelize.STRING(255),
            allowNull: true
        });

        await queryInterface.addColumn('drivers', 'driver_license_number', {
            type: Sequelize.STRING(50),
            allowNull: true,
            unique: true
        });

        await queryInterface.addColumn('drivers', 'phone_number', {
            type: Sequelize.STRING(20),
            allowNull: true
        });

        // Add Firebase fields to admins table
        await queryInterface.addColumn('admins', 'firebase_uid', {
            type: Sequelize.STRING(128),
            allowNull: true,
            unique: true
        });

        await queryInterface.addColumn('admins', 'email', {
            type: Sequelize.STRING(255),
            allowNull: true
        });

        await queryInterface.addColumn('admins', 'name', {
            type: Sequelize.STRING(255),
            allowNull: true
        });

        await queryInterface.addColumn('admins', 'admin_code', {
            type: Sequelize.STRING(50),
            allowNull: true,
            unique: true
        });

        // Make password_hash nullable for Firebase users
        await queryInterface.changeColumn('admins', 'password_hash', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        // Make username nullable for Firebase users
        await queryInterface.changeColumn('admins', 'username', {
            type: Sequelize.STRING(100),
            allowNull: true,
            unique: true
        });

        // Add indexes for Firebase fields
        await queryInterface.addIndex('drivers', ['firebase_uid']);
        await queryInterface.addIndex('drivers', ['email']);
        await queryInterface.addIndex('drivers', ['driver_license_number']);

        await queryInterface.addIndex('admins', ['firebase_uid']);
        await queryInterface.addIndex('admins', ['email']);
        await queryInterface.addIndex('admins', ['admin_code']);
    },

    async down(queryInterface, Sequelize) {
        // Remove indexes
        await queryInterface.removeIndex('drivers', ['firebase_uid']);
        await queryInterface.removeIndex('drivers', ['email']);
        await queryInterface.removeIndex('drivers', ['driver_license_number']);

        await queryInterface.removeIndex('admins', ['firebase_uid']);
        await queryInterface.removeIndex('admins', ['email']);
        await queryInterface.removeIndex('admins', ['admin_code']);

        // Remove Firebase fields from drivers table
        await queryInterface.removeColumn('drivers', 'firebase_uid');
        await queryInterface.removeColumn('drivers', 'email');
        await queryInterface.removeColumn('drivers', 'name');
        await queryInterface.removeColumn('drivers', 'driver_license_number');
        await queryInterface.removeColumn('drivers', 'phone_number');

        // Remove Firebase fields from admins table
        await queryInterface.removeColumn('admins', 'firebase_uid');
        await queryInterface.removeColumn('admins', 'email');
        await queryInterface.removeColumn('admins', 'name');
        await queryInterface.removeColumn('admins', 'admin_code');

        // Restore original column constraints
        await queryInterface.changeColumn('admins', 'password_hash', {
            type: Sequelize.TEXT,
            allowNull: false
        });

        await queryInterface.changeColumn('admins', 'username', {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true
        });
    }
};
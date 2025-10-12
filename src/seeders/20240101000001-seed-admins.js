'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
    async up(queryInterface, Sequelize) {
        const saltRounds = 12;
        const adminPassword = await bcrypt.hash('admin123', saltRounds);
        const editorPassword = await bcrypt.hash('editor123', saltRounds);

        await queryInterface.bulkInsert('admins', [{
                id: '550e8400-e29b-41d4-a716-446655440001',
                username: 'admin',
                password_hash: adminPassword,
                role: 'admin',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440002',
                username: 'editor',
                password_hash: editorPassword,
                role: 'editor',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('admins', null, {});
    }
};
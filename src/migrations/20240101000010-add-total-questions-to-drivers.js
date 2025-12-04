'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Add total_questions column to drivers table
        await queryInterface.addColumn('drivers', 'total_questions', {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 0,
            after: 'total_correct'
        });

        // Update existing records: calculate total_questions from quiz sessions
        const [results] = await queryInterface.sequelize.query(`
            UPDATE drivers d
            SET total_questions = COALESCE((
                SELECT SUM(total_questions)
                FROM quiz_sessions
                WHERE driver_id = d.id AND completed = true
            ), 0)
        `);
    },

    async down(queryInterface, Sequelize) {
        // Remove total_questions column
        await queryInterface.removeColumn('drivers', 'total_questions');
    }
};


const {
    Sequelize
} = require('sequelize');
const sequelize = require('../config/database');

// Import models
const Driver = require('./Driver')(sequelize, Sequelize.DataTypes);
const Question = require('./Question')(sequelize, Sequelize.DataTypes);
const QuizSession = require('./QuizSession')(sequelize, Sequelize.DataTypes);
const QuizResponse = require('./QuizResponse')(sequelize, Sequelize.DataTypes);
const Quote = require('./Quote')(sequelize, Sequelize.DataTypes);
const Admin = require('./Admin')(sequelize, Sequelize.DataTypes);
const AuditLog = require('./AuditLog')(sequelize, Sequelize.DataTypes);

// Define associations
// Driver associations
Driver.hasMany(QuizSession, {
    foreignKey: 'driver_id',
    as: 'quizSessions',
    onDelete: 'CASCADE'
});

// QuizSession associations
QuizSession.belongsTo(Driver, {
    foreignKey: 'driver_id',
    as: 'driver'
});

QuizSession.hasMany(QuizResponse, {
    foreignKey: 'quiz_session_id',
    as: 'responses',
    onDelete: 'CASCADE'
});

// QuizResponse associations
QuizResponse.belongsTo(QuizSession, {
    foreignKey: 'quiz_session_id',
    as: 'quizSession'
});

QuizResponse.belongsTo(Question, {
    foreignKey: 'question_id',
    as: 'question'
});

// Question associations
Question.hasMany(QuizResponse, {
    foreignKey: 'question_id',
    as: 'responses',
    onDelete: 'CASCADE'
});

Question.belongsTo(Admin, {
    foreignKey: 'created_by',
    as: 'creator'
});

// Admin associations
Admin.hasMany(Question, {
    foreignKey: 'created_by',
    as: 'createdQuestions'
});

// Export models and sequelize instance
module.exports = {
    sequelize,
    Sequelize,
    Driver,
    Question,
    QuizSession,
    QuizResponse,
    Quote,
    Admin,
    AuditLog
};
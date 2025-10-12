const {
    DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Driver = sequelize.define('Driver', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        device_token: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        language: {
            type: DataTypes.STRING(10),
            defaultValue: 'en',
            validate: {
                isIn: [
                    ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']
                ]
            }
        },
        total_quizzes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        total_correct: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        streak: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        last_quiz_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        }
    }, {
        tableName: 'drivers',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [{
                fields: ['device_token']
            },
            {
                fields: ['language']
            },
            {
                fields: ['last_quiz_date']
            }
        ]
    });

    // Instance methods
    Driver.prototype.calculateAccuracy = function () {
        if (this.total_quizzes === 0) return 0;
        return Math.round((this.total_correct / this.total_quizzes) * 100);
    };

    Driver.prototype.updateStreak = function (quizDate) {
        const today = new Date();
        const lastQuiz = this.last_quiz_date ? new Date(this.last_quiz_date) : null;

        if (!lastQuiz) {
            this.streak = 1;
        } else {
            const diffTime = today - lastQuiz;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                this.streak += 1;
            } else if (diffDays > 1) {
                this.streak = 1;
            }
        }

        this.last_quiz_date = quizDate;
        return this.save();
    };

    return Driver;
};
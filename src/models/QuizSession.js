const {
    DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const QuizSession = sequelize.define('QuizSession', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        driver_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'drivers',
                key: 'id'
            }
        },
        quiz_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        total_questions: {
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
        }
    }, {
        tableName: 'quiz_sessions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [{
                unique: true,
                fields: ['driver_id', 'quiz_date']
            },
            {
                fields: ['quiz_date']
            },
            {
                fields: ['completed']
            }
        ]
    });

    // Instance methods
    QuizSession.prototype.calculateScore = function () {
        if (this.total_questions === 0) return 0;
        return Math.round((this.total_correct / this.total_questions) * 100);
    };

    QuizSession.prototype.isPassing = function (passingScore = 60) {
        return this.calculateScore() >= passingScore;
    };

    QuizSession.prototype.addResponse = async function (questionId, selectedOption, isCorrect) {
        const QuizResponse = sequelize.models.QuizResponse;

        await QuizResponse.create({
            quiz_session_id: this.id,
            question_id: questionId,
            selected_option: selectedOption,
            correct: isCorrect
        });

        // Update session totals
        this.total_questions += 1;
        if (isCorrect) {
            this.total_correct += 1;
        }

        return this.save();
    };

    QuizSession.prototype.complete = async function () {
        // Don't update if already completed
        if (this.completed) {
            return;
        }

        this.completed = true;
        await this.save();

        // Update driver statistics
        const Driver = sequelize.models.Driver;
        const driver = await Driver.findByPk(this.driver_id);

        if (driver) {
            driver.total_quizzes += 1;
            driver.total_correct += this.total_correct;
            await driver.updateStreak(this.quiz_date);
            // Ensure driver is saved (updateStreak saves, but be explicit)
            await driver.save();
        }
    };

    // Class methods
    QuizSession.getTodaysSession = async function (driverId) {
        const today = new Date().toISOString().split('T')[0];

        return await QuizSession.findOne({
            where: {
                driver_id: driverId,
                quiz_date: today
            },
            include: [{
                model: sequelize.models.Driver,
                as: 'driver'
            }]
        });
    };

    QuizSession.createTodaysSession = async function (driverId) {
        const today = new Date().toISOString().split('T')[0];

        return await QuizSession.create({
            driver_id: driverId,
            quiz_date: today
        });
    };

    return QuizSession;
};
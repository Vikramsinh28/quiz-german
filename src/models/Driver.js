const {
    DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Driver = sequelize.define('Driver', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        firebase_uid: {
            type: DataTypes.STRING(128),
            allowNull: false,
            unique: true
        },
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        fcm_token: {
            type: DataTypes.TEXT,
            allowNull: true
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
        // Profile fields
        name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        date_of_birth: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        gender: {
            type: DataTypes.STRING(10),
            allowNull: true,
            validate: {
                isIn: [
                    ['male', 'female', 'other']
                ]
            }
        },
        // Address fields
        address_line1: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        address_line2: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        state_province: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        postal_code: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        country: {
            type: DataTypes.STRING(100),
            defaultValue: 'Germany'
        },
        // License fields
        driver_license_number: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        license_issue_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        license_expiry_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        // Emergency contact
        emergency_contact_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        emergency_contact_phone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        emergency_contact_relationship: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        // Profile completion tracking
        profile_completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        profile_completion_percentage: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100
            }
        },
        // Quiz tracking
        total_quizzes: {
            type: DataTypes.BIGINT,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        total_correct: {
            type: DataTypes.BIGINT,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        total_questions: {
            type: DataTypes.BIGINT,
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
                unique: true,
                fields: ['firebase_uid']
            },
            {
                fields: ['phone_number']
            },
            {
                fields: ['fcm_token']
            },
            {
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
        // Calculate accuracy as percentage: (total_correct / total_questions) * 100
        if (this.total_questions === 0) return 0;
        return Math.round((this.total_correct / this.total_questions) * 100);
    };

    /**
     * Recalculate driver statistics from actual quiz sessions
     * This ensures accuracy by recalculating from source data
     */
    Driver.prototype.recalculateStats = async function () {
        const QuizSession = sequelize.models.QuizSession;

        // Get all completed quiz sessions for this driver
        const completedSessions = await QuizSession.findAll({
            where: {
                driver_id: this.id,
                completed: true
            },
            order: [
                ['quiz_date', 'ASC']
            ]
        });

        // Recalculate total quizzes (count of completed sessions)
        this.total_quizzes = completedSessions.length;

        // Recalculate total correct (sum of all correct answers from all sessions)
        this.total_correct = completedSessions.reduce((sum, session) => {
            return sum + (session.total_correct || 0);
        }, 0);

        // Recalculate total questions (sum of all questions from all sessions)
        this.total_questions = completedSessions.reduce((sum, session) => {
            return sum + (session.total_questions || 0);
        }, 0);

        // Recalculate streak based on consecutive quiz dates
        if (completedSessions.length === 0) {
            this.streak = 0;
            this.last_quiz_date = null;
        } else {
            // Get the most recent quiz date
            const lastSession = completedSessions[completedSessions.length - 1];
            this.last_quiz_date = lastSession.quiz_date;

            // Calculate streak by checking consecutive days
            let currentStreak = 1;
            let previousDate = null;

            // Go through sessions in reverse order (most recent first)
            for (let i = completedSessions.length - 1; i >= 0; i--) {
                const sessionDate = new Date(completedSessions[i].quiz_date);

                if (previousDate === null) {
                    // First (most recent) session
                    previousDate = sessionDate;
                    currentStreak = 1;
                } else {
                    // Calculate days difference
                    const diffTime = previousDate - sessionDate;
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        // Consecutive day - increment streak
                        currentStreak += 1;
                        previousDate = sessionDate;
                    } else if (diffDays === 0) {
                        // Same day - don't change streak, but update previousDate
                        previousDate = sessionDate;
                    } else {
                        // Gap found - stop counting streak
                        break;
                    }
                }
            }

            this.streak = currentStreak;
        }

        return this.save();
    };

    Driver.prototype.updateStreak = function (quizDate) {
        const quizDateObj = new Date(quizDate);
        const lastQuiz = this.last_quiz_date ? new Date(this.last_quiz_date) : null;

        if (!lastQuiz) {
            // First quiz ever
            this.streak = 1;
        } else {
            // Calculate difference in days between quiz dates
            const diffTime = quizDateObj - lastQuiz;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Same day - don't change streak (shouldn't happen, but handle it)
                // Keep current streak
            } else if (diffDays === 1) {
                // Consecutive day - increment streak
                this.streak += 1;
            } else {
                // Gap of more than 1 day - reset streak to 1
                this.streak = 1;
            }
        }

        this.last_quiz_date = quizDate;
        return this.save();
    };

    Driver.prototype.calculateProfileCompletion = function () {
        const fields = [
            'name', 'email', 'date_of_birth', 'gender',
            'address_line1', 'city', 'postal_code', 'country',
            'driver_license_number', 'license_issue_date', 'license_expiry_date',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'
        ];

        const completedFields = fields.filter(field => {
            const value = this[field];
            return value !== null && value !== undefined && value !== '';
        });

        const percentage = Math.round((completedFields.length / fields.length) * 100);
        this.profile_completion_percentage = percentage;
        this.profile_completed = percentage >= 80;

        return {
            percentage,
            completed: this.profile_completed,
            completedFields: completedFields.length,
            totalFields: fields.length
        };
    };

    Driver.prototype.getProfileData = function () {
        return {
            id: this.id,
            firebase_uid: this.firebase_uid,
            phone_number: this.phone_number,
            language: this.language,
            name: this.name,
            email: this.email,
            date_of_birth: this.date_of_birth,
            gender: this.gender,
            address: {
                line1: this.address_line1,
                line2: this.address_line2,
                city: this.city,
                state_province: this.state_province,
                postal_code: this.postal_code,
                country: this.country
            },
            license: {
                number: this.driver_license_number,
                issue_date: this.license_issue_date,
                expiry_date: this.license_expiry_date
            },
            emergency_contact: {
                name: this.emergency_contact_name,
                phone: this.emergency_contact_phone,
                relationship: this.emergency_contact_relationship
            },
            profile_completed: this.profile_completed,
            profile_completion_percentage: this.profile_completion_percentage,
            quiz_stats: {
                total_quizzes: this.total_quizzes,
                total_correct: this.total_correct,
                total_questions: this.total_questions,
                accuracy: this.calculateAccuracy(),
                streak: this.streak,
                last_quiz_date: this.last_quiz_date
            }
        };
    };

    Driver.prototype.getPublicProfileData = function () {
        return {
            id: this.id,
            name: this.name,
            quiz_stats: {
                total_quizzes: this.total_quizzes,
                total_correct: this.total_correct,
                total_questions: this.total_questions,
                accuracy: this.calculateAccuracy(),
                streak: this.streak
            }
        };
    };

    return Driver;
};
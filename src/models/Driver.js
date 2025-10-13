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
                accuracy: this.calculateAccuracy(),
                streak: this.streak
            }
        };
    };

    return Driver;
};
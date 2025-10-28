const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'German Quiz App API',
            version: '1.0.0',
            description: 'A comprehensive API for a German language quiz application with admin authentication, question management, and localized responses.',
            contact: {
                name: 'API Support',
                email: 'support@quiz-german.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [{
                url: 'http://localhost:3000',
                description: 'Development server'
            },
            {
                url: 'https://api.quiz-german.com',
                description: 'Production server'
            }
        ],
        tags: [{
                name: 'Authentication',
                description: 'Authentication and authorization endpoints'
            },
            {
                name: 'Drivers',
                description: 'Driver management and quiz-related endpoints'
            },
            {
                name: 'Admin Management',
                description: 'Admin user management and system administration'
            },
            {
                name: 'Questions',
                description: 'Question management and CRUD operations'
            },
            {
                name: 'Quotes',
                description: 'Daily quotes management and scheduling'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token for admin authentication'
                },
                firebaseAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Firebase ID token for driver authentication'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Error message'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        },
                        data: {
                            type: 'object',
                            nullable: true
                        }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Operation successful'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        },
                        data: {
                            type: 'object'
                        }
                    }
                },
                Admin: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1
                        },
                        username: {
                            type: 'string',
                            example: 'admin'
                        },
                        role: {
                            type: 'string',
                            enum: ['admin', 'editor', 'viewer'],
                            example: 'admin'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: {
                            type: 'string',
                            example: 'admin'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            example: 'admin123'
                        }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Login successful'
                        },
                        data: {
                            type: 'object',
                            properties: {
                                token: {
                                    type: 'string',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                                },
                                admin: {
                                    $ref: '#/components/schemas/Admin'
                                }
                            }
                        }
                    }
                },
                Question: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1
                        },
                        question_text: {
                            type: 'string',
                            example: 'What is the German word for "hello"?'
                        },
                        options: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            example: ['Hallo', 'Guten Tag', 'Tschüss', 'Danke']
                        },
                        correct_option: {
                            type: 'integer',
                            minimum: 0,
                            maximum: 3,
                            example: 0
                        },
                        explanation: {
                            type: 'string',
                            example: 'Hallo is the most common way to say hello in German.'
                        },
                        topic: {
                            type: 'string',
                            example: 'greetings'
                        },
                        language: {
                            type: 'string',
                            enum: ['en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
                            example: 'en'
                        },
                        is_active: {
                            type: 'boolean',
                            example: true
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        }
                    }
                },
                QuestionCreateRequest: {
                    type: 'object',
                    required: ['question_text', 'options', 'correct_option', 'language'],
                    properties: {
                        question_text: {
                            type: 'string',
                            example: 'What is the German word for "hello"?'
                        },
                        options: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            minItems: 4,
                            maxItems: 4,
                            example: ['Hallo', 'Guten Tag', 'Tschüss', 'Danke']
                        },
                        correct_option: {
                            type: 'integer',
                            minimum: 0,
                            maximum: 3,
                            example: 0
                        },
                        explanation: {
                            type: 'string',
                            example: 'Hallo is the most common way to say hello in German.'
                        },
                        topic: {
                            type: 'string',
                            example: 'greetings'
                        },
                        language: {
                            type: 'string',
                            enum: ['en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
                            example: 'en'
                        }
                    }
                },
                Quote: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1
                        },
                        text: {
                            type: 'string',
                            example: 'The journey of a thousand miles begins with one step.'
                        },
                        language: {
                            type: 'string',
                            enum: ['en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
                            example: 'en'
                        },
                        scheduled_date: {
                            type: 'string',
                            format: 'date',
                            example: '2024-01-01'
                        },
                        is_active: {
                            type: 'boolean',
                            example: true
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        }
                    }
                },
                QuoteCreateRequest: {
                    type: 'object',
                    required: ['text', 'language'],
                    properties: {
                        text: {
                            type: 'string',
                            example: 'The journey of a thousand miles begins with one step.'
                        },
                        language: {
                            type: 'string',
                            enum: ['en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
                            example: 'en'
                        },
                        scheduled_date: {
                            type: 'string',
                            format: 'date',
                            example: '2024-01-01'
                        }
                    }
                },
                Driver: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1
                        },
                        firebase_uid: {
                            type: 'string',
                            example: 'firebase_uid_123'
                        },
                        phone_number: {
                            type: 'string',
                            example: '+1234567890'
                        },
                        fcm_token: {
                            type: 'string',
                            example: 'fcm_token_123'
                        },
                        device_token: {
                            type: 'string',
                            example: 'device_token_123'
                        },
                        language: {
                            type: 'string',
                            enum: ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
                            example: 'en'
                        },
                        name: {
                            type: 'string',
                            example: 'John Doe'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john.doe@example.com'
                        },
                        date_of_birth: {
                            type: 'string',
                            format: 'date',
                            example: '1990-01-01'
                        },
                        gender: {
                            type: 'string',
                            enum: ['male', 'female', 'other'],
                            example: 'male'
                        },
                        address: {
                            type: 'object',
                            properties: {
                                line1: {
                                    type: 'string',
                                    example: '123 Main Street'
                                },
                                line2: {
                                    type: 'string',
                                    example: 'Apt 4B'
                                },
                                city: {
                                    type: 'string',
                                    example: 'Berlin'
                                },
                                state_province: {
                                    type: 'string',
                                    example: 'Berlin'
                                },
                                postal_code: {
                                    type: 'string',
                                    example: '10115'
                                },
                                country: {
                                    type: 'string',
                                    example: 'Germany'
                                }
                            }
                        },
                        license: {
                            type: 'object',
                            properties: {
                                number: {
                                    type: 'string',
                                    example: 'DL123456789'
                                },
                                issue_date: {
                                    type: 'string',
                                    format: 'date',
                                    example: '2020-01-01'
                                },
                                expiry_date: {
                                    type: 'string',
                                    format: 'date',
                                    example: '2030-01-01'
                                }
                            }
                        },
                        emergency_contact: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    example: 'Jane Doe'
                                },
                                phone: {
                                    type: 'string',
                                    example: '+1234567890'
                                },
                                relationship: {
                                    type: 'string',
                                    example: 'Spouse'
                                }
                            }
                        },
                        profile_completed: {
                            type: 'boolean',
                            example: true
                        },
                        profile_completion_percentage: {
                            type: 'integer',
                            minimum: 0,
                            maximum: 100,
                            example: 85
                        },
                        quiz_stats: {
                            type: 'object',
                            properties: {
                                total_quizzes: {
                                    type: 'integer',
                                    example: 10
                                },
                                total_correct: {
                                    type: 'integer',
                                    example: 8
                                },
                                accuracy: {
                                    type: 'integer',
                                    example: 80
                                },
                                streak: {
                                    type: 'integer',
                                    example: 5
                                },
                                last_quiz_date: {
                                    type: 'string',
                                    format: 'date',
                                    example: '2024-01-01'
                                }
                            }
                        },
                        total_quizzes: {
                            type: 'integer',
                            example: 10
                        },
                        total_correct: {
                            type: 'integer',
                            example: 8
                        },
                        streak: {
                            type: 'integer',
                            example: 5
                        },
                        last_quiz_date: {
                            type: 'string',
                            format: 'date',
                            example: '2024-01-01'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        }
                    }
                },
                DriverProfileUpdateRequest: {
                    type: 'object',
                    properties: {
                        phone_number: {
                            type: 'string',
                            example: '+1234567890'
                        },
                        fcm_token: {
                            type: 'string',
                            example: 'fcm_token_123'
                        },
                        device_token: {
                            type: 'string',
                            example: 'device_token_456'
                        },
                        language: {
                            type: 'string',
                            enum: ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
                            example: 'en'
                        },
                        name: {
                            type: 'string',
                            example: 'John Doe'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john.doe@example.com'
                        },
                        date_of_birth: {
                            type: 'string',
                            format: 'date',
                            example: '1990-01-01'
                        },
                        gender: {
                            type: 'string',
                            enum: ['male', 'female', 'other'],
                            example: 'male'
                        },
                        address_line1: {
                            type: 'string',
                            example: '123 Main Street'
                        },
                        address_line2: {
                            type: 'string',
                            example: 'Apt 4B'
                        },
                        city: {
                            type: 'string',
                            example: 'Berlin'
                        },
                        state_province: {
                            type: 'string',
                            example: 'Berlin'
                        },
                        postal_code: {
                            type: 'string',
                            example: '10115'
                        },
                        country: {
                            type: 'string',
                            example: 'Germany'
                        },
                        driver_license_number: {
                            type: 'string',
                            example: 'DL123456789'
                        },
                        license_issue_date: {
                            type: 'string',
                            format: 'date',
                            example: '2020-01-01'
                        },
                        license_expiry_date: {
                            type: 'string',
                            format: 'date',
                            example: '2030-01-01'
                        },
                        emergency_contact_name: {
                            type: 'string',
                            example: 'Jane Doe'
                        },
                        emergency_contact_phone: {
                            type: 'string',
                            example: '+1234567890'
                        },
                        emergency_contact_relationship: {
                            type: 'string',
                            example: 'Spouse'
                        }
                    }
                },
                DriverProfileUpdateResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Profile updated successfully'
                        },
                        data: {
                            $ref: '#/components/schemas/Driver'
                        }
                    }
                },
                QuizSession: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1
                        },
                        driver_id: {
                            type: 'integer',
                            example: 1
                        },
                        quiz_date: {
                            type: 'string',
                            format: 'date',
                            example: '2024-01-01'
                        },
                        completed: {
                            type: 'boolean',
                            example: true
                        },
                        total_questions: {
                            type: 'integer',
                            example: 5
                        },
                        total_correct: {
                            type: 'integer',
                            example: 4
                        },
                        score: {
                            type: 'number',
                            format: 'float',
                            example: 80.0
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        }
                    }
                },
                QuizQuestion: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1
                        },
                        question_text: {
                            type: 'string',
                            example: 'What is the speed limit in school zones?'
                        },
                        options: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            example: ['20 km/h', '30 km/h', '40 km/h', '50 km/h']
                        },
                        topic: {
                            type: 'string',
                            example: 'Traffic Rules'
                        }
                    }
                },
                QuizAnswer: {
                    type: 'object',
                    properties: {
                        question_id: {
                            type: 'integer',
                            example: 1
                        },
                        question_text: {
                            type: 'string',
                            example: 'What is the speed limit in school zones?'
                        },
                        selected_option: {
                            type: 'integer',
                            example: 0
                        },
                        correct_option: {
                            type: 'integer',
                            example: 0
                        },
                        correct: {
                            type: 'boolean',
                            example: true
                        },
                        explanation: {
                            type: 'string',
                            example: 'School zones typically have a speed limit of 20 km/h for safety.'
                        },
                        answered_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        }
                    }
                },
                QuizSessionWithAnswers: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1
                        },
                        driver_id: {
                            type: 'integer',
                            example: 1
                        },
                        driver_name: {
                            type: 'string',
                            example: 'John Doe'
                        },
                        driver_phone: {
                            type: 'string',
                            example: '+1234567890'
                        },
                        quiz_date: {
                            type: 'string',
                            format: 'date',
                            example: '2024-01-01'
                        },
                        total_questions: {
                            type: 'integer',
                            example: 5
                        },
                        total_correct: {
                            type: 'integer',
                            example: 4
                        },
                        score: {
                            type: 'number',
                            format: 'float',
                            example: 80.0
                        },
                        completed: {
                            type: 'boolean',
                            example: true
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        },
                        answers: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/QuizAnswer'
                            }
                        }
                    }
                },
                QuizStatistics: {
                    type: 'object',
                    properties: {
                        total_sessions: {
                            type: 'integer',
                            example: 150
                        },
                        total_drivers: {
                            type: 'integer',
                            example: 75
                        },
                        average_score: {
                            type: 'number',
                            format: 'float',
                            example: 78.5
                        },
                        completion_rate: {
                            type: 'number',
                            format: 'float',
                            example: 85.2
                        },
                        daily_stats: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    date: {
                                        type: 'string',
                                        format: 'date',
                                        example: '2024-01-01'
                                    },
                                    sessions_count: {
                                        type: 'integer',
                                        example: 25
                                    },
                                    average_score: {
                                        type: 'number',
                                        format: 'float',
                                        example: 82.3
                                    }
                                }
                            }
                        }
                    }
                },
                TopPerformer: {
                    type: 'object',
                    properties: {
                        driver_id: {
                            type: 'integer',
                            example: 1
                        },
                        driver_name: {
                            type: 'string',
                            example: 'John Doe'
                        },
                        total_sessions: {
                            type: 'integer',
                            example: 30
                        },
                        average_score: {
                            type: 'number',
                            format: 'float',
                            example: 92.5
                        },
                        streak: {
                            type: 'integer',
                            example: 15
                        }
                    }
                },
                QuestionAnalytics: {
                    type: 'object',
                    properties: {
                        question_id: {
                            type: 'integer',
                            example: 1
                        },
                        question_text: {
                            type: 'string',
                            example: 'What is the speed limit in school zones?'
                        },
                        total_attempts: {
                            type: 'integer',
                            example: 150
                        },
                        correct_attempts: {
                            type: 'integer',
                            example: 120
                        },
                        accuracy_rate: {
                            type: 'number',
                            format: 'float',
                            example: 80.0
                        }
                    }
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./src/routes/*.js', './src/app.js']
};

const specs = swaggerJSDoc(options);

module.exports = specs;
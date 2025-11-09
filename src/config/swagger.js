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
            },
            {
                name: 'Translation',
                description: 'AWS Translate integration for text translation'
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
            parameters: {
                LanguageParameter: {
                    name: 'lang',
                    in: 'query',
                    description: 'Target language code for automatic response translation. If provided, all text fields in the response will be translated to this language using AWS Translate. Supported languages: en, es, fr, de, it, pt, ru, zh, ja, ko, ar, hi, nl, pl, tr, sv, da, fi, no, cs, ro, hu, bg, hr, sk, sl, et, lv, lt, mt, ga, cy, is, mk, sq, sr, th, vi, id, ms, tl, sw, af, zu, xh, yo, ig, ha. See /api/v1/translate/languages for full list.',
                    required: false,
                    schema: {
                        type: 'string',
                        example: 'es',
                        enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'nl', 'pl', 'tr', 'sv', 'da', 'fi', 'no', 'cs', 'ro', 'hu', 'bg', 'hr', 'sk', 'sl', 'et', 'lv', 'lt', 'mt', 'ga', 'cy', 'is', 'mk', 'sq', 'sr', 'th', 'vi', 'id', 'ms', 'tl', 'sw', 'af', 'zu', 'xh', 'yo', 'ig', 'ha']
                    }
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
                            enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'nl', 'pl', 'tr', 'sv', 'da', 'fi', 'no', 'cs', 'ro', 'hu', 'bg', 'hr', 'sk', 'sl', 'et', 'lv', 'lt', 'mt', 'ga', 'cy', 'is', 'mk', 'sq', 'sr', 'th', 'vi', 'id', 'ms', 'tl', 'sw', 'af', 'zu', 'xh', 'yo', 'ig', 'ha'],
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
                            enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'nl', 'pl', 'tr', 'sv', 'da', 'fi', 'no', 'cs', 'ro', 'hu', 'bg', 'hr', 'sk', 'sl', 'et', 'lv', 'lt', 'mt', 'ga', 'cy', 'is', 'mk', 'sq', 'sr', 'th', 'vi', 'id', 'ms', 'tl', 'sw', 'af', 'zu', 'xh', 'yo', 'ig', 'ha'],
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
                            enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'nl', 'pl', 'tr', 'sv', 'da', 'fi', 'no', 'cs', 'ro', 'hu', 'bg', 'hr', 'sk', 'sl', 'et', 'lv', 'lt', 'mt', 'ga', 'cy', 'is', 'mk', 'sq', 'sr', 'th', 'vi', 'id', 'ms', 'tl', 'sw', 'af', 'zu', 'xh', 'yo', 'ig', 'ha'],
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
                            enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'nl', 'pl', 'tr', 'sv', 'da', 'fi', 'no', 'cs', 'ro', 'hu', 'bg', 'hr', 'sk', 'sl', 'et', 'lv', 'lt', 'mt', 'ga', 'cy', 'is', 'mk', 'sq', 'sr', 'th', 'vi', 'id', 'ms', 'tl', 'sw', 'af', 'zu', 'xh', 'yo', 'ig', 'ha'],
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
                },
                OverviewMetrics: {
                    type: 'object',
                    properties: {
                        total_sessions: {
                            type: 'integer',
                            example: 150,
                            description: 'Total number of quiz sessions'
                        },
                        completed_sessions: {
                            type: 'integer',
                            example: 120,
                            description: 'Number of completed sessions'
                        },
                        completion_rate: {
                            type: 'number',
                            format: 'float',
                            example: 80.0,
                            description: 'Percentage of sessions completed'
                        },
                        unique_drivers: {
                            type: 'integer',
                            example: 75,
                            description: 'Number of unique drivers who participated'
                        },
                        total_questions_answered: {
                            type: 'integer',
                            example: 600,
                            description: 'Total number of questions answered'
                        },
                        total_correct_answers: {
                            type: 'integer',
                            example: 450,
                            description: 'Total number of correct answers'
                        },
                        overall_accuracy: {
                            type: 'number',
                            format: 'float',
                            example: 75.0,
                            description: 'Overall accuracy percentage'
                        },
                        average_score: {
                            type: 'number',
                            format: 'float',
                            example: 78.2,
                            description: 'Average score across all sessions'
                        },
                        median_score: {
                            type: 'number',
                            format: 'float',
                            example: 80.0,
                            description: 'Median score across all sessions'
                        },
                        score_distribution: {
                            type: 'object',
                            properties: {
                                excellent: {
                                    type: 'integer',
                                    example: 30,
                                    description: 'Sessions with score 90-100%'
                                },
                                good: {
                                    type: 'integer',
                                    example: 50,
                                    description: 'Sessions with score 70-89%'
                                },
                                average: {
                                    type: 'integer',
                                    example: 30,
                                    description: 'Sessions with score 50-69%'
                                },
                                poor: {
                                    type: 'integer',
                                    example: 10,
                                    description: 'Sessions with score 0-49%'
                                }
                            }
                        },
                        explanation: {
                            type: 'string',
                            example: 'Out of 150 total quiz sessions, 120 were completed (80% completion rate)...'
                        }
                    }
                },
                PerformanceTrends: {
                    type: 'object',
                    properties: {
                        daily_trends: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    date: {
                                        type: 'string',
                                        format: 'date',
                                        example: '2024-01-15'
                                    },
                                    session_count: {
                                        type: 'integer',
                                        example: 25
                                    },
                                    average_score: {
                                        type: 'number',
                                        format: 'float',
                                        example: 82.3
                                    },
                                    total_questions: {
                                        type: 'integer',
                                        example: 125
                                    },
                                    total_correct: {
                                        type: 'integer',
                                        example: 100
                                    }
                                }
                            }
                        },
                        trend_direction: {
                            type: 'string',
                            enum: ['improving', 'declining', 'stable'],
                            example: 'improving'
                        },
                        explanation: {
                            type: 'string',
                            example: 'Performance trends show 30 days of activity. Performance is improving...'
                        }
                    }
                },
                DriverAnalysis: {
                    type: 'object',
                    properties: {
                        total_drivers: {
                            type: 'integer',
                            example: 75
                        },
                        average_sessions_per_driver: {
                            type: 'number',
                            format: 'float',
                            example: 1.6
                        },
                        top_performers: {
                            type: 'array',
                            items: {
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
                                    driver_phone: {
                                        type: 'string',
                                        example: '+1234567890'
                                    },
                                    driver_language: {
                                        type: 'string',
                                        example: 'en'
                                    },
                                    total_sessions: {
                                        type: 'integer',
                                        example: 30
                                    },
                                    completed_sessions: {
                                        type: 'integer',
                                        example: 28
                                    },
                                    average_score: {
                                        type: 'number',
                                        format: 'float',
                                        example: 92.5
                                    },
                                    accuracy: {
                                        type: 'number',
                                        format: 'float',
                                        example: 90.0
                                    },
                                    completion_rate: {
                                        type: 'number',
                                        format: 'float',
                                        example: 93.3
                                    },
                                    performance_category: {
                                        type: 'string',
                                        enum: ['excellent', 'good', 'average', 'needs_improvement'],
                                        example: 'excellent'
                                    },
                                    streak: {
                                        type: 'integer',
                                        example: 15
                                    }
                                }
                            }
                        },
                        bottom_performers: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/DriverPerformance'
                            }
                        },
                        most_active_drivers: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/DriverPerformance'
                            }
                        },
                        performance_distribution: {
                            type: 'object',
                            properties: {
                                excellent: {
                                    type: 'integer',
                                    example: 20
                                },
                                good: {
                                    type: 'integer',
                                    example: 30
                                },
                                average: {
                                    type: 'integer',
                                    example: 20
                                },
                                needs_improvement: {
                                    type: 'integer',
                                    example: 5
                                }
                            }
                        },
                        explanation: {
                            type: 'string',
                            example: 'Analysis of 75 drivers shows an average of 1.6 completed sessions per driver...'
                        }
                    }
                },
                DriverPerformance: {
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
                        completed_sessions: {
                            type: 'integer',
                            example: 28
                        },
                        average_score: {
                            type: 'number',
                            format: 'float',
                            example: 92.5
                        },
                        accuracy: {
                            type: 'number',
                            format: 'float',
                            example: 90.0
                        },
                        completion_rate: {
                            type: 'number',
                            format: 'float',
                            example: 93.3
                        },
                        performance_category: {
                            type: 'string',
                            enum: ['excellent', 'good', 'average', 'needs_improvement']
                        }
                    }
                },
                QuestionAnalysis: {
                    type: 'object',
                    properties: {
                        total_questions: {
                            type: 'integer',
                            example: 100
                        },
                        difficulty_distribution: {
                            type: 'object',
                            properties: {
                                easy: {
                                    type: 'integer',
                                    example: 30,
                                    description: 'Questions with accuracy >= 70%'
                                },
                                medium: {
                                    type: 'integer',
                                    example: 50,
                                    description: 'Questions with accuracy 40-69%'
                                },
                                hard: {
                                    type: 'integer',
                                    example: 20,
                                    description: 'Questions with accuracy < 40%'
                                }
                            }
                        },
                        easiest_questions: {
                            type: 'array',
                            items: {
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
                                    topic: {
                                        type: 'string',
                                        example: 'Speed Limits'
                                    },
                                    total_attempts: {
                                        type: 'integer',
                                        example: 150
                                    },
                                    correct_attempts: {
                                        type: 'integer',
                                        example: 135
                                    },
                                    accuracy: {
                                        type: 'number',
                                        format: 'float',
                                        example: 90.0
                                    },
                                    difficulty_level: {
                                        type: 'string',
                                        enum: ['easy', 'medium', 'hard']
                                    }
                                }
                            }
                        },
                        hardest_questions: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/QuestionDetail'
                            }
                        },
                        topic_analysis: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    topic: {
                                        type: 'string',
                                        example: 'Speed Limits'
                                    },
                                    total_questions: {
                                        type: 'integer',
                                        example: 20
                                    },
                                    total_attempts: {
                                        type: 'integer',
                                        example: 300
                                    },
                                    total_correct: {
                                        type: 'integer',
                                        example: 225
                                    },
                                    average_accuracy: {
                                        type: 'number',
                                        format: 'float',
                                        example: 75.0
                                    }
                                }
                            }
                        },
                        explanation: {
                            type: 'string',
                            example: 'Analysis of 100 questions shows 30 easy questions (30%), 50 medium questions (50%), and 20 hard questions (20%)...'
                        }
                    }
                },
                QuestionDetail: {
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
                        topic: {
                            type: 'string',
                            example: 'Speed Limits'
                        },
                        language: {
                            type: 'string',
                            example: 'en'
                        },
                        total_attempts: {
                            type: 'integer',
                            example: 150
                        },
                        correct_attempts: {
                            type: 'integer',
                            example: 45
                        },
                        incorrect_attempts: {
                            type: 'integer',
                            example: 105
                        },
                        accuracy: {
                            type: 'number',
                            format: 'float',
                            example: 30.0
                        },
                        difficulty_level: {
                            type: 'string',
                            enum: ['easy', 'medium', 'hard'],
                            example: 'hard'
                        },
                        most_common_mistake: {
                            type: 'string',
                            example: '2',
                            description: 'Most commonly selected incorrect option'
                        },
                        option_selections: {
                            type: 'object',
                            additionalProperties: {
                                type: 'integer'
                            },
                            example: {
                                '0': 45,
                                '1': 30,
                                '2': 50,
                                '3': 25
                            }
                        }
                    }
                },
                EngagementMetrics: {
                    type: 'object',
                    properties: {
                        daily_engagement: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    date: {
                                        type: 'string',
                                        format: 'date',
                                        example: '2024-01-15'
                                    },
                                    unique_drivers: {
                                        type: 'integer',
                                        example: 25
                                    },
                                    total_sessions: {
                                        type: 'integer',
                                        example: 30
                                    },
                                    completed_sessions: {
                                        type: 'integer',
                                        example: 28
                                    },
                                    engagement_rate: {
                                        type: 'number',
                                        format: 'float',
                                        example: 93.3
                                    }
                                }
                            }
                        },
                        average_days_active_per_driver: {
                            type: 'number',
                            format: 'float',
                            example: 5.2
                        },
                        most_engaged_drivers: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    driver_id: {
                                        type: 'integer',
                                        example: 1
                                    },
                                    days_active: {
                                        type: 'integer',
                                        example: 15
                                    },
                                    total_sessions: {
                                        type: 'integer',
                                        example: 18
                                    },
                                    completed_sessions: {
                                        type: 'integer',
                                        example: 17
                                    },
                                    average_sessions_per_day: {
                                        type: 'number',
                                        format: 'float',
                                        example: 1.13
                                    }
                                }
                            }
                        },
                        peak_engagement_day: {
                            type: 'object',
                            nullable: true,
                            properties: {
                                date: {
                                    type: 'string',
                                    format: 'date',
                                    example: '2024-01-15'
                                },
                                unique_drivers: {
                                    type: 'integer',
                                    example: 30
                                },
                                total_sessions: {
                                    type: 'integer',
                                    example: 35
                                },
                                completed_sessions: {
                                    type: 'integer',
                                    example: 33
                                }
                            }
                        },
                        explanation: {
                            type: 'string',
                            example: 'Engagement analysis shows drivers are active an average of 5.2 days...'
                        }
                    }
                },
                TimeAnalysis: {
                    type: 'object',
                    properties: {
                        hour_distribution: {
                            type: 'object',
                            additionalProperties: {
                                type: 'integer'
                            },
                            description: 'Number of sessions per hour (0-23)',
                            example: {
                                '8': 15,
                                '9': 25,
                                '10': 30,
                                '14': 20,
                                '18': 25
                            }
                        },
                        day_of_week_distribution: {
                            type: 'object',
                            additionalProperties: {
                                type: 'integer'
                            },
                            description: 'Number of sessions per day of week',
                            example: {
                                'Monday': 50,
                                'Tuesday': 45,
                                'Wednesday': 55,
                                'Thursday': 48,
                                'Friday': 52,
                                'Saturday': 30,
                                'Sunday': 25
                            }
                        },
                        peak_hour: {
                            type: 'object',
                            nullable: true,
                            properties: {
                                hour: {
                                    type: 'integer',
                                    example: 10,
                                    description: 'Hour of day (0-23)'
                                },
                                sessions: {
                                    type: 'integer',
                                    example: 30
                                },
                                time_period: {
                                    type: 'string',
                                    enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
                                    example: 'Morning'
                                }
                            }
                        },
                        peak_day: {
                            type: 'object',
                            nullable: true,
                            properties: {
                                day: {
                                    type: 'string',
                                    example: 'Wednesday'
                                },
                                sessions: {
                                    type: 'integer',
                                    example: 55
                                }
                            }
                        },
                        explanation: {
                            type: 'string',
                            example: 'Time pattern analysis shows peak activity at Morning (30 sessions) and most activity on Wednesday (55 sessions)...'
                        }
                    }
                },
                Insight: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['success', 'warning', 'info'],
                            example: 'warning',
                            description: 'Type of insight'
                        },
                        category: {
                            type: 'string',
                            example: 'Performance',
                            description: 'Category of insight (Performance, Engagement, Trends, Questions)'
                        },
                        title: {
                            type: 'string',
                            example: 'Low Overall Accuracy',
                            description: 'Title of the insight'
                        },
                        description: {
                            type: 'string',
                            example: 'The overall accuracy of 65% is below the recommended threshold of 60%...',
                            description: 'Detailed description of the insight'
                        },
                        impact: {
                            type: 'string',
                            enum: ['high', 'medium', 'low'],
                            example: 'high',
                            description: 'Impact level of the insight'
                        },
                        actionable: {
                            type: 'boolean',
                            example: true,
                            description: 'Whether the insight requires action'
                        }
                    }
                },
                Recommendation: {
                    type: 'object',
                    properties: {
                        priority: {
                            type: 'string',
                            enum: ['high', 'medium', 'low'],
                            example: 'high',
                            description: 'Priority level of the recommendation'
                        },
                        category: {
                            type: 'string',
                            example: 'Performance',
                            description: 'Category of recommendation (Performance, Engagement, Support, Questions, Timing)'
                        },
                        title: {
                            type: 'string',
                            example: 'Improve Question Difficulty Balance',
                            description: 'Title of the recommendation'
                        },
                        description: {
                            type: 'string',
                            example: 'Consider reviewing and adjusting question difficulty. Add more medium-difficulty questions...',
                            description: 'Detailed description of the recommendation'
                        },
                        action_items: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            example: [
                                'Review hardest questions and consider simplifying or improving explanations',
                                'Add more practice questions for difficult topics',
                                'Provide additional learning resources for low-performing areas'
                            ],
                            description: 'List of actionable items to implement the recommendation'
                        }
                    }
                },
                ComprehensiveAnalysis: {
                    type: 'object',
                    properties: {
                        overview: {
                            $ref: '#/components/schemas/OverviewMetrics'
                        },
                        performance_trends: {
                            $ref: '#/components/schemas/PerformanceTrends'
                        },
                        driver_analysis: {
                            $ref: '#/components/schemas/DriverAnalysis'
                        },
                        question_analysis: {
                            $ref: '#/components/schemas/QuestionAnalysis'
                        },
                        engagement_metrics: {
                            $ref: '#/components/schemas/EngagementMetrics'
                        },
                        time_analysis: {
                            $ref: '#/components/schemas/TimeAnalysis'
                        },
                        insights: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Insight'
                            },
                            description: 'Automatically generated insights based on the analysis'
                        },
                        recommendations: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Recommendation'
                            },
                            description: 'Prioritized recommendations with actionable items'
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
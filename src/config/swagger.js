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
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token for admin authentication'
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
                            type: 'string',
                            format: 'uuid',
                            example: '550e8400-e29b-41d4-a716-446655440001'
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
                            type: 'string',
                            format: 'uuid',
                            example: '550e8400-e29b-41d4-a716-446655440001'
                        },
                        question_text: {
                            type: 'string',
                            example: 'What is the German word for "hello"?'
                        },
                        options: {
                            type: 'string',
                            example: '["Hallo", "Guten Tag", "Tschüss", "Danke"]'
                        },
                        correct_option: {
                            type: 'integer',
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
                Quote: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '550e8400-e29b-41d4-a716-446655440001'
                        },
                        text: {
                            type: 'string',
                            example: 'The journey of a thousand miles begins with one step.'
                        },
                        language: {
                            type: 'string',
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
                Driver: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '550e8400-e29b-41d4-a716-446655440001'
                        },
                        device_token: {
                            type: 'string',
                            example: 'device_token_123'
                        },
                        language: {
                            type: 'string',
                            example: 'en'
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
                        }
                    }
                },
                QuizSession: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '550e8400-e29b-41d4-a716-446655440001'
                        },
                        driver_id: {
                            type: 'string',
                            format: 'uuid',
                            example: '550e8400-e29b-41d4-a716-446655440001'
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
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
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
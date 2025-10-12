'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Sample German questions
        const germanQuestions = [{
                question_text: {
                    en: "What is the speed limit in residential areas in Germany?",
                    de: "Wie hoch ist die Geschwindigkeitsbegrenzung in Wohngebieten in Deutschland?"
                },
                options: {
                    en: ["30 km/h", "50 km/h", "60 km/h", "70 km/h"],
                    de: ["30 km/h", "50 km/h", "60 km/h", "70 km/h"]
                },
                correct_option: 0,
                explanation: {
                    en: "In residential areas (Wohngebiete), the speed limit is 30 km/h to ensure pedestrian safety.",
                    de: "In Wohngebieten beträgt die Geschwindigkeitsbegrenzung 30 km/h, um die Sicherheit der Fußgänger zu gewährleisten."
                },
                topic: "Traffic Rules",
                language: "de",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                question_text: {
                    en: "What does a red traffic light mean?",
                    de: "Was bedeutet eine rote Ampel?"
                },
                options: {
                    en: ["Stop", "Slow down", "Proceed with caution", "Yield"],
                    de: ["Anhalten", "Verlangsamen", "Mit Vorsicht fahren", "Vorfahrt gewähren"]
                },
                correct_option: 0,
                explanation: {
                    en: "A red traffic light means you must stop completely before the stop line.",
                    de: "Eine rote Ampel bedeutet, dass Sie vollständig vor der Haltelinie anhalten müssen."
                },
                topic: "Traffic Signs",
                language: "de",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                question_text: {
                    en: "When must you use your turn signals?",
                    de: "Wann müssen Sie Ihre Blinker verwenden?"
                },
                options: {
                    en: ["Only when changing lanes", "Only when turning", "When changing direction or lanes", "Only in heavy traffic"],
                    de: ["Nur beim Spurwechsel", "Nur beim Abbiegen", "Bei Richtungs- oder Spurwechsel", "Nur bei starkem Verkehr"]
                },
                correct_option: 2,
                explanation: {
                    en: "You must use turn signals when changing direction or lanes to inform other road users of your intentions.",
                    de: "Sie müssen Blinker verwenden, wenn Sie die Richtung oder Spur wechseln, um andere Verkehrsteilnehmer über Ihre Absichten zu informieren."
                },
                topic: "Driving Rules",
                language: "de",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                question_text: {
                    en: "What is the legal blood alcohol limit for drivers in Germany?",
                    de: "Wie hoch ist die gesetzliche Blutalkoholgrenze für Fahrer in Deutschland?"
                },
                options: {
                    en: ["0.0‰", "0.3‰", "0.5‰", "0.8‰"],
                    de: ["0,0‰", "0,3‰", "0,5‰", "0,8‰"]
                },
                correct_option: 2,
                explanation: {
                    en: "The legal blood alcohol limit for drivers in Germany is 0.5‰ (0.5 per mille).",
                    de: "Die gesetzliche Blutalkoholgrenze für Fahrer in Deutschland beträgt 0,5‰ (0,5 Promille)."
                },
                topic: "Safety",
                language: "de",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                question_text: {
                    en: "What does a yellow traffic light mean?",
                    de: "Was bedeutet eine gelbe Ampel?"
                },
                options: {
                    en: ["Stop if possible", "Speed up", "Continue at same speed", "Yield to pedestrians"],
                    de: ["Anhalten, wenn möglich", "Beschleunigen", "Mit gleicher Geschwindigkeit weiterfahren", "Fußgängern Vorfahrt gewähren"]
                },
                correct_option: 0,
                explanation: {
                    en: "A yellow traffic light means you should stop if it's safe to do so, otherwise proceed with caution.",
                    de: "Eine gelbe Ampel bedeutet, dass Sie anhalten sollten, wenn es sicher ist, andernfalls mit Vorsicht weiterfahren."
                },
                topic: "Traffic Signs",
                language: "de",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ];

        // Sample German quotes
        const germanQuotes = [{
                text: {
                    en: "Safety first, speed second.",
                    de: "Sicherheit zuerst, Geschwindigkeit zweitens."
                },
                language: "de",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                text: {
                    en: "A good driver is a defensive driver.",
                    de: "Ein guter Fahrer ist ein defensiver Fahrer."
                },
                language: "de",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                text: {
                    en: "Traffic rules exist to protect everyone.",
                    de: "Verkehrsregeln existieren, um alle zu schützen."
                },
                language: "de",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                text: {
                    en: "Patience on the road saves lives.",
                    de: "Geduld auf der Straße rettet Leben."
                },
                language: "de",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ];

        // Insert questions
        await queryInterface.bulkInsert('questions', germanQuestions, {});

        // Insert quotes
        await queryInterface.bulkInsert('quotes', germanQuotes, {});
    },

    async down(queryInterface, Sequelize) {
        // Remove German content
        await queryInterface.bulkDelete('questions', {
            language: 'de'
        }, {});

        await queryInterface.bulkDelete('quotes', {
            language: 'de'
        }, {});
    }
};
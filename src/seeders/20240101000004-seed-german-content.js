'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Sample German questions
        const germanQuestions = [
            {
                question_text: "Wie hoch ist die Geschwindigkeitsbegrenzung in Wohngebieten in Deutschland?",
                options: JSON.stringify(["30 km/h", "50 km/h", "60 km/h", "70 km/h"]),
                correct_option: 0,
                explanation: "In Wohngebieten beträgt die Geschwindigkeitsbegrenzung 30 km/h, um die Sicherheit der Fußgänger zu gewährleisten.",
                topic: "Traffic Rules",
                language: "de",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                question_text: "Was bedeutet eine rote Ampel?",
                options: JSON.stringify(["Anhalten", "Verlangsamen", "Mit Vorsicht fahren", "Vorfahrt gewähren"]),
                correct_option: 0,
                explanation: "Eine rote Ampel bedeutet, dass Sie vollständig vor der Haltelinie anhalten müssen.",
                topic: "Traffic Signs",
                language: "de",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                question_text: "Wann müssen Sie Ihre Blinker verwenden?",
                options: JSON.stringify(["Nur beim Spurwechsel", "Nur beim Abbiegen", "Bei Richtungs- oder Spurwechsel", "Nur bei starkem Verkehr"]),
                correct_option: 2,
                explanation: "Sie müssen Blinker verwenden, wenn Sie die Richtung oder Spur wechseln, um andere Verkehrsteilnehmer über Ihre Absichten zu informieren.",
                topic: "Driving Rules",
                language: "de",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                question_text: "Wie hoch ist die gesetzliche Blutalkoholgrenze für Fahrer in Deutschland?",
                options: JSON.stringify(["0,0‰", "0,3‰", "0,5‰", "0,8‰"]),
                correct_option: 2,
                explanation: "Die gesetzliche Blutalkoholgrenze für Fahrer in Deutschland beträgt 0,5‰ (0,5 Promille).",
                topic: "Safety",
                language: "de",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                question_text: "Was bedeutet eine gelbe Ampel?",
                options: JSON.stringify(["Anhalten, wenn möglich", "Beschleunigen", "Mit gleicher Geschwindigkeit weiterfahren", "Fußgängern Vorfahrt gewähren"]),
                correct_option: 0,
                explanation: "Eine gelbe Ampel bedeutet, dass Sie anhalten sollten, wenn es sicher ist, andernfalls mit Vorsicht weiterfahren.",
                topic: "Traffic Signs",
                language: "de",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ];

        // Sample German quotes
        const germanQuotes = [
            {
                text: "Sicherheit zuerst, Geschwindigkeit zweitens.",
                language: "de",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                text: "Ein guter Fahrer ist ein defensiver Fahrer.",
                language: "de",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                text: "Verkehrsregeln existieren, um alle zu schützen.",
                language: "de",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                text: "Geduld auf der Straße rettet Leben.",
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
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('quotes', [{
                text: {
                    en: "Drive safely today and every day. Your life and others depend on it.",
                    fr: "Conduisez prudemment aujourd'hui et chaque jour. Votre vie et celle des autres en dépendent.",
                    es: "Maneja con seguridad hoy y todos los días. Tu vida y la de otros depende de ello."
                },
                language: "en",
                scheduled_date: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                text: {
                    en: "Every mile driven safely is a victory. Keep up the great work!",
                    fr: "Chaque mile parcouru en sécurité est une victoire. Continuez le bon travail!",
                    es: "Cada milla manejada con seguridad es una victoria. ¡Sigue con el buen trabajo!"
                },
                language: "en",
                scheduled_date: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                text: {
                    en: "Safety first, always. Your attention to detail makes all the difference.",
                    fr: "La sécurité d'abord, toujours. Votre attention aux détails fait toute la différence.",
                    es: "Seguridad primero, siempre. Tu atención al detalle marca toda la diferencia."
                },
                language: "en",
                scheduled_date: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                text: {
                    en: "Remember: Defensive driving saves lives. Stay alert and stay safe.",
                    fr: "Rappelez-vous: La conduite défensive sauve des vies. Restez vigilant et restez en sécurité.",
                    es: "Recuerda: Manejar a la defensiva salva vidas. Mantente alerta y mantente seguro."
                },
                language: "en",
                scheduled_date: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                text: {
                    en: "Your commitment to safe driving inspires others. Keep leading by example!",
                    fr: "Votre engagement envers la conduite sécuritaire inspire les autres. Continuez à montrer l'exemple!",
                    es: "Tu compromiso con la conducción segura inspira a otros. ¡Sigue dando el ejemplo!"
                },
                language: "en",
                scheduled_date: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                text: {
                    en: "Every safe trip is a step toward a better tomorrow. Drive with purpose!",
                    fr: "Chaque voyage sécuritaire est un pas vers un meilleur demain. Conduisez avec un but!",
                    es: "Cada viaje seguro es un paso hacia un mejor mañana. ¡Maneja con propósito!"
                },
                language: "en",
                scheduled_date: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                text: {
                    en: "Patience behind the wheel is a virtue. Take your time and arrive safely.",
                    fr: "La patience au volant est une vertu. Prenez votre temps et arrivez en sécurité.",
                    es: "La paciencia al volante es una virtud. Tómate tu tiempo y llega seguro."
                },
                language: "en",
                scheduled_date: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                text: {
                    en: "Weather conditions change, but your commitment to safety should remain constant.",
                    fr: "Les conditions météorologiques changent, mais votre engagement envers la sécurité devrait rester constant.",
                    es: "Las condiciones climáticas cambian, pero tu compromiso con la seguridad debe permanecer constante."
                },
                language: "en",
                scheduled_date: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                text: {
                    en: "Great drivers are made through continuous learning. Keep improving every day!",
                    fr: "Les grands conducteurs se forment par l'apprentissage continu. Continuez à vous améliorer chaque jour!",
                    es: "Los grandes conductores se hacen a través del aprendizaje continuo. ¡Sigue mejorando cada día!"
                },
                language: "en",
                scheduled_date: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                text: {
                    en: "Your family and friends are counting on you to return safely. Drive responsibly.",
                    fr: "Votre famille et vos amis comptent sur vous pour revenir en sécurité. Conduisez de manière responsable.",
                    es: "Tu familia y amigos cuentan contigo para regresar seguro. Maneja responsablemente."
                },
                language: "en",
                scheduled_date: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('quotes', null, {});
    }
};
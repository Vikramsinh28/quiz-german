'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('questions', [{
                question_text: {
                    en: "What is the primary purpose of a traffic light?",
                    fr: "Quel est le but principal d'un feu de circulation?",
                    es: "¿Cuál es el propósito principal de un semáforo?"
                },
                options: {
                    en: [
                        "To control traffic flow and prevent accidents",
                        "To decorate the streets",
                        "To provide lighting at night",
                        "To collect traffic data"
                    ],
                    fr: [
                        "Contrôler le flux de circulation et prévenir les accidents",
                        "Décorer les rues",
                        "Fournir un éclairage la nuit",
                        "Collecter des données de circulation"
                    ],
                    es: [
                        "Controlar el flujo de tráfico y prevenir accidentes",
                        "Decorar las calles",
                        "Proporcionar iluminación por la noche",
                        "Recopilar datos de tráfico"
                    ]
                },
                correct_option: 0,
                explanation: {
                    en: "Traffic lights are designed to control the flow of vehicles and pedestrians at intersections, reducing the risk of collisions.",
                    fr: "Les feux de circulation sont conçus pour contrôler le flux de véhicules et de piétons aux intersections, réduisant le risque de collisions.",
                    es: "Los semáforos están diseñados para controlar el flujo de vehículos y peatones en las intersecciones, reduciendo el riesgo de colisiones."
                },
                topic: "Traffic Safety",
                language: "en",
                created_by: "550e8400-e29b-41d4-a716-446655440001",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                question_text: {
                    en: "What should you do when approaching a yellow traffic light?",
                    fr: "Que devez-vous faire en approchant d'un feu de circulation jaune?",
                    es: "¿Qué debes hacer al acercarte a un semáforo amarillo?"
                },
                options: {
                    en: [
                        "Slow down and prepare to stop if safe to do so",
                        "Speed up to beat the red light",
                        "Continue at the same speed",
                        "Stop immediately regardless of traffic behind"
                    ],
                    fr: [
                        "Ralentir et se préparer à s'arrêter si c'est sécuritaire",
                        "Accélérer pour battre le feu rouge",
                        "Continuer à la même vitesse",
                        "S'arrêter immédiatement peu importe la circulation derrière"
                    ],
                    es: [
                        "Reducir la velocidad y prepararse para detenerse si es seguro hacerlo",
                        "Acelerar para evitar la luz roja",
                        "Continuar a la misma velocidad",
                        "Detenerse inmediatamente sin importar el tráfico detrás"
                    ]
                },
                correct_option: 0,
                explanation: {
                    en: "A yellow light means prepare to stop. You should slow down and stop if you can do so safely, but don't slam on the brakes if you're too close to the intersection.",
                    fr: "Un feu jaune signifie se préparer à s'arrêter. Vous devriez ralentir et vous arrêter si vous pouvez le faire en toute sécurité, mais ne freinez pas brusquement si vous êtes trop près de l'intersection.",
                    es: "Una luz amarilla significa prepararse para detenerse. Debes reducir la velocidad y detenerte si puedes hacerlo de manera segura, pero no frenes bruscamente si estás demasiado cerca de la intersección."
                },
                topic: "Traffic Safety",
                language: "en",
                created_by: "550e8400-e29b-41d4-a716-446655440001",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                question_text: {
                    en: "What is the recommended following distance in good weather conditions?",
                    fr: "Quelle est la distance de suivi recommandée par beau temps?",
                    es: "¿Cuál es la distancia de seguimiento recomendada en condiciones climáticas buenas?"
                },
                options: {
                    en: [
                        "3 seconds behind the vehicle in front",
                        "1 second behind the vehicle in front",
                        "5 seconds behind the vehicle in front",
                        "As close as possible to maintain speed"
                    ],
                    fr: [
                        "3 secondes derrière le véhicule devant",
                        "1 seconde derrière le véhicule devant",
                        "5 secondes derrière le véhicule devant",
                        "Aussi près que possible pour maintenir la vitesse"
                    ],
                    es: [
                        "3 segundos detrás del vehículo de adelante",
                        "1 segundo detrás del vehículo de adelante",
                        "5 segundos detrás del vehículo de adelante",
                        "Tan cerca como sea posible para mantener la velocidad"
                    ]
                },
                correct_option: 0,
                explanation: {
                    en: "The 3-second rule is a safe following distance that gives you enough time to react and stop if the vehicle in front suddenly brakes.",
                    fr: "La règle des 3 secondes est une distance de suivi sécuritaire qui vous donne assez de temps pour réagir et vous arrêter si le véhicule devant freine soudainement.",
                    es: "La regla de 3 segundos es una distancia de seguimiento segura que te da suficiente tiempo para reaccionar y detenerte si el vehículo de adelante frena repentinamente."
                },
                topic: "Safe Driving",
                language: "en",
                created_by: "550e8400-e29b-41d4-a716-446655440001",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                question_text: {
                    en: "When should you use your turn signals?",
                    fr: "Quand devez-vous utiliser vos clignotants?",
                    es: "¿Cuándo debes usar tus direccionales?"
                },
                options: {
                    en: [
                        "At least 100 feet before turning or changing lanes",
                        "Only when other cars are nearby",
                        "Just as you start to turn",
                        "Only on highways"
                    ],
                    fr: [
                        "Au moins 100 pieds avant de tourner ou changer de voie",
                        "Seulement quand d'autres voitures sont à proximité",
                        "Juste au moment où vous commencez à tourner",
                        "Seulement sur les autoroutes"
                    ],
                    es: [
                        "Al menos 100 pies antes de girar o cambiar de carril",
                        "Solo cuando otros autos están cerca",
                        "Justo cuando empiezas a girar",
                        "Solo en carreteras"
                    ]
                },
                correct_option: 0,
                explanation: {
                    en: "Turn signals should be used well in advance to give other drivers time to react to your intended maneuver.",
                    fr: "Les clignotants doivent être utilisés bien à l'avance pour donner aux autres conducteurs le temps de réagir à votre manœuvre prévue.",
                    es: "Las direccionales deben usarse con anticipación para dar a otros conductores tiempo de reaccionar a tu maniobra prevista."
                },
                topic: "Safe Driving",
                language: "en",
                created_by: "550e8400-e29b-41d4-a716-446655440001",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                question_text: {
                    en: "What should you do if your vehicle starts to skid?",
                    fr: "Que devez-vous faire si votre véhicule commence à déraper?",
                    es: "¿Qué debes hacer si tu vehículo comienza a patinar?"
                },
                options: {
                    en: [
                        "Steer in the direction you want to go and avoid sudden movements",
                        "Brake hard to stop the skid",
                        "Accelerate to regain control",
                        "Turn the steering wheel sharply in the opposite direction"
                    ],
                    fr: [
                        "Dirigez dans la direction où vous voulez aller et évitez les mouvements brusques",
                        "Freinez fort pour arrêter le dérapage",
                        "Accélérez pour reprendre le contrôle",
                        "Tournez le volant brusquement dans la direction opposée"
                    ],
                    es: [
                        "Dirige hacia la dirección que quieres ir y evita movimientos bruscos",
                        "Frena fuerte para detener el patinaje",
                        "Acelera para recuperar el control",
                        "Gira el volante bruscamente en la dirección opuesta"
                    ]
                },
                correct_option: 0,
                explanation: {
                    en: "When skidding, steer gently in the direction you want to go and avoid sudden braking or acceleration which can make the skid worse.",
                    fr: "En cas de dérapage, dirigez doucement dans la direction où vous voulez aller et évitez le freinage ou l'accélération brusque qui peut aggraver le dérapage.",
                    es: "Al patinar, dirige suavemente hacia la dirección que quieres ir y evita frenar o acelerar bruscamente lo que puede empeorar el patinaje."
                },
                topic: "Emergency Situations",
                language: "en",
                created_by: "550e8400-e29b-41d4-a716-446655440001",
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('questions', null, {});
    }
};
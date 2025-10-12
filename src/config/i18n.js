const i18next = require('i18next');
const middleware = require('i18next-http-middleware');

// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'de'];
const DEFAULT_LANGUAGE = 'en';

// Language detection options
const detectionOptions = {
    order: ['header', 'querystring', 'cookie'],
    caches: ['cookie'],
    lookupHeader: 'accept-language',
    lookupQuerystring: 'lang',
    lookupCookie: 'i18next',
    cookieOptions: {
        path: '/',
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
    }
};

// Initialize i18next
i18next
    .use(middleware.LanguageDetector)
    .init({
        fallbackLng: DEFAULT_LANGUAGE,
        supportedLngs: SUPPORTED_LANGUAGES,
        debug: process.env.NODE_ENV === 'development',

        // Detection options
        detection: detectionOptions,

        // Resource loading (we'll handle this manually for API responses)
        resources: {
            en: {
                translation: {
                    // API messages
                    'api.success': 'Success',
                    'api.error': 'Error',
                    'api.not_found': 'Resource not found',
                    'api.unauthorized': 'Unauthorized access',
                    'api.forbidden': 'Access forbidden',
                    'api.validation_error': 'Validation error',
                    'api.server_error': 'Internal server error',

                    // Quiz specific messages
                    'quiz.completed': 'Quiz completed successfully',
                    'quiz.invalid_answer': 'Invalid answer provided',
                    'quiz.session_not_found': 'Quiz session not found',
                    'quiz.already_completed': 'Quiz already completed',
                    'quiz.no_questions': 'No questions available',

                    // Driver messages
                    'driver.not_found': 'Driver not found',
                    'driver.already_exists': 'Driver already exists',
                    'driver.invalid_credentials': 'Invalid credentials',

                    // Admin messages
                    'admin.not_found': 'Admin not found',
                    'admin.unauthorized': 'Admin access required',

                    // Question messages
                    'question.not_found': 'Question not found',
                    'question.invalid_format': 'Invalid question format',

                    // Quote messages
                    'quote.not_found': 'Quote not found',
                    'quote.no_quote_today': 'No quote available for today'
                }
            },
            de: {
                translation: {
                    // API messages
                    'api.success': 'Erfolg',
                    'api.error': 'Fehler',
                    'api.not_found': 'Ressource nicht gefunden',
                    'api.unauthorized': 'Unbefugter Zugriff',
                    'api.forbidden': 'Zugriff verweigert',
                    'api.validation_error': 'Validierungsfehler',
                    'api.server_error': 'Interner Serverfehler',

                    // Quiz specific messages
                    'quiz.completed': 'Quiz erfolgreich abgeschlossen',
                    'quiz.invalid_answer': 'Ungültige Antwort bereitgestellt',
                    'quiz.session_not_found': 'Quiz-Sitzung nicht gefunden',
                    'quiz.already_completed': 'Quiz bereits abgeschlossen',
                    'quiz.no_questions': 'Keine Fragen verfügbar',

                    // Driver messages
                    'driver.not_found': 'Fahrer nicht gefunden',
                    'driver.already_exists': 'Fahrer existiert bereits',
                    'driver.invalid_credentials': 'Ungültige Anmeldedaten',

                    // Admin messages
                    'admin.not_found': 'Administrator nicht gefunden',
                    'admin.unauthorized': 'Administrator-Zugriff erforderlich',

                    // Question messages
                    'question.not_found': 'Frage nicht gefunden',
                    'question.invalid_format': 'Ungültiges Fragenformat',

                    // Quote messages
                    'quote.not_found': 'Zitat nicht gefunden',
                    'quote.no_quote_today': 'Kein Zitat für heute verfügbar'
                }
            }
        },

        // Interpolation options
        interpolation: {
            escapeValue: false // React already escapes values
        }
    });

module.exports = {
    i18next,
    middleware,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE,
    detectionOptions
};
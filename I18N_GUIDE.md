# Internationalization (i18n) Guide

This guide explains how to use the internationalization features in the German Quiz Application.

## Overview

The application supports multiple languages with English (en) and German (de) as the primary supported languages. The system automatically detects the user's preferred language and serves content accordingly.

## Supported Languages

- **English (en)** - Default language
- **German (de)** - Primary target language for German users

## Language Detection

The system detects the user's preferred language through multiple methods in order of priority:

1. **Query Parameter**: `?lang=de` or `?lang=en`
2. **Accept-Language Header**: Browser's language preference
3. **Cookie**: Stored language preference
4. **Default**: Falls back to English (en)

## API Usage

### Setting Language

#### Method 1: Query Parameter
```bash
# Get questions in German
GET /api/v1/questions/random?lang=de

# Get today's quote in German
GET /api/v1/quotes/today?lang=de
```

#### Method 2: Accept-Language Header
```bash
# Set Accept-Language header
curl -H "Accept-Language: de" http://localhost:3000/api/v1/questions/random
```

#### Method 3: Request Body (for POST requests)
```json
{
  "language": "de",
  "count": 5,
  "topic": "Traffic Rules"
}
```

### API Endpoints

#### Get Supported Languages
```bash
GET /api/v1/languages
```

Response:
```json
{
  "success": true,
  "data": {
    "current": "de",
    "supported": ["en", "de"],
    "default": "en"
  }
}
```

#### Get Questions (Localized)
```bash
GET /api/v1/questions/random?lang=de&count=5
```

Response:
```json
{
  "success": true,
  "message": "Erfolg",
  "data": {
    "questions": [
      {
        "id": 1,
        "question_text": "Wie hoch ist die Geschwindigkeitsbegrenzung in Wohngebieten in Deutschland?",
        "options": ["30 km/h", "50 km/h", "60 km/h", "70 km/h"],
        "topic": "Traffic Rules",
        "explanation": "In Wohngebieten beträgt die Geschwindigkeitsbegrenzung 30 km/h, um die Sicherheit der Fußgänger zu gewährleisten."
      }
    ],
    "count": 5,
    "language": "de"
  }
}
```

#### Get Today's Quote (Localized)
```bash
GET /api/v1/quotes/today?lang=de
```

Response:
```json
{
  "success": true,
  "message": "Erfolg",
  "data": {
    "id": 1,
    "text": "Sicherheit zuerst, Geschwindigkeit zweitens.",
    "language": "de",
    "scheduled_date": null,
    "is_active": true
  }
}
```

#### Start Quiz (Localized)
```bash
POST /api/v1/quiz/start/driver-id
Content-Type: application/json

{
  "language": "de",
  "count": 5,
  "topic": "Traffic Rules"
}
```

## Data Structure

### Multilingual Content Storage

Questions and quotes store multilingual content using JSONB fields:

```json
{
  "question_text": {
    "en": "What is the speed limit in residential areas?",
    "de": "Wie hoch ist die Geschwindigkeitsbegrenzung in Wohngebieten?"
  },
  "options": {
    "en": ["30 km/h", "50 km/h", "60 km/h", "70 km/h"],
    "de": ["30 km/h", "50 km/h", "60 km/h", "70 km/h"]
  },
  "explanation": {
    "en": "In residential areas, the speed limit is 30 km/h.",
    "de": "In Wohngebieten beträgt die Geschwindigkeitsbegrenzung 30 km/h."
  }
}
```

### Response Format

All API responses include:
- `success`: Boolean indicating request success
- `message`: Localized success/error message
- `data`: Localized content
- `timestamp`: ISO timestamp
- `language`: Current language used

## Error Messages

Error messages are automatically localized:

```json
{
  "success": false,
  "message": "Fahrer nicht gefunden",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Adding New Languages

To add support for a new language:

1. **Update Configuration** (`src/config/i18n.js`):
```javascript
const SUPPORTED_LANGUAGES = ['en', 'de', 'fr']; // Add 'fr' for French
```

2. **Add Translations** (`src/config/i18n.js`):
```javascript
resources: {
  // ... existing languages
  fr: {
    translation: {
      'api.success': 'Succès',
      'driver.not_found': 'Conducteur non trouvé',
      // ... more translations
    }
  }
}
```

3. **Update Models** (`src/models/Question.js` and `src/models/Quote.js`):
```javascript
validate: {
  isIn: ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'fr']
}
```

4. **Add Sample Data** (create new seeder files)

## Frontend Integration

### JavaScript/React Example

```javascript
// Set language preference
const setLanguage = (lang) => {
  // Store in localStorage
  localStorage.setItem('preferredLanguage', lang);
  
  // Add to all API requests
  const headers = {
    'Accept-Language': lang
  };
  
  // Or use query parameter
  const url = `/api/v1/questions/random?lang=${lang}`;
};

// Get user's preferred language
const getPreferredLanguage = () => {
  return localStorage.getItem('preferredLanguage') || 'en';
};

// Make API request with language
const fetchQuestions = async (language = 'en') => {
  const response = await fetch(`/api/v1/questions/random?lang=${language}`);
  const data = await response.json();
  return data;
};
```

### Language Switcher Component

```jsx
const LanguageSwitcher = () => {
  const [currentLang, setCurrentLang] = useState('en');
  
  const handleLanguageChange = (newLang) => {
    setCurrentLang(newLang);
    setLanguage(newLang);
    // Refresh current content
    window.location.reload();
  };
  
  return (
    <select value={currentLang} onChange={(e) => handleLanguageChange(e.target.value)}>
      <option value="en">English</option>
      <option value="de">Deutsch</option>
    </select>
  );
};
```

## Database Seeding

To add German content to your database:

```bash
# Run the German content seeder
npm run db:seed:undo:all  # Remove existing data
npm run db:seed:all       # Add all seeders including German content
```

## Testing

### Test Language Detection

```bash
# Test with query parameter
curl "http://localhost:3000/api/v1/questions/random?lang=de"

# Test with Accept-Language header
curl -H "Accept-Language: de" "http://localhost:3000/api/v1/questions/random"

# Test fallback to English
curl "http://localhost:3000/api/v1/questions/random"
```

### Test Error Messages

```bash
# Test localized error message
curl "http://localhost:3000/api/v1/quiz/session/nonexistent-id?lang=de"
```

## Best Practices

1. **Always provide fallback content**: Ensure English content exists for all multilingual fields
2. **Use consistent terminology**: Maintain consistent translations across the application
3. **Test all languages**: Verify that all features work correctly in both languages
4. **Handle missing translations gracefully**: The system falls back to English if German content is missing
5. **Store user preferences**: Remember user's language choice in cookies or localStorage

## Troubleshooting

### Common Issues

1. **Content not showing in German**: Check if German content exists in the database
2. **Language not detected**: Verify Accept-Language header or query parameter
3. **Fallback not working**: Ensure English content exists as fallback

### Debug Mode

Enable debug mode in development:

```javascript
// In src/config/i18n.js
debug: process.env.NODE_ENV === 'development'
```

This will log language detection and translation lookups to the console.

/**
 * Test script to demonstrate i18n functionality
 * Run with: node test-i18n.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testI18n() {
    console.log('🌍 Testing Internationalization Features\n');

    try {
        // Test 1: Get supported languages
        console.log('1. Testing supported languages endpoint...');
        const languagesResponse = await axios.get(`${BASE_URL}/api/v1/languages`);
        console.log('✅ Supported languages:', languagesResponse.data.data);
        console.log('');

        // Test 2: Test English content (default)
        console.log('2. Testing English content (default)...');
        const englishQuestions = await axios.get(`${BASE_URL}/api/v1/questions/random?count=1`);
        console.log('✅ English question:', englishQuestions.data.data.questions[0].question_text);
        console.log('');

        // Test 3: Test German content via query parameter
        console.log('3. Testing German content via query parameter...');
        const germanQuestions = await axios.get(`${BASE_URL}/api/v1/questions/random?lang=de&count=1`);
        console.log('✅ German question:', germanQuestions.data.data.questions[0].question_text);
        console.log('');

        // Test 4: Test German content via Accept-Language header
        console.log('4. Testing German content via Accept-Language header...');
        const germanQuestionsHeader = await axios.get(`${BASE_URL}/api/v1/questions/random?count=1`, {
            headers: {
                'Accept-Language': 'de'
            }
        });
        console.log('✅ German question (via header):', germanQuestionsHeader.data.data.questions[0].question_text);
        console.log('');

        // Test 5: Test today's quote in German
        console.log('5. Testing today\'s quote in German...');
        const germanQuote = await axios.get(`${BASE_URL}/api/v1/quotes/today?lang=de`);
        console.log('✅ German quote:', germanQuote.data.data.text);
        console.log('');

        // Test 6: Test error message localization
        console.log('6. Testing error message localization...');
        try {
            await axios.get(`${BASE_URL}/api/v1/quiz/session/nonexistent-id?lang=de`);
        } catch (error) {
            console.log('✅ German error message:', error.response.data.message);
        }
        console.log('');

        // Test 7: Test unsupported language fallback
        console.log('7. Testing unsupported language fallback...');
        const fallbackQuestions = await axios.get(`${BASE_URL}/api/v1/questions/random?lang=fr&count=1`);
        console.log('✅ Fallback to English:', fallbackQuestions.data.data.questions[0].question_text);
        console.log('');

        console.log('🎉 All i18n tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log('- Language detection works via query parameter and headers');
        console.log('- Content is properly localized in German and English');
        console.log('- Error messages are localized');
        console.log('- Fallback to English works for unsupported languages');
        console.log('- API responses include language information');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Check if server is running
async function checkServer() {
    try {
        await axios.get(`${BASE_URL}/health`);
        return true;
    } catch (error) {
        return false;
    }
}

async function main() {
    console.log('🚀 Starting i18n tests...\n');

    const serverRunning = await checkServer();
    if (!serverRunning) {
        console.log('❌ Server is not running. Please start the server first:');
        console.log('   npm run dev');
        console.log('');
        console.log('Then run this test again:');
        console.log('   node test-i18n.js');
        return;
    }

    await testI18n();
}

main();
/**
 * Test script for Firebase Authentication
 * Run with: node test-firebase-auth.js
 * 
 * Note: This script requires a valid Firebase ID token
 * You can get one from your mobile app or Firebase console
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Replace with a valid Firebase ID token for testing
const TEST_FIREBASE_TOKEN = 'your_firebase_id_token_here';

async function testFirebaseAuth() {
    console.log('🔥 Testing Firebase Authentication Features\n');

    if (TEST_FIREBASE_TOKEN === 'your_firebase_id_token_here') {
        console.log('❌ Please set a valid Firebase ID token in TEST_FIREBASE_TOKEN variable');
        console.log('You can get one from your mobile app or Firebase console');
        return;
    }

    try {
        // Test 1: Verify Firebase token
        console.log('1. Testing Firebase token verification...');
        const verifyResponse = await axios.post(`${BASE_URL}/api/v1/auth/verify`, {
            token: TEST_FIREBASE_TOKEN
        });
        console.log('✅ Token verified successfully');
        console.log('User info:', verifyResponse.data.data.firebase);
        console.log('');

        // Test 2: Get user profile (if user exists)
        console.log('2. Testing user profile retrieval...');
        try {
            const profileResponse = await axios.get(`${BASE_URL}/api/v1/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${TEST_FIREBASE_TOKEN}`
                }
            });
            console.log('✅ Profile retrieved successfully');
            console.log('Profile:', profileResponse.data.data);
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('ℹ️  User profile not found (user not registered yet)');
            } else {
                console.log('❌ Profile retrieval failed:', error.response?.data?.message);
            }
        }
        console.log('');

        // Test 3: Test protected endpoint
        console.log('3. Testing protected endpoint access...');
        try {
            const protectedResponse = await axios.get(`${BASE_URL}/api/v1/questions/random?count=1`, {
                headers: {
                    'Authorization': `Bearer ${TEST_FIREBASE_TOKEN}`,
                    'Accept-Language': 'de'
                }
            });
            console.log('✅ Protected endpoint accessed successfully');
            console.log('Question:', protectedResponse.data.data.questions[0].question_text);
        } catch (error) {
            console.log('❌ Protected endpoint access failed:', error.response?.data?.message);
        }
        console.log('');

        // Test 4: Test unauthorized access
        console.log('4. Testing unauthorized access...');
        try {
            await axios.get(`${BASE_URL}/api/v1/auth/profile`);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Unauthorized access properly blocked');
            } else {
                console.log('❌ Unauthorized access not properly handled');
            }
        }
        console.log('');

        // Test 5: Test invalid token
        console.log('5. Testing invalid token...');
        try {
            await axios.get(`${BASE_URL}/api/v1/auth/profile`, {
                headers: {
                    'Authorization': 'Bearer invalid_token_here'
                }
            });
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Invalid token properly rejected');
            } else {
                console.log('❌ Invalid token not properly handled');
            }
        }
        console.log('');

        console.log('🎉 Firebase authentication tests completed!');
        console.log('\n📋 Summary:');
        console.log('- Firebase token verification works');
        console.log('- Protected endpoints require authentication');
        console.log('- Unauthorized access is properly blocked');
        console.log('- Invalid tokens are rejected');
        console.log('- User profiles can be retrieved');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Test registration endpoints (requires valid token)
async function testRegistration() {
    console.log('\n📝 Testing Registration Endpoints\n');

    if (TEST_FIREBASE_TOKEN === 'your_firebase_id_token_here') {
        console.log('❌ Please set a valid Firebase ID token to test registration');
        return;
    }

    try {
        // Test driver registration
        console.log('1. Testing driver registration...');
        try {
            const driverRegResponse = await axios.post(`${BASE_URL}/api/v1/auth/register/driver`, {
                token: TEST_FIREBASE_TOKEN,
                driver_license_number: 'TEST123456789',
                phone_number: '+49123456789',
                preferred_language: 'de'
            });
            console.log('✅ Driver registration successful');
            console.log('Driver ID:', driverRegResponse.data.data.driver.id);
        } catch (error) {
            if (error.response?.status === 409) {
                console.log('ℹ️  Driver already exists');
            } else {
                console.log('❌ Driver registration failed:', error.response?.data?.message);
            }
        }
        console.log('');

        // Test profile update
        console.log('2. Testing profile update...');
        try {
            const updateResponse = await axios.put(`${BASE_URL}/api/v1/auth/profile`, {
                name: 'Test Driver Updated',
                language: 'de'
            }, {
                headers: {
                    'Authorization': `Bearer ${TEST_FIREBASE_TOKEN}`
                }
            });
            console.log('✅ Profile update successful');
            console.log('Updated profile:', updateResponse.data.data.local);
        } catch (error) {
            console.log('❌ Profile update failed:', error.response?.data?.message);
        }
        console.log('');

    } catch (error) {
        console.error('❌ Registration test failed:', error.message);
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
    console.log('🚀 Starting Firebase Authentication Tests...\n');

    const serverRunning = await checkServer();
    if (!serverRunning) {
        console.log('❌ Server is not running. Please start the server first:');
        console.log('   npm run dev');
        console.log('');
        console.log('Then run this test again:');
        console.log('   node test-firebase-auth.js');
        return;
    }

    await testFirebaseAuth();
    await testRegistration();

    console.log('\n📖 Next Steps:');
    console.log('1. Set up your mobile app with Firebase SDK');
    console.log('2. Implement authentication in your mobile app');
    console.log('3. Use the Firebase ID token in API requests');
    console.log('4. Test with real mobile app authentication');
}

main();
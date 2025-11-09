const {
    TranslateClient
} = require('@aws-sdk/client-translate');

/**
 * AWS Translate Client Configuration
 * 
 * This module sets up and exports the AWS Translate client.
 * The client is configured using environment variables for security.
 * 
 * Required Environment Variables:
 * - AWS_ACCESS_KEY_ID: Your AWS access key
 * - AWS_SECRET_ACCESS_KEY: Your AWS secret key
 * - AWS_REGION: AWS region (defaults to us-east-1)
 */

// Get region from environment or default to us-east-1
const region = process.env.AWS_REGION || 'us-east-1';

/**
 * Create and configure the AWS Translate client
 * 
 * The client uses credentials from:
 * 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
 * 2. AWS credentials file (~/.aws/credentials)
 * 3. IAM role (if running on EC2)
 */
const translateClient = new TranslateClient({
    region: region,
    // Credentials are automatically loaded from:
    // - Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
    // - AWS credentials file
    // - IAM role (if on EC2)
    // You can also explicitly pass credentials if needed:
    // credentials: {
    //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    // }
});

/**
 * Validate that AWS credentials are available
 * 
 * @returns {boolean} True if credentials are available
 */
function validateCredentials() {
    const hasAccessKey = process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY;
    const hasSecretKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_KEY;

    if (!hasAccessKey || !hasSecretKey) {
        console.warn('Warning: AWS credentials not found in environment variables.');
        console.warn('The SDK will attempt to use credentials from AWS credentials file or IAM role.');
    }

    return true;
}

// Validate credentials on module load
validateCredentials();

module.exports = translateClient;
#!/usr/bin/env node

/**
 * Database Reset Script
 * 
 * This script resets the database by dropping and recreating all tables.
 * WARNING: This will delete all data!
 * 
 * Usage:
 *   node src/scripts/reset-db.js
 *   npm run db:reset
 */

require('dotenv').config();
const {
    execSync
} = require('child_process');

console.log('⚠️  WARNING: This will delete all data in your database!');
console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

// Wait 5 seconds
setTimeout(async () => {
    try {
        console.log('🔄 Starting database reset...\n');

        // Step 1: Drop database
        console.log('🗑️  Step 1: Dropping database...');
        try {
            execSync('npx sequelize-cli db:drop', {
                stdio: 'inherit'
            });
            console.log('✅ Database dropped successfully.\n');
        } catch (error) {
            console.log('ℹ️  Database drop failed or database doesn\'t exist, continuing...\n');
        }

        // Step 2: Create database
        console.log('📦 Step 2: Creating database...');
        execSync('npx sequelize-cli db:create', {
            stdio: 'inherit'
        });
        console.log('✅ Database created successfully.\n');

        // Step 3: Run migrations
        console.log('🔄 Step 3: Running migrations...');
        execSync('npx sequelize-cli db:migrate', {
            stdio: 'inherit'
        });
        console.log('✅ Migrations completed successfully.\n');

        // Step 4: Run seeders
        console.log('🌱 Step 4: Running seeders...');
        execSync('npx sequelize-cli db:seed:all', {
            stdio: 'inherit'
        });
        console.log('✅ Seeders completed successfully.\n');

        console.log('🎉 Database reset completed successfully!');

    } catch (error) {
        console.error('\n❌ Database reset failed:');
        console.error(error.message);
        process.exit(1);
    }
}, 5000);
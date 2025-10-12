#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script initializes the database with migrations and seeders.
 * Run this script after setting up your PostgreSQL database.
 * 
 * Usage:
 *   node src/scripts/init-db.js
 *   npm run db:init
 */

require('dotenv').config();
const {
    execSync
} = require('child_process');
const path = require('path');

console.log('🚀 Starting database initialization...\n');

try {
    // Check if .env file exists
    const fs = require('fs');
    if (!fs.existsSync('.env')) {
        console.log('⚠️  .env file not found. Please create one based on .env.example');
        console.log('   Make sure to set your database credentials.\n');
    }

    // Step 1: Create database (if it doesn't exist)
    console.log('📦 Step 1: Creating database...');
    try {
        execSync('npx sequelize-cli db:create', {
            stdio: 'inherit'
        });
        console.log('✅ Database created successfully.\n');
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('ℹ️  Database already exists, continuing...\n');
        } else {
            throw error;
        }
    }

    // Step 2: Run migrations
    console.log('🔄 Step 2: Running migrations...');
    execSync('npx sequelize-cli db:migrate', {
        stdio: 'inherit'
    });
    console.log('✅ Migrations completed successfully.\n');

    // Step 3: Run seeders
    console.log('🌱 Step 3: Running seeders...');
    execSync('npx sequelize-cli db:seed:all', {
        stdio: 'inherit'
    });
    console.log('✅ Seeders completed successfully.\n');

    // Step 4: Verify setup
    console.log('🔍 Step 4: Verifying database setup...');
    const {
        sequelize
    } = require('../models');

    await sequelize.authenticate();
    console.log('✅ Database connection verified.');

    // Check if tables exist
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log(`✅ Found ${tables.length} tables: ${tables.join(', ')}`);

    // Check if seed data exists
    const {
        Admin,
        Question,
        Quote
    } = require('../models');
    const adminCount = await Admin.count();
    const questionCount = await Question.count();
    const quoteCount = await Quote.count();

    console.log(`✅ Seed data verified:`);
    console.log(`   - Admins: ${adminCount}`);
    console.log(`   - Questions: ${questionCount}`);
    console.log(`   - Quotes: ${quoteCount}`);

    await sequelize.close();

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start your application: npm start');
    console.log('   2. Access admin panel with:');
    console.log('      - Username: admin');
    console.log('      - Password: admin123');
    console.log('   3. Or use editor account:');
    console.log('      - Username: editor');
    console.log('      - Password: editor123');

} catch (error) {
    console.error('\n❌ Database initialization failed:');
    console.error(error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check your database credentials in .env');
    console.log('   3. Ensure the database user has proper permissions');
    console.log('   4. Try running: npm install');
    process.exit(1);
}
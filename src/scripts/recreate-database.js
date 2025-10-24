const sequelize = require('../config/database');
const {
    Admin,
    Driver,
    Question,
    QuizSession,
    QuizResponse,
    Quote
} = require('../models');

/**
 * Script to drop and recreate the entire database with new integer ID structure
 * This script will:
 * 1. Drop all tables
 * 2. Recreate tables with integer IDs
 * 3. Run all migrations
 * 4. Seed initial data
 */

async function recreateDatabase() {
    try {
        console.log('🔄 Starting database recreation...');
        console.log('⚠️  This will DROP ALL DATA and recreate the database!');

        // Step 1: Drop all tables
        console.log('\n🗑️  Step 1: Dropping all tables...');

        await sequelize.query(`
            DROP TABLE IF EXISTS quiz_responses CASCADE;
        `);

        await sequelize.query(`
            DROP TABLE IF EXISTS quiz_sessions CASCADE;
        `);

        await sequelize.query(`
            DROP TABLE IF EXISTS questions CASCADE;
        `);

        await sequelize.query(`
            DROP TABLE IF EXISTS quotes CASCADE;
        `);

        await sequelize.query(`
            DROP TABLE IF EXISTS drivers CASCADE;
        `);

        await sequelize.query(`
            DROP TABLE IF EXISTS admins CASCADE;
        `);

        await sequelize.query(`
            DROP TABLE IF EXISTS audit_logs CASCADE;
        `);

        console.log('✅ All tables dropped successfully');

        // Step 2: Create tables with new structure
        console.log('\n📦 Step 2: Creating tables with integer IDs...');

        // Create admins table
        await sequelize.query(`
            CREATE TABLE admins (
                id BIGSERIAL PRIMARY KEY,
                username VARCHAR(100) NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role VARCHAR(50) DEFAULT 'editor',
                is_active BOOLEAN DEFAULT true,
                last_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create drivers table
        await sequelize.query(`
            CREATE TABLE drivers (
                id BIGSERIAL PRIMARY KEY,
                firebase_uid VARCHAR(128) NOT NULL UNIQUE,
                phone_number VARCHAR(20),
                fcm_token TEXT,
                device_token TEXT,
                language VARCHAR(10) DEFAULT 'en',
                name VARCHAR(255),
                email VARCHAR(255),
                date_of_birth DATE,
                gender VARCHAR(10),
                address_line1 VARCHAR(255),
                address_line2 VARCHAR(255),
                city VARCHAR(100),
                state_province VARCHAR(100),
                postal_code VARCHAR(20),
                country VARCHAR(100) DEFAULT 'Germany',
                driver_license_number VARCHAR(100),
                license_issue_date DATE,
                license_expiry_date DATE,
                emergency_contact_name VARCHAR(255),
                emergency_contact_phone VARCHAR(20),
                emergency_contact_relationship VARCHAR(100),
                profile_completed BOOLEAN DEFAULT false,
                profile_completion_percentage INTEGER DEFAULT 0,
                total_quizzes BIGINT DEFAULT 0,
                total_correct BIGINT DEFAULT 0,
                streak INTEGER DEFAULT 0,
                last_quiz_date DATE,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create questions table
        await sequelize.query(`
            CREATE TABLE questions (
                id BIGSERIAL PRIMARY KEY,
                question_text TEXT NOT NULL,
                options JSON NOT NULL,
                correct_option INTEGER NOT NULL,
                explanation TEXT,
                topic VARCHAR(100),
                language VARCHAR(10) DEFAULT 'en',
                created_by BIGINT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES admins(id)
            );
        `);

        // Create quiz_sessions table
        await sequelize.query(`
            CREATE TABLE quiz_sessions (
                id BIGSERIAL PRIMARY KEY,
                driver_id BIGINT NOT NULL,
                quiz_date DATE NOT NULL,
                completed BOOLEAN DEFAULT false,
                score INTEGER DEFAULT 0,
                total_questions INTEGER DEFAULT 0,
                correct_answers INTEGER DEFAULT 0,
                time_taken INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (driver_id) REFERENCES drivers(id)
            );
        `);

        // Create quiz_responses table
        await sequelize.query(`
            CREATE TABLE quiz_responses (
                id BIGSERIAL PRIMARY KEY,
                quiz_session_id BIGINT NOT NULL,
                question_id BIGINT NOT NULL,
                selected_option INTEGER NOT NULL,
                correct BOOLEAN NOT NULL,
                answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (quiz_session_id) REFERENCES quiz_sessions(id),
                FOREIGN KEY (question_id) REFERENCES questions(id)
            );
        `);

        // Create quotes table
        await sequelize.query(`
            CREATE TABLE quotes (
                id BIGSERIAL PRIMARY KEY,
                text TEXT NOT NULL,
                language VARCHAR(10) DEFAULT 'en',
                scheduled_date DATE,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create audit_logs table
        await sequelize.query(`
            CREATE TABLE audit_logs (
                id BIGSERIAL PRIMARY KEY,
                admin_id BIGINT,
                actor VARCHAR(100),
                action VARCHAR(100) NOT NULL,
                meta JSONB,
                details TEXT,
                ip_address INET,
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES admins(id)
            );
        `);

        console.log('✅ All tables created successfully');

        // Step 3: Create indexes
        console.log('\n📊 Step 3: Creating indexes...');

        await sequelize.query(`
            CREATE INDEX idx_questions_topic ON questions(topic);
        `);

        await sequelize.query(`
            CREATE INDEX idx_questions_language ON questions(language);
        `);

        await sequelize.query(`
            CREATE INDEX idx_questions_is_active ON questions(is_active);
        `);

        await sequelize.query(`
            CREATE INDEX idx_questions_created_by ON questions(created_by);
        `);

        await sequelize.query(`
            CREATE INDEX idx_quiz_sessions_driver_id ON quiz_sessions(driver_id);
        `);

        await sequelize.query(`
            CREATE INDEX idx_quiz_sessions_quiz_date ON quiz_sessions(quiz_date);
        `);

        await sequelize.query(`
            CREATE INDEX idx_quiz_responses_quiz_session_id ON quiz_responses(quiz_session_id);
        `);

        await sequelize.query(`
            CREATE INDEX idx_quotes_language ON quotes(language);
        `);

        await sequelize.query(`
            CREATE INDEX idx_quotes_scheduled_date ON quotes(scheduled_date);
        `);

        await sequelize.query(`
            CREATE INDEX idx_quotes_is_active ON quotes(is_active);
        `);

        console.log('✅ All indexes created successfully');

        // Step 4: Seed initial data
        console.log('\n🌱 Step 4: Seeding initial data...');

        // Create default admin
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await sequelize.query(`
            INSERT INTO admins (username, password_hash, role, is_active)
            VALUES ('admin', $1, 'admin', true)
        `, {
            bind: [hashedPassword]
        });

        // Create sample question
        await sequelize.query(`
            INSERT INTO questions (question_text, options, correct_option, explanation, topic, language, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, true)
        `, {
            bind: [
                'What is the speed limit in residential areas?',
                JSON.stringify(['30 km/h', '50 km/h', '60 km/h', '70 km/h']),
                0,
                'The speed limit is 30 km/h in residential areas.',
                'Traffic Rules',
                'en'
            ]
        });

        // Create sample quote
        await sequelize.query(`
            INSERT INTO quotes (text, language, is_active)
            VALUES ($1, $2, true)
        `, {
            bind: [
                'Drive safely today and every day.',
                'en'
            ]
        });

        console.log('✅ Initial data seeded successfully');

        // Step 5: Verify the database
        console.log('\n✅ Step 5: Verifying database...');

        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection verified');

        // Check table structures
        const tables = ['admins', 'drivers', 'questions', 'quiz_sessions', 'quiz_responses', 'quotes', 'audit_logs'];

        for (const table of tables) {
            const result = await sequelize.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = $1 AND column_name = 'id'
            `, {
                bind: [table],
                type: sequelize.QueryTypes.SELECT
            });

            if (result[0]) {
                console.log(`✅ Table ${table}: ID column is ${result[0].data_type}`);
            } else {
                console.log(`⚠️  Table ${table}: ID column not found`);
            }
        }

        // Check data
        const adminCount = await sequelize.query(`
            SELECT COUNT(*) as count FROM admins
        `, {
            type: sequelize.QueryTypes.SELECT
        });

        const questionCount = await sequelize.query(`
            SELECT COUNT(*) as count FROM questions
        `, {
            type: sequelize.QueryTypes.SELECT
        });

        const quoteCount = await sequelize.query(`
            SELECT COUNT(*) as count FROM quotes
        `, {
            type: sequelize.QueryTypes.SELECT
        });

        console.log('\n📊 Database verification:');
        console.log(`   - Admins: ${adminCount[0].count}`);
        console.log(`   - Questions: ${questionCount[0].count}`);
        console.log(`   - Quotes: ${quoteCount[0].count}`);

        console.log('\n🎉 Database recreation completed successfully!');
        console.log('📋 Summary:');
        console.log('   ✅ All tables dropped and recreated');
        console.log('   ✅ Integer IDs implemented');
        console.log('   ✅ Foreign key relationships established');
        console.log('   ✅ Indexes created');
        console.log('   ✅ Initial data seeded');
        console.log('   ✅ Database verified');
        console.log('\n🚀 Your database is ready with integer IDs!');

    } catch (error) {
        console.error('❌ Database recreation failed:', error);
        throw error;
    }
}

// Run the recreation if this script is executed directly
if (require.main === module) {
    recreateDatabase()
        .then(() => {
            console.log('✅ Database recreation completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Database recreation failed:', error);
            process.exit(1);
        });
}

module.exports = recreateDatabase;
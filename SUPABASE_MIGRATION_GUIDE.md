# 🚀 Supabase Migration Guide

## 📋 Migration Checklist

### ✅ 1. Database Configuration Updated
- Updated `src/config/database.js` to use Supabase connection string
- Configured SSL settings for secure connection
- Disabled logging for production

### 🔧 2. Environment Variables Setup

Create a `.env` file in the project root with the following content:

```env
# Supabase Database Configuration
DATABASE_URL=postgresql://postgres.ucayfgqfhvugdfbfvkcy:YOUR_PASSWORD@aws-1-eu-north-1.pooler.supabase.com:5432/postgres

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Server Configuration
PORT=3000
NODE_ENV=production

# Legacy Database Variables (for compatibility)
DB_USER=postgres.ucayfgqfhvugdfbfvkcy
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=postgres
DB_HOST=aws-1-eu-north-1.pooler.supabase.com
DB_PORT=5432
```

**⚠️ Important:** Replace `YOUR_PASSWORD` with your actual Supabase database password.

### 🔥 3. Firebase Service Account Setup

You'll need to recreate the Firebase service account file. Create `firebase-service-account.json` in the project root with your Firebase service account credentials.

### 📊 4. Database Migration Steps

1. **Test Connection:**
   ```bash
   npm run db:test
   ```

2. **Run Migrations:**
   ```bash
   npm run db:migrate
   ```

3. **Seed Database:**
   ```bash
   npm run db:seed
   ```

### 🚀 5. Render Deployment Preparation

#### 5.1 Update package.json Scripts
Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "db:test": "node -e \"require('./src/config/database').authenticate().then(() => console.log('✅ Database connected')).catch(err => console.error('❌ Database error:', err))\"",
    "db:migrate": "npx sequelize-cli db:migrate",
    "db:seed": "npx sequelize-cli db:seed:all",
    "db:reset": "npx sequelize-cli db:migrate:undo:all && npm run db:migrate && npm run db:seed"
  }
}
```

#### 5.2 Create render.yaml
Create `render.yaml` in the project root:

```yaml
services:
  - type: web
    name: german-quiz-api
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: FIREBASE_SERVICE_ACCOUNT_PATH
        value: ./firebase-service-account.json
      - key: PORT
        value: 3000
      - key: NODE_ENV
        value: production
```

#### 5.3 Environment Variables for Render
In your Render dashboard, add these environment variables:

- `DATABASE_URL`: Your Supabase connection string
- `FIREBASE_SERVICE_ACCOUNT_PATH`: `./firebase-service-account.json`
- `PORT`: `3000`
- `NODE_ENV`: `production`

### 🔧 6. Required File Recreations

Since some files were deleted, you'll need to recreate:

1. **Firebase Configuration** (`src/config/firebase.js`)
2. **Firebase Auth Middleware** (`src/middlewares/firebaseAuth.js`)
3. **Auth Routes** (`src/routes/auth.js`)
4. **Auth Controller** (`src/controllers/AuthController.js`)
5. **Notification Service** (`src/services/NotificationService.js`)
6. **Cron Jobs** (`src/cron/sendDailyQuotes.js`)
7. **Database Migrations** (Firebase fields, profile fields, quote tracking)
8. **Models** (QuoteTracking model)

### 📱 7. Testing Steps

1. **Database Connection Test:**
   ```bash
   node -e "require('./src/config/database').authenticate().then(() => console.log('✅ Supabase connected')).catch(err => console.error('❌ Connection failed:', err))"
   ```

2. **Start Server:**
   ```bash
   npm start
   ```

3. **Test API Endpoints:**
   - Health check: `GET http://localhost:3000/health`
   - API docs: `GET http://localhost:3000/api-docs`

### 🚨 8. Common Issues & Solutions

#### Issue: SSL Connection Error
**Solution:** Ensure `rejectUnauthorized: false` in dialectOptions

#### Issue: Migration Errors
**Solution:** Check if tables already exist in Supabase, may need to drop and recreate

#### Issue: Firebase Auth Not Working
**Solution:** Verify service account file path and permissions

#### Issue: Render Deployment Fails
**Solution:** Check environment variables and build logs

### 📋 9. Next Steps

1. ✅ Update database configuration
2. 🔄 Create .env file with Supabase credentials
3. 🔄 Recreate Firebase service account file
4. 🔄 Test database connection
5. 🔄 Run migrations on Supabase
6. 🔄 Recreate deleted files
7. 🔄 Test Firebase authentication
8. 🔄 Deploy to Render

### 🎯 10. Deployment Checklist

- [ ] .env file created with correct credentials
- [ ] Firebase service account file in place
- [ ] Database connection tested
- [ ] Migrations run successfully
- [ ] All required files recreated
- [ ] Firebase authentication working
- [ ] API endpoints responding
- [ ] Render environment variables set
- [ ] Deployment successful

---

**Ready to proceed with the migration! 🚀**

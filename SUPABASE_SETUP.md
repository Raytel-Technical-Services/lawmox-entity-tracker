# Supabase Setup Guide

## 🚀 Quick Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub/Google
4. Click "New Project"
5. Enter project details:
   - **Name**: `lawmox-entity-tracker`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
6. Click "Create new project"

### 2. Get Your Credentials
1. Wait for project to be ready (1-2 minutes)
2. Go to **Settings → API** (left sidebar)
3. Copy these credentials:
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon public**: API key
   - **service_role**: API key (secret!)

### 3. Set Up Database
1. Go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the entire content of `database_schema.sql`
4. Paste and click "Run"

### 4. Update .env File
Open your `.env` file and replace the placeholders:

```env
# Replace these with your actual credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_KEY=your_actual_service_role_key_here

# This is already set for you
ENCRYPTION_KEY=uaa_EVZYxTn6sR902AN0E04HWWT1z6k_8qgKbMKFNvA=
```

### 5. Test Your Setup
Run the test script to verify everything works:

```bash
source venv/bin/activate
python test_supabase.py
```

You should see:
```
🎉 All environment variables are properly set!
✅ Successfully connected to Supabase!
✅ Entities table is accessible!
```

### 6. Start the Backend
If the test passes, start your backend:

```bash
cd backend
python app.py
```

The API will be available at `http://localhost:8000`

## 🔧 Troubleshooting

### "NOT SET or using placeholder" Error
- Make sure you replaced the placeholder values in `.env`
- Don't include "https://" twice in the URL
- Check for extra spaces or quotes

### "Error accessing entities table" Error
- Make sure you ran the `database_schema.sql` in Supabase SQL Editor
- Check that the script completed successfully
- Try running it again

### Connection Timeout Error
- Check your internet connection
- Verify the Supabase URL is correct
- Make sure your Supabase project is active

## 📋 What Gets Created

The database schema creates:
- **entities table**: Business entity information
- **accounts table**: Account credentials and URLs
- **tasks table**: Tasks with deadlines and steps
- **task_steps table**: Individual task steps
- **Row Level Security**: Protects your data
- **Indexes**: Optimizes performance

## 🎯 Next Steps

1. ✅ Supabase project created
2. ✅ Database schema installed
3. ✅ Environment variables configured
4. ✅ Connection tested
5. 🔄 Start backend server
6. 🔄 Deploy to production

## 🚨 Security Notes

- **Never commit** `.env` files to Git
- **Keep service role key secret** - it has admin access
- **Use Row Level Security** in production (already configured)
- **Rotate keys periodically** for security

## 📞 Need Help?

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the main [README.md](./README.md)
- Run `python test_supabase.py` for diagnostics

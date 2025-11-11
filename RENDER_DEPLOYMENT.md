# 🚀 Lawmox Entity Tracker - Render All-in-One Deployment

## 📋 Overview
Deploy your entire Lawmox Entity Tracker (Frontend + Backend + Database) on Render.com - all in one platform!

## 🎯 What You'll Get
- ✅ **Frontend**: Static site hosting
- ✅ **Backend**: Python FastAPI API
- ✅ **Database**: PostgreSQL database
- ✅ **Single Dashboard**: Manage everything in one place
- ✅ **Free Tier**: All services on Render's free plan

## 📁 Files for Render Deployment
```
├── render.yaml              # Render configuration
├── backend-render/
│   └── app.py              # FastAPI backend for Render
├── frontend-render/
│   ├── index.html          # Frontend HTML
│   ├── styles.css          # Frontend styles
│   └── app.js              # Frontend JavaScript
└── requirements-render.txt # Python dependencies
```

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Add Render all-in-one deployment"
git push origin main
```

### 2. Connect to Render
1. Go to [https://render.com](https://render.com)
2. Sign up/login with GitHub
3. Click **"New +"** → **"Web Service"**
4. Select your `lawmox-entity-tracker` repository
5. **Important**: Select **"Existing Dockerfile"** and change to **"Python"**
6. **Runtime**: Python 3
7. **Build Command**: `pip install -r requirements-render.txt`
8. **Start Command**: `python backend-render/app.py`

### 3. Add Database
1. In your Render dashboard, click **"New +"** → **"PostgreSQL"**
2. **Name**: `lawmox-db`
3. **Database Name**: `lawmox_entity_tracker`
4. **User**: `lawmox_user`
5. **Plan**: Free
6. Click **"Create Database"**

### 4. Configure Environment Variables
In your backend service settings, add these environment variables:

```bash
DATABASE_URL=your_render_database_url
ENCRYPTION_KEY=your_encryption_key_here
```

**Get DATABASE_URL from your PostgreSQL database dashboard**

**Generate ENCRYPTION_KEY**:
```python
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### 5. Deploy Frontend
1. Click **"New +"** → **"Static Site"**
2. Select the same repository
3. **Build Command**: `echo "No build needed"`
4. **Publish Directory**: `frontend-render`
5. **Add Custom Domain** (optional)

### 6. Update Frontend API URL
After your backend is deployed, update `frontend-render/app.js` line 6:
```javascript
this.apiBaseUrl = 'https://your-backend-name.onrender.com';
```

## 🌐 Your URLs
After deployment, you'll have:
- **Backend**: `https://your-backend-name.onrender.com`
- **Frontend**: `https://your-frontend-name.onrender.com`
- **Database**: Managed by Render (internal)

## 🧪 Testing
1. **Backend Health**: `https://your-backend.onrender.com/health`
2. **Frontend**: Visit your frontend URL
3. **API Test**: Try creating an entity

## 📊 Database Schema
The database will be automatically created with these tables:
- `entities` - Business entities
- `accounts` - User accounts (encrypted passwords)
- `tasks` - Task management
- `task_steps` - Detailed task steps

## 🔧 Management
All services are managed in your Render dashboard:
- **View Logs**: Monitor your backend
- **Database Access**: View connection details
- **Environment Variables**: Update configuration
- **Deployments**: Automatic on git push

## 🔄 Updates
Push to GitHub to automatically update:
- Backend: Code changes trigger redeploy
- Frontend: Code changes trigger redeploy
- Database: Schema updates require manual SQL

## 🎉 Success!
Your Lawmox Entity Tracker is now running entirely on Render:
- Single platform for everything
- Free tier hosting
- Automatic SSL certificates
- Built-in monitoring
- Easy scaling

**All your entities, accounts, and tasks in one place!** 🎯

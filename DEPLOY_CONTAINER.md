# 🐳 Docker Container Deployment Guide

## 🚀 Quick Deploy - 3 Commands

### **Prerequisites**
Install Docker Desktop for Mac: https://www.docker.com/products/docker-desktop/

### **Option 1: Docker Compose (Recommended)**
```bash
# Clone and navigate to project
git clone https://github.com/Raytel-Technical-Services/lawmox-entity-tracker.git
cd lawmox-entity-tracker

# Deploy container
docker-compose up -d

# Access your app
open http://localhost:8000
```

### **Option 2: Docker Build**
```bash
# Clone and navigate to project
git clone https://github.com/Raytel-Technical-Services/lawmox-entity-tracker.git
cd lawmox-entity-tracker

# Build and run container
docker build -t lawmox-entity-tracker .
docker run -p 8000:8000 lawmox-entity-tracker

# Access your app
open http://localhost:8000
```

## 🌐 Cloud Deployment Options

### **1. Render.com (Easiest)**
1. Go to https://render.com
2. Connect GitHub account
3. Click "New +" → "Web Service"
4. Select your repository
5. Runtime: Docker
6. Plan: Free
7. Deploy!

### **2. Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway new
railway up
```

### **3. Google Cloud Run**
```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/your-project/lawmox-entity-tracker

# Deploy to Cloud Run
gcloud run deploy --image gcr.io/your-project/lawmox-entity-tracker --platform managed
```

### **4. AWS ECS/Fargate**
```bash
# Build and push to ECR
aws ecr create-repository --repository-name lawmox-entity-tracker
docker build -t lawmox-entity-tracker .
docker tag lawmox-entity-tracker:latest your-account.dkr.ecr.region.amazonaws.com/lawmox-entity-tracker:latest
docker push your-account.dkr.ecr.region.amazonaws.com/lawmox-entity-tracker:latest
```

## 📱 What You Get

### **Single Container Includes:**
- ✅ **PostgreSQL Database** (internal)
- ✅ **FastAPI Backend** (port 8000)
- ✅ **Frontend Interface** (served by FastAPI)
- ✅ **Auto-initialization** (database setup)
- ✅ **Health Monitoring** (/health endpoint)

### **Access Points:**
- **Main App**: `http://localhost:8000`
- **API**: `http://localhost:8000/entities`
- **Health**: `http://localhost:8000/health`

## 🔧 Monitoring

### **View Logs**
```bash
# Docker Compose logs
docker-compose logs -f

# Docker logs
docker logs -f lawmox-entity-tracker
```

### **Check Status**
```bash
# Check container status
docker ps

# Check health
curl http://localhost:8000/health
```

## 🗃️ Data Persistence

### **Database Backups**
```bash
# Backup database
docker exec lawmox-app pg_dump -U lawmox_user lawmox_entity_tracker > backup.sql

# Restore database
docker exec -i lawmox-app psql -U lawmox_user lawmox_entity_tracker < backup.sql
```

## 🆘 Troubleshooting

### **Container Won't Start**
```bash
# Check logs
docker-compose logs

# Rebuild container
docker-compose down
docker-compose up --build
```

### **Port Already in Use**
```bash
# Change port in docker-compose.yml
ports:
  - "8080:8000"  # Use port 8080 instead
```

### **Database Issues**
```bash
# Check PostgreSQL status
docker-compose exec lawmox-app service postgresql status

# Restart container
docker-compose restart
```

## 🎯 Success!

Once deployed, your Lawmox Entity Tracker will be fully functional:
- **Entity Management**: Create, edit, delete entities
- **Account Tracking**: Store encrypted credentials
- **Task Management**: Create tasks and steps
- **Real-time Updates**: Live data synchronization
- **Secure Storage**: Password encryption
- **Single Container**: Everything in one!

**Ready to deploy! Choose your platform above.** 🚀

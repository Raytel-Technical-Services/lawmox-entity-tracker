# 🐳 Lawmox Entity Tracker - Single Container Deployment

## 🎯 The Ultimate All-in-One Solution

**Everything runs in ONE container:**
- ✅ **PostgreSQL Database**
- ✅ **FastAPI Backend** 
- ✅ **Frontend Web Interface**
- ✅ **No external services needed**

## 📁 Container Architecture
```
Docker Container
├── PostgreSQL (localhost:5432)
├── FastAPI Backend (port 8000)
├── Frontend (served by FastAPI)
└── Supervisor (manages all services)
```

## 🚀 Quick Start - 3 Commands

### Option 1: Docker Compose (Recommended)
```bash
# Clone and navigate to project
git clone https://github.com/Raytel-Technical-Services/lawmox-entity-tracker.git
cd lawmox-entity-tracker

# Run the container
docker-compose up -d

# Access your app
open http://localhost:8000
```

### Option 2: Docker Build
```bash
# Build the image
docker build -t lawmox-entity-tracker .

# Run the container
docker run -p 8000:8000 lawmox-entity-tracker

# Access your app
open http://localhost:8000
```

## 🌐 What You Get

### **Single URL Access**
- **Frontend**: `http://localhost:8000`
- **API**: `http://localhost:8000/entities`
- **Health Check**: `http://localhost:8000/health`

### **Built-in Database**
- **PostgreSQL**: Runs inside container
- **Auto-initialized**: Tables created on startup
- **Persistent Data**: Stored in Docker volume
- **Encrypted Passwords**: Security built-in

### **Full Functionality**
- ✅ Entity Management
- ✅ Account Tracking
- ✅ Task Management
- ✅ Task Steps
- ✅ Real-time Updates
- ✅ Data Persistence

## 🔧 Configuration

### **Environment Variables**
```bash
ENCRYPTION_KEY=your_encryption_key_here
```

### **Generate Encryption Key**
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

## 📊 Container Features

### **Service Management**
- **Supervisor**: Manages all processes
- **Auto-restart**: Services restart if they fail
- **Health Checks**: Container monitors service health
- **Logging**: All logs in `/app/logs/`

### **Database Setup**
- **Auto-created**: Database and user created on startup
- **Schema**: Tables initialized automatically
- **Ready to use**: No manual setup required

### **Production Ready**
- **Optimized**: Based on Python 3.11 slim image
- **Secure**: Passwords encrypted, minimal attack surface
- **Scalable**: Easy to scale with Docker Swarm/Kubernetes
- **Portable**: Runs anywhere Docker runs

## 🚀 Deployment Options

### **Local Development**
```bash
docker-compose up -d
```

### **Cloud Deployment**

#### **Docker Hub**
```bash
# Push to Docker Hub
docker build -t yourusername/lawmox-entity-tracker .
docker push yourusername/lawmox-entity-tracker

# Pull and run anywhere
docker run -p 8000:8000 yourusername/lawmox-entity-tracker
```

#### **AWS ECS**
```bash
# Push to ECR
aws ecr create-repository --repository-name lawmox-entity-tracker
docker build -t your-registry-uri/lawmox-entity-tracker .
docker push your-registry-uri/lawmox-entity-tracker
```

#### **Google Cloud Run**
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/your-project/lawmox-entity-tracker
gcloud run deploy --image gcr.io/your-project/lawmox-entity-tracker --platform managed
```

#### **Azure Container Instances**
```bash
# Deploy to Azure
az container create \
  --resource-group myResourceGroup \
  --name lawmox-entity-tracker \
  --image yourregistry/lawmox-entity-tracker \
  --ports 8000
```

## 🔍 Monitoring & Logs

### **View Logs**
```bash
# Docker Compose logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f fastapi
docker-compose logs -f postgresql
```

### **Health Check**
```bash
curl http://localhost:8000/health
```

### **Database Access**
```bash
# Connect to PostgreSQL in container
docker exec -it $(docker-compose ps -q lawmox-app) psql -U lawmox_user -d lawmox_entity_tracker
```

## 📝 Data Persistence

### **Docker Volumes**
- **Database**: Stored in `postgres_data` volume
- **Logs**: Stored in container `/app/logs/`
- **Backups**: Easy to backup volumes

### **Backup Data**
```bash
# Backup database
docker exec lawmox-entity-tracker_pg_1 pg_dump -U lawmox_user lawmox_entity_tracker > backup.sql

# Restore database
docker exec -i lawmox-entity-tracker_pg_1 psql -U lawmox_user lawmox_entity_tracker < backup.sql
```

## 🎉 Success!

**Your Lawmox Entity Tracker is now running entirely in one container:**

- ✅ **Zero external dependencies**
- ✅ **Single command deployment**
- ✅ **Production ready**
- ✅ **Fully self-contained**
- ✅ **Easy to scale and deploy**

**Access your app at http://localhost:8000** 🎯

## 🆘 Troubleshooting

### **Container Won't Start**
```bash
# Check logs
docker-compose logs

# Rebuild container
docker-compose down
docker-compose up --build
```

### **Database Connection Issues**
```bash
# Check PostgreSQL status
docker-compose exec lawmox-app service postgresql status

# Restart database
docker-compose restart lawmox-app
```

### **Port Already in Use**
```bash
# Change port in docker-compose.yml
ports:
  - "8080:8000"  # Use port 8080 instead
```

**The simplest, most reliable deployment - everything in one container!** 🐳✨

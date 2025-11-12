# 🏢 Lawmox Entity Tracker

A comprehensive business entity tracking application built for simplicity and reliability.

## 🎯 What It Does

Track and manage business entities, their associated accounts, tasks, and task steps - all in one unified platform.

### **Core Features**
- ✅ **Entity Management**: Track business entities, EINs, formation dates, addresses
- ✅ **Account Management**: Store encrypted credentials for entity accounts
- ✅ **Task Management**: Create and track tasks for each entity
- ✅ **Task Steps**: Break down tasks into detailed steps
- ✅ **Real-time Updates**: Live data synchronization
- ✅ **Secure Storage**: Encrypted password protection

## 🐳 Single Container Deployment

**Everything runs in ONE Docker container - no external services needed!**

### **Quick Start - 3 Commands**

```bash
# Clone the repository
git clone https://github.com/Raytel-Technical-Services/lawmox-entity-tracker.git
cd lawmox-entity-tracker

# Run the container
docker-compose up -d

# Access your application
open http://localhost:8000
```

### **What's Inside the Container**
- 🗄️ **PostgreSQL Database** (internal, auto-initialized)
- 🚀 **FastAPI Backend** (REST API + serves frontend)
- 🎨 **Frontend Interface** (Bootstrap-based responsive UI)
- 🔧 **Supervisor** (manages all services)
  ## 📋 Architecture

```
Docker Container (port 8000)
├── PostgreSQL Database
│   ├── entities table
│   ├── accounts table (encrypted passwords)
│   ├── tasks table
│   └── task_steps table
├── FastAPI Backend
│   ├── REST API endpoints
│   ├── Database operations
│   └── Frontend serving
└── Frontend Interface
    ├── Entity management
    ├── Account tracking
    ├── Task management
    └── Real-time updates
```

## 🚀 Deployment Options

### **Option 1: Docker Compose (Recommended)**
```bash
docker-compose up -d
```

### **Option 2: Docker Build**
```bash
docker build -t lawmox-entity-tracker .
docker run -p 8000:8000 lawmox-entity-tracker
```

### **Option 3: Cloud Deployment**
The container can be deployed anywhere Docker runs:
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**

## 🌐 Access Points

Once running, access your application at:

- **Main Application**: `http://localhost:8000`
- **API Endpoints**: `http://localhost:8000/entities`
- **Health Check**: `http://localhost:8000/health`

## 📊 Database Schema

### **Entities Table**
- `id` (UUID, Primary Key)
- `entity_name` (VARCHAR)
- `ein` (VARCHAR, Unique)
- `date_of_formation` (DATE)
- `registered_address` (TEXT)
- `state_of_formation` (VARCHAR)
- `entity_type` (VARCHAR)
- `status` (VARCHAR, default: 'active')

### **Accounts Table**
- `id` (UUID, Primary Key)
- `account_name` (VARCHAR)
- `username` (VARCHAR, Unique)
- `encrypted_password` (TEXT) - Encrypted for security
- `entity_id` (UUID, Foreign Key)

### **Tasks Table**
- `id` (UUID, Primary Key)
- `task_name` (VARCHAR)
- `description` (TEXT)
- `status` (VARCHAR, default: 'pending')
- `entity_id` (UUID, Foreign Key)

### **Task Steps Table**
- `id` (UUID, Primary Key)
- `step_name` (VARCHAR)
- `description` (TEXT)
- `status` (VARCHAR, default: 'pending')
- `task_id` (UUID, Foreign Key)

## 🔧 Configuration

### **Environment Variables**
```bash
ENCRYPTION_KEY=your_encryption_key_here
```

### **Generate Encryption Key**
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

## 📱 Features in Detail

### **Entity Management**
- Create, read, update, delete business entities
- Track EIN numbers, formation dates, addresses
- Filter by entity type and status
- Link accounts and tasks to entities

### **Account Management**
- Store account credentials securely
- Password encryption using Fernet symmetric encryption
- Link accounts to specific entities
- Standalone or entity-linked accounts

### **Task Management**
- Create and manage tasks for entities
- Track task status (pending, in_progress, completed)
- Detailed task descriptions
- Entity-linked or standalone tasks

### **Task Steps**
- Break down tasks into detailed steps
- Track individual step completion
- Hierarchical task organization
- Progress monitoring

## 🔒 Security Features

- **Password Encryption**: All passwords encrypted using Fernet symmetric encryption
- **Secure Database**: PostgreSQL with proper access controls
- **Container Isolation**: Docker container provides process isolation
- **No External Dependencies**: Reduces attack surface

## 📈 Monitoring & Logs

### **View Application Logs**
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f fastapi
docker-compose logs -f postgresql
```

### **Health Monitoring**
```bash
# Check application health
curl http://localhost:8000/health

# Check container status
docker-compose ps
```

## 🗃️ Data Persistence

### **Database Backups**
```bash
# Backup database
docker exec lawmox-app pg_dump -U lawmox_user lawmox_entity_tracker > backup.sql

# Restore database
docker exec -i lawmox-app psql -U lawmox_user lawmox_entity_tracker < backup.sql
```

## 📚 API Documentation

### **Entity Endpoints**
- `GET /entities` - List all entities
- `POST /entities` - Create new entity
- `GET /entities/{id}` - Get specific entity
- `PUT /entities/{id}` - Update entity
- `DELETE /entities/{id}` - Delete entity

### **Account Endpoints**
- `GET /accounts` - List all accounts
- `POST /accounts` - Create new account
- `GET /accounts/{id}` - Get specific account
- `PUT /accounts/{id}` - Update account
- `DELETE /accounts/{id}` - Delete account

### **Task Endpoints**
- `GET /tasks` - List all tasks
- `POST /tasks` - Create new task
- `GET /tasks/{id}` - Get specific task
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

### **Task Step Endpoints**
- `GET /task-steps` - List all task steps
- `POST /task-steps` - Create new task step
- `GET /task-steps/{id}` - Get specific task step
- `PUT /task-steps/{id}` - Update task step
- `DELETE /task-steps/{id}` - Delete task step

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

# Restart services
docker-compose restart
```

### **Port Already in Use**
```bash
# Change port in docker-compose.yml
ports:
  - "8080:8000"  # Use port 8080 instead
```

## 📄 License

This project is licensed under the MIT License.

---

**🎯 The simplest, most reliable entity tracking solution - everything in one container!**

Built with ❤️ using FastAPI, PostgreSQL, Bootstrap, and Docker.
- `GET /accounts` - List all accounts
- `POST /accounts` - Create new account
- `GET /accounts/{id}` - Get specific account
- `PUT /accounts/{id}` - Update account
- `DELETE /accounts/{id}` - Delete account

### Tasks
- `GET /tasks` - List all tasks
- `POST /tasks` - Create new task
- `GET /tasks/{id}` - Get specific task
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

### Health
- `GET /health` - Health check endpoint

## Database Schema

The application uses three main tables:

1. **entities** - Core business entity information
2. **accounts** - Account credentials and URLs for entities
3. **tasks** - Tasks and deadlines associated with entities
4. **task_steps** - Individual steps within tasks

## Security Features

- Passwords are encrypted using Fernet symmetric encryption
- Row Level Security (RLS) policies in Supabase
- CORS configuration for frontend-backend communication
- Input validation and sanitization

## Deployment Options

### Backend Deployment
- **Heroku**: Easy deployment with PostgreSQL addon
- **Railway**: Modern deployment platform
- **Render**: Free tier available
- **AWS Lambda**: Serverless deployment
- **DigitalOcean App Platform**: Simple deployment

### Frontend Deployment
- **GitHub Pages**: Free static hosting (recommended)
- **Netlify**: Free static hosting with form handling
- **Vercel**: Free static hosting with great performance
- **AWS S3 + CloudFront**: Scalable option

## Development

### Running Locally
1. Start the backend: `python backend/app.py`
2. Open `frontend/index.html` in your browser
3. Update `apiBaseUrl` in `app.js` to `http://localhost:8000`

### Adding New Features
1. Update the database schema in Supabase
2. Add new endpoints in `backend/app.py`
3. Update the frontend in `frontend/` directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Note**: This application handles sensitive business information. Ensure you follow proper security practices when deploying to production.

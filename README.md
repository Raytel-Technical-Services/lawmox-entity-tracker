# Lawmox Entity Tracker

A comprehensive business entity tracking application built with Python (FastAPI) backend, Supabase database, and GitHub Pages frontend.

## Features

### Entity Management
- Track business entities with critical information:
  - Entity Name
  - EIN (Employer Identification Number)
  - Date of Formation
  - Registered Address
  - State of Formation
  - Entity Type (LLC, Corporation, etc.)
  - Status (Active, Inactive, Dissolved)

### Account Management
- Store account information for each entity:
  - Account Name
  - Login URL
  - Username and encrypted password storage
  - Account Type (Bank, Tax, Business License, etc.)
  - Notes

### Task Management
- Create and track tasks with:
  - Task Title and Description
  - Deadlines
  - Priority Levels (Low, Medium, High)
  - Status Tracking (Pending, In Progress, Completed, Overdue)
  - Step-by-step task breakdown

## Technology Stack

- **Backend**: Python with FastAPI
- **Database**: Supabase (PostgreSQL)
- **Frontend**: HTML, CSS, JavaScript with Bootstrap 5
- **Deployment**: GitHub Pages for frontend, any cloud platform for backend
- **Security**: Password encryption using Fernet symmetric encryption

## Setup Instructions

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Run the SQL schema from `database_schema.sql` in the Supabase SQL editor
3. Get your project credentials:
   - Project URL
   - Anon Key
   - Service Role Key

### 2. Backend Setup

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd lawmox-entity-tracker
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   ENCRYPTION_KEY=your_generated_encryption_key
   ```

5. Generate encryption key:
   ```bash
   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   ```

6. Run the backend server:
   ```bash
   cd backend
   python app.py
   ```

The API will be available at `http://localhost:8000`

### 3. Frontend Setup (GitHub Pages)

1. Enable GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Select "Deploy from a branch"
   - Choose `main` branch and `/` folder
   - Or create a `gh-pages` branch

2. Update the API URL in `frontend/app.js`:
   ```javascript
   this.apiBaseUrl = 'https://your-backend-url.com'; // Update to your deployed backend URL
   ```

3. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

## API Endpoints

### Entities
- `GET /entities` - List all entities
- `POST /entities` - Create new entity
- `GET /entities/{id}` - Get specific entity
- `PUT /entities/{id}` - Update entity
- `DELETE /entities/{id}` - Delete entity

### Accounts
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

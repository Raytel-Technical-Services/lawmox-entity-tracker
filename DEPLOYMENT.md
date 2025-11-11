# Deployment Guide

## Quick Start

### 1. Create GitHub Repository
```bash
# Create a new repository on GitHub named "lawmox-entity-tracker"
# Then run:
git remote add origin https://github.com/yourusername/lawmox-entity-tracker.git
git push -u origin main
```

### 2. Set up Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the Supabase SQL Editor, run the contents of `database_schema.sql`
3. Get your project credentials from Settings → API
4. Update your `.env` file with these credentials

### 3. Deploy Frontend to GitHub Pages
1. Go to your repository on GitHub
2. Navigate to Settings → Pages
3. Source: Deploy from a branch
4. Branch: main / (root)
5. Save and wait for deployment

### 4. Deploy Backend (Choose one option)

#### Option A: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway new
railway up
```

#### Option B: Heroku
```bash
# Install Heroku CLI
# Then:
heroku create your-app-name
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_KEY=your_key
heroku config:set SUPABASE_SERVICE_KEY=your_service_key
heroku config:set ENCRYPTION_KEY=your_encryption_key
git push heroku main
```

#### Option C: Render
1. Create account at [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new Web Service
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `python backend/app.py`
6. Add environment variables

### 5. Update Frontend API URL
Edit `frontend/app.js` and update:
```javascript
this.apiBaseUrl = 'https://your-backend-url.com';
```

### 6. Test Your Application
1. Visit your GitHub Pages URL
2. Test creating entities, accounts, and tasks
3. Verify all functionality works

## Environment Variables

Required for backend deployment:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key
- `ENCRYPTION_KEY`: Generated encryption key for passwords

## Security Considerations

1. **Never commit `.env` files** to version control
2. **Use HTTPS** for all API calls in production
3. **Enable RLS policies** in Supabase (included in schema)
4. **Regularly rotate** encryption keys and API keys
5. **Use strong passwords** for all accounts

## Monitoring and Maintenance

### Backend Health Check
```bash
curl https://your-backend-url.com/health
```

### Database Backups
Supabase automatically backs up your database. Check your dashboard for backup settings.

### Log Monitoring
Consider using a logging service like:
- LogRocket
- Sentry
- Logtail

## Scaling Considerations

### Database Scaling
- Monitor Supabase usage metrics
- Consider read replicas for high traffic
- Implement connection pooling

### Backend Scaling
- Use load balancers for multiple instances
- Consider serverless options (AWS Lambda, Vercel Functions)
- Implement caching (Redis)

### Frontend Optimization
- Use CDN for static assets
- Implement lazy loading
- Optimize images and fonts

## Troubleshooting

### Common Issues

#### CORS Errors
```python
# In backend/app.py, update CORS settings:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-url.com"],  # Be specific in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Database Connection Issues
- Verify Supabase credentials
- Check network connectivity
- Review Supabase logs

#### Deployment Failures
- Check environment variables
- Review deployment logs
- Verify all dependencies are installed

### Support Resources
- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

## Customization

### Adding New Fields
1. Update database schema in Supabase
2. Update Pydantic models in `backend/app.py`
3. Update frontend forms and tables

### Custom Styling
- Modify `frontend/styles.css`
- Add custom CSS variables
- Update Bootstrap theme if needed

### Additional Features
Consider adding:
- User authentication
- File uploads
- Email notifications
- Reporting dashboard
- API rate limiting

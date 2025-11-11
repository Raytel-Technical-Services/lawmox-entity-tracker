#!/bin/bash

# Lawmox Entity Tracker - Deployment Commands
# Run these after creating your GitHub repository

echo "🚀 Starting Lawmox Entity Tracker Deployment..."

# Step 1: Add GitHub remote (repository: Raytel-Technical-Services/lawmox-entity-tracker)
echo "📝 Step 1: Adding GitHub remote..."
git remote add origin https://github.com/Raytel-Technical-Services/lawmox-entity-tracker.git

# Step 2: Push to GitHub
echo "📤 Step 2: Pushing to GitHub..."
git branch -M main
git push -u origin main

# Step 3: Enable GitHub Pages
echo "🌐 Step 3: GitHub Pages setup instructions:"
echo "   1. Go to your repository on GitHub"
echo "   2. Click Settings → Pages"
echo "   3. Source: Deploy from a branch"
echo "   4. Branch: main / (root)"
echo "   5. Click Save"

echo ""
echo "✅ Frontend will be available at: https://Raytel-Technical-Services.github.io/lawmox-entity-tracker/"
echo ""
echo "📋 Next steps:"
echo "1. Deploy backend (choose Railway, Heroku, or Render)"
echo "2. Update API URL in frontend/app.js"
echo "3. Test the complete application"

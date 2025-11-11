#!/bin/bash

# Lawmox Entity Tracker Setup Script

echo "🚀 Setting up Lawmox Entity Tracker..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed. Please install Python 3 first."
    exit 1
fi

# Check if Node.js is installed (for frontend development tools)
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js is not installed. It's optional but recommended for frontend development."
fi

# Create virtual environment
echo "📦 Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Generate encryption key
echo "🔐 Generating encryption key..."
ENCRYPTION_KEY=$(python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

# Create .env file from example
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    
    # Update encryption key in .env
    sed -i.bak "s/your_generated_encryption_key/$ENCRYPTION_KEY/" .env
    rm .env.bak
    
    echo "✅ .env file created with encryption key"
    echo "📋 Please update your .env file with your Supabase credentials:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_KEY"
    echo "   - SUPABASE_SERVICE_KEY"
else
    echo "⚠️  .env file already exists. Please update it manually with Supabase credentials."
fi

# Create logs directory
mkdir -p logs

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Run the SQL schema from database_schema.sql in Supabase"
echo "3. Update your .env file with Supabase credentials"
echo "4. Run the backend: cd backend && python app.py"
echo "5. Open frontend/index.html in your browser"
echo "6. Deploy to GitHub when ready!"
echo ""
echo "🔑 Your encryption key: $ENCRYPTION_KEY"
echo "   (This has been added to your .env file)"

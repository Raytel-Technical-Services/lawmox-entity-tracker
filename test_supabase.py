#!/usr/bin/env python3

"""
Simple test script to verify Supabase connection
"""

import os
import sys

def test_env_vars():
    """Test if environment variables are set"""
    print("🔍 Testing environment variables...")
    
    required_vars = ['SUPABASE_URL', 'SUPABASE_KEY', 'SUPABASE_SERVICE_KEY', 'ENCRYPTION_KEY']
    missing_vars = []
    
    for var in required_vars:
        value = os.getenv(var)
        if value is None or value in ['your_supabase_project_url', 'your_supabase_anon_key', 'your_supabase_service_role_key']:
            missing_vars.append(var)
            print(f"❌ {var}: NOT SET or using placeholder")
        else:
            print(f"✅ {var}: SET")
    
    if missing_vars:
        print(f"\n⚠️  Missing variables: {', '.join(missing_vars)}")
        print("\nPlease update your .env file with actual Supabase credentials:")
        print("1. Go to https://supabase.com")
        print("2. Create/select your project")
        print("3. Go to Settings → API")
        print("4. Copy the credentials to your .env file")
        return False
    else:
        print("\n🎉 All environment variables are properly set!")
        return True

def test_supabase_connection():
    """Test Supabase connection if env vars are set"""
    if not test_env_vars():
        return False
    
    try:
        print("\n🔗 Testing Supabase connection...")
        
        # Try to import supabase
        try:
            from supabase import create_client
        except ImportError:
            print("❌ Supabase client not installed. Run: pip install supabase")
            return False
        
        # Create client
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_KEY')
        
        client = create_client(url, key)
        
        # Test connection by checking if entities table exists
        try:
            response = client.table('entities').select('count').execute()
            print("✅ Successfully connected to Supabase!")
            print("✅ Entities table is accessible!")
            return True
        except Exception as e:
            print(f"❌ Error accessing entities table: {e}")
            print("💡 Make sure you ran the database_schema.sql in Supabase SQL Editor")
            return False
            
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Lawmox Entity Tracker - Supabase Setup Test")
    print("=" * 50)
    
    # Load environment variables
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("✅ Environment variables loaded from .env")
    except ImportError:
        print("⚠️  python-dotenv not installed. Using system environment variables.")
    
    success = test_supabase_connection()
    
    if success:
        print("\n🎯 Setup complete! You can now run the backend:")
        print("   cd backend && python app.py")
    else:
        print("\n📋 Please complete the setup steps above and try again.")
    
    sys.exit(0 if success else 1)

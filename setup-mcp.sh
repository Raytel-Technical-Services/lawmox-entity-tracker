#!/bin/bash

# Lawmox Entity Tracker - Supabase MCP Server Setup

echo "🚀 Setting up Supabase MCP Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed. Please install npm first."
    exit 1
fi

# Install MCP dependencies
echo "📦 Installing MCP server dependencies..."
npm install --package-lock=false

# Create MCP server configuration
echo "⚙️ Creating MCP server configuration..."

# Get current directory
CURRENT_DIR=$(pwd)
MCP_CONFIG_DIR="$HOME/Library/Application Support/caesr-desktop/chat/mcp_configs"

# Generate unique ID for the configuration
CONFIG_ID="mcpcnf_$(date +%s | md5sum | head -c 24)"

# Create MCP configuration file
cat > "$MCP_CONFIG_DIR/$CONFIG_ID.json" << EOF
{
  "id": "$CONFIG_ID",
  "name": "lawmox_supabase",
  "mcp_server": {
    "command": "node",
    "args": ["$CURRENT_DIR/mcp-server.js"],
    "env": {
      "SUPABASE_URL": "$(grep SUPABASE_URL .env | cut -d'=' -f2)",
      "SUPABASE_SERVICE_KEY": "$(grep SUPABASE_SERVICE_KEY .env | cut -d'=' -f2)",
      "ENCRYPTION_KEY": "$(grep ENCRYPTION_KEY .env | cut -d'=' -f2)"
    }
  },
  "created_at": $(date +%s)
}
EOF

echo "✅ MCP configuration created: $CONFIG_ID.json"

# Test the MCP server
echo "🧪 Testing MCP server..."

if [ -f ".env" ]; then
    echo "✅ .env file found"
    
    # Check if required variables are set
    if grep -q "your_supabase_project_url" .env; then
        echo "⚠️  Warning: Please update your .env file with actual Supabase credentials"
        echo "   Follow the steps in SUPABASE_SETUP.md"
    else
        echo "✅ Supabase credentials appear to be configured"
    fi
else
    echo "❌ .env file not found. Please create it from .env.example"
    exit 1
fi

# Create a test script
cat > test-mcp-connection.js << 'EOF'
#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing Supabase MCP Server Connection...');

const mcpServer = spawn('node', [path.join(__dirname, 'mcp-server.js')], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env }
});

let response = '';

mcpServer.stdout.on('data', (data) => {
  response += data.toString();
});

mcpServer.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

setTimeout(() => {
  // Send a health check request
  const request = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'supabase_health_check',
      arguments: {}
    }
  }) + '\n';

  mcpServer.stdin.write(request);
}, 1000);

setTimeout(() => {
  if (response.includes('✅')) {
    console.log('✅ MCP Server is working correctly!');
  } else {
    console.log('❌ MCP Server test failed');
    console.log('Response:', response);
  }
  
  mcpServer.kill();
  process.exit(0);
}, 3000);
EOF

chmod +x test-mcp-connection.js

echo ""
echo "🎯 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update your .env file with actual Supabase credentials"
echo "2. Restart your IDE/Claude Desktop to load the MCP server"
echo "3. Test the connection: node test-mcp-connection.js"
echo ""
echo "🔧 Available MCP Tools:"
echo "   - supabase_query: Execute SQL queries"
echo "   - supabase_table_operation: CRUD operations"
echo "   - supabase_schema_info: Database schema information"
echo "   - supabase_health_check: Connection status"
echo ""
echo "📁 Configuration saved to: $MCP_CONFIG_DIR/$CONFIG_ID.json"

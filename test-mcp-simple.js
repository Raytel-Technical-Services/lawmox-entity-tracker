#!/usr/bin/env node

/**
 * Simple test for Supabase MCP Server
 */

console.log('🧪 Testing Supabase MCP Server Setup...\n');

// Check if required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'mcp-server.js',
  'package.json',
  '.env'
];

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing!`);
  }
});

// Check environment variables
console.log('\n🔧 Checking environment variables:');
try {
  require('dotenv').config();
  
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'ENCRYPTION_KEY'];
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value && !value.includes('your_')) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Not set or using placeholder`);
    }
  });
} catch (error) {
  console.log('❌ Could not load environment variables:', error.message);
}

// Check Node.js modules
console.log('\n📦 Checking dependencies:');
try {
  const packageJson = require('./package.json');
  console.log(`✅ MCP Server package: ${packageJson.name}`);
  
  // Check if node_modules exists
  if (fs.existsSync('node_modules')) {
    console.log('✅ Dependencies installed');
  } else {
    console.log('❌ Dependencies not installed');
  }
} catch (error) {
  console.log('❌ Package.json error:', error.message);
}

// Check MCP configuration
console.log('\n⚙️  MCP Configuration:');
const configPath = path.join(process.env.HOME, 'Library/Application Support/caesr-desktop/chat/mcp_configs/mcpcnf_83b7033848e7d807cd5e8985.json');
if (fs.existsSync(configPath)) {
  console.log('✅ MCP configuration created');
} else {
  console.log('❌ MCP configuration not found');
}

console.log('\n🎯 Setup Status:');
console.log('📋 To complete setup:');
console.log('1. Update .env with actual Supabase credentials');
console.log('2. Restart your IDE to load the MCP server');
console.log('3. Test with: node mcp-server.js');
console.log('\n🔧 Once configured, you will have access to:');
console.log('   - Direct database queries');
console.log('   - Table operations (CRUD)');
console.log('   - Schema information');
console.log('   - Health monitoring');

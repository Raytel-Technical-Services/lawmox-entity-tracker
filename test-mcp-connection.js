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

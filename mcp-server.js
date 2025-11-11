#!/usr/bin/env node

/**
 * Supabase MCP Server for Lawmox Entity Tracker
 * Provides direct database access and enhanced Supabase functionality
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { 
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError 
} = require('@modelcontextprotocol/sdk/types.js');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class SupabaseMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'lawmox-supabase-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize Supabase client
    this.supabase = null;
    this.initializeSupabase();

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  initializeSupabase() {
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials. Please check your .env file.');
        return;
      }

      this.supabase = createClient(supabaseUrl, supabaseKey);
      console.log('✅ Supabase MCP Server initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error.message);
    }
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'supabase_query',
            description: 'Execute a SQL query on the Supabase database',
            inputSchema: {
              type: 'object',
              properties: {
                sql: {
                  type: 'string',
                  description: 'SQL query to execute',
                },
                params: {
                  type: 'array',
                  description: 'Parameters for the query (optional)',
                  items: { type: 'string' }
                }
              },
              required: ['sql'],
            },
          },
          {
            name: 'supabase_table_operation',
            description: 'Perform CRUD operations on Supabase tables',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  description: 'Table name',
                },
                operation: {
                  type: 'string',
                  enum: ['select', 'insert', 'update', 'delete'],
                  description: 'Operation type',
                },
                data: {
                  type: 'object',
                  description: 'Data for insert/update operations',
                },
                filter: {
                  type: 'object',
                  description: 'Filter conditions for select/update/delete operations',
                }
              },
              required: ['table', 'operation'],
            },
          },
          {
            name: 'supabase_schema_info',
            description: 'Get information about database schema',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  description: 'Specific table name (optional, returns all tables if not provided)',
                }
              }
            },
          },
          {
            name: 'supabase_health_check',
            description: 'Check Supabase connection and database status',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!this.supabase) {
        throw new McpError(
          ErrorCode.InternalError,
          'Supabase client not initialized. Check your credentials.'
        );
      }

      try {
        switch (name) {
          case 'supabase_query':
            return await this.handleQuery(args);
          case 'supabase_table_operation':
            return await this.handleTableOperation(args);
          case 'supabase_schema_info':
            return await this.handleSchemaInfo(args);
          case 'supabase_health_check':
            return await this.handleHealthCheck();
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  async handleQuery(args) {
    const { sql, params = [] } = args;
    
    try {
      const { data, error } = await this.supabase.rpc('exec_sql', { 
        query: sql, 
        parameters: params 
      });

      if (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Query Error: ${error.message}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ Query executed successfully:\n\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Query failed: ${error.message}`,
          },
        ],
      };
    }
  }

  async handleTableOperation(args) {
    const { table, operation, data, filter } = args;
    
    try {
      let result;
      
      switch (operation) {
        case 'select':
          result = await this.supabase.from(table).select('*').match(filter || {});
          break;
        case 'insert':
          result = await this.supabase.from(table).insert(data);
          break;
        case 'update':
          result = await this.supabase.from(table).update(data).match(filter || {});
          break;
        case 'delete':
          result = await this.supabase.from(table).delete().match(filter || {});
          break;
      }

      if (result.error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ ${operation} Error: ${result.error.message}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ ${operation} on ${table} successful:\n\n${JSON.stringify(result.data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ ${operation} failed: ${error.message}`,
          },
        ],
      };
    }
  }

  async handleSchemaInfo(args) {
    const { table } = args;
    
    try {
      // Get table information
      const { data: tables, error } = await this.supabase
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public');

      if (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Schema Error: ${error.message}`,
            },
          ],
        };
      }

      let response = '📊 Database Schema:\n\n';
      
      if (table) {
        // Specific table info
        const tableInfo = tables.find(t => t.table_name === table);
        if (tableInfo) {
          response += `Table: ${tableInfo.table_name}\nType: ${tableInfo.table_type}\n`;
          
          // Get column information
          const { data: columns } = await this.supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', table)
            .eq('table_schema', 'public');
            
          if (columns && columns.length > 0) {
            response += '\nColumns:\n';
            columns.forEach(col => {
              response += `  - ${col.column_name} (${col.data_type}, ${col.is_nullable})\n`;
            });
          }
        } else {
          response = `❌ Table '${table}' not found`;
        }
      } else {
        // All tables
        tables.forEach(t => {
          response += `- ${t.table_name} (${t.table_type})\n`;
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: response,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Schema info failed: ${error.message}`,
          },
        ],
      };
    }
  }

  async handleHealthCheck() {
    try {
      // Test basic connectivity
      const { data, error } = await this.supabase
        .from('entities')
        .select('count')
        .limit(1);

      if (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Health Check Failed: ${error.message}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: '✅ Supabase Connection: Healthy\n✅ Database: Accessible\n✅ Entities Table: Available',
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Health check failed: ${error.message}`,
          },
        ],
      };
    }
  }

  setupErrorHandling() {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 Lawmox Supabase MCP Server running on stdio');
  }
}

// Start the server
const server = new SupabaseMCPServer();
server.run().catch(console.error);

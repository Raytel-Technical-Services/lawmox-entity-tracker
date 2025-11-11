# Supabase MCP Server Setup Guide

## 🚀 What is the MCP Server?

The Model Context Protocol (MCP) server provides **direct database access** to your Supabase project, bypassing the API layer for enhanced performance and capabilities.

## 📋 Setup Status

✅ **MCP Server Code**: Created and ready  
⚠️ **Supabase Credentials**: Need to be updated in `.env`  
✅ **Dependencies**: Installed  
✅ **Configuration**: Created  

## 🔧 Complete Setup Steps

### 1. Update Supabase Credentials
Edit your `.env` file with actual Supabase credentials:

```env
# Replace these placeholders with your actual credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_KEY=your_actual_service_role_key_here

# This is already configured
ENCRYPTION_KEY=uaa_EVZYxTn6sR902AN0E04HWWT1z6k_8qgKbMKFNvA=
```

### 2. Restart Your IDE
- **Close and restart** your IDE/Claude Desktop
- This loads the new MCP server configuration
- The server will be available as "lawmox_supabase"

### 3. Test the Connection
```bash
node test-mcp-simple.js
```

## 🛠️ Available MCP Tools

Once configured, you'll have access to these powerful tools:

### **supabase_query**
Execute raw SQL queries directly on your database:
```javascript
// Example: Count all entities
{
  "sql": "SELECT COUNT(*) as total FROM entities"
}
```

### **supabase_table_operation**
Perform CRUD operations without API calls:
```javascript
// Example: Insert a new entity
{
  "table": "entities",
  "operation": "insert",
  "data": {
    "entity_name": "Test Company LLC",
    "ein": "12-3456789",
    "state_of_formation": "Delaware"
  }
}
```

### **supabase_schema_info**
Get detailed database schema information:
```javascript
// Example: Get entities table structure
{
  "table": "entities"
}
```

### **supabase_health_check**
Monitor database connection and status:
```javascript
// No parameters needed
{}
```

## 🎯 Benefits for Your Entity Tracker

### **Performance Improvements**
- ⚡ **Direct database access** - No API overhead
- 🚀 **Bulk operations** - Import hundreds of entities at once
- 📊 **Complex queries** - Advanced reporting and analytics

### **Enhanced Features**
- 🔍 **Real-time data inspection** - Debug database issues instantly
- 📋 **Schema management** - Add/modify tables programmatically
- 🛡️ **Security auditing** - Check RLS policies and permissions

### **Development Tools**
- 🧪 **Data seeding** - Populate test data quickly
- 📈 **Performance monitoring** - Track query performance
- 🔧 **Database maintenance** - Optimize and clean up data

## 🚨 Security Notes

- **Service Role Key**: The MCP server uses your service role key (admin access)
- **Local Only**: Server runs locally, credentials aren't exposed externally
- **RLS Still Applies**: Database Row Level Security policies remain active
- **Audit Trail**: All operations are logged in Supabase

## 🔄 Next Steps

1. **Update credentials** in `.env` file
2. **Restart IDE** to load MCP server
3. **Test connection** with the provided test script
4. **Start using** the enhanced database tools

## 📞 Troubleshooting

### "MCP server not found"
- Restart your IDE/Claude Desktop
- Check the configuration file exists
- Verify Node.js is installed

### "Connection failed"
- Update Supabase credentials in `.env`
- Check your Supabase project is active
- Verify service role key permissions

### "Tool execution failed"
- Ensure database schema is installed
- Check table names and permissions
- Review the error message for details

## 🎉 Ready to Use!

Once configured, you'll have **direct database access** for your Lawmox Entity Tracker with:
- ✅ Faster data operations
- ✅ Advanced querying capabilities  
- ✅ Real-time database management
- ✅ Enhanced development tools

The MCP server transforms your entity tracker from a basic API-based app into a powerful database management system!

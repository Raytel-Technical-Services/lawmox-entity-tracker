-- Lawmox Entity Tracker Database Schema
-- Supabase PostgreSQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Entities table
CREATE TABLE entities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_name VARCHAR(255) NOT NULL,
    ein VARCHAR(20) UNIQUE,
    date_of_formation DATE,
    registered_address TEXT,
    state_of_formation VARCHAR(100),
    entity_type VARCHAR(100), -- LLC, Corporation, etc.
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, dissolved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts table
CREATE TABLE accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    account_name VARCHAR(255) NOT NULL,
    login_url TEXT,
    username VARCHAR(255),
    password_encrypted TEXT, -- Store encrypted passwords
    account_type VARCHAR(100), -- bank, tax, business license, etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    task_title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATE,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, overdue
    steps JSONB, -- Array of task steps as JSON
    completion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task steps table (alternative to JSONB for more structured approach)
CREATE TABLE task_steps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_description TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_entities_entity_name ON entities(entity_name);
CREATE INDEX idx_entities_ein ON entities(ein);
CREATE INDEX idx_accounts_entity_id ON accounts(entity_id);
CREATE INDEX idx_tasks_entity_id ON tasks(entity_id);
CREATE INDEX idx_tasks_account_id ON tasks(account_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_task_steps_task_id ON task_steps(task_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_steps ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you may want to customize these based on your authentication needs)
CREATE POLICY "Users can view own entities" ON entities
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own entities" ON entities
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own entities" ON entities
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own entities" ON entities
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Similar policies for accounts, tasks, and task_steps
CREATE POLICY "Users can manage own accounts" ON accounts
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage own tasks" ON tasks
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage own task steps" ON task_steps
    FOR ALL USING (auth.uid() IS NOT NULL);

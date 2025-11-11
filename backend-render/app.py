from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import date, datetime
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from cryptography.fernet import Fernet
import json
from urllib.parse import urlparse

app = FastAPI(title="Lawmox Entity Tracker API", version="1.0.0")

# CORS middleware for Render
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your Render frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
def get_db_connection():
    try:
        # Use DATABASE_URL from Render environment
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise HTTPException(status_code=500, detail="DATABASE_URL not configured")
        
        conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

# Encryption for passwords
encryption_key = os.getenv("ENCRYPTION_KEY")
if not encryption_key:
    # Generate a key if not provided
    encryption_key = Fernet.generate_key().decode()
cipher_suite = Fernet(encryption_key.encode())

# Initialize database tables
def init_database():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Create entities table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS entities (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    entity_name VARCHAR(255) NOT NULL,
                    ein VARCHAR(20) UNIQUE,
                    date_of_formation DATE,
                    registered_address TEXT,
                    state_of_formation VARCHAR(100),
                    entity_type VARCHAR(100),
                    status VARCHAR(50) DEFAULT 'active',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """)
            
            # Create accounts table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS accounts (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    account_name VARCHAR(255) NOT NULL,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    encrypted_password TEXT NOT NULL,
                    entity_id UUID REFERENCES entities(id),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """)
            
            # Create tasks table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    task_name VARCHAR(255) NOT NULL,
                    description TEXT,
                    status VARCHAR(50) DEFAULT 'pending',
                    entity_id UUID REFERENCES entities(id),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """)
            
            # Create task_steps table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS task_steps (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    step_name VARCHAR(255) NOT NULL,
                    description TEXT,
                    status VARCHAR(50) DEFAULT 'pending',
                    task_id UUID REFERENCES tasks(id),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """)
            
            conn.commit()
    finally:
        conn.close()

# Pydantic models
class EntityBase(BaseModel):
    entity_name: str
    ein: Optional[str] = None
    date_of_formation: Optional[date] = None
    registered_address: Optional[str] = None
    state_of_formation: Optional[str] = None
    entity_type: Optional[str] = None
    status: str = "active"

class EntityCreate(EntityBase):
    pass

class EntityUpdate(BaseModel):
    entity_name: Optional[str] = None
    ein: Optional[str] = None
    date_of_formation: Optional[date] = None
    registered_address: Optional[str] = None
    state_of_formation: Optional[str] = None
    entity_type: Optional[str] = None
    status: Optional[str] = None

class EntityResponse(EntityBase):
    id: str
    created_at: datetime
    updated_at: datetime

class AccountBase(BaseModel):
    account_name: str
    username: str
    password: str
    entity_id: Optional[str] = None

class AccountCreate(AccountBase):
    pass

class AccountResponse(BaseModel):
    id: str
    account_name: str
    username: str
    entity_id: Optional[str]
    created_at: datetime
    updated_at: datetime

class TaskBase(BaseModel):
    task_name: str
    description: Optional[str] = None
    status: str = "pending"
    entity_id: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    task_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    entity_id: Optional[str] = None

class TaskResponse(TaskBase):
    id: str
    created_at: datetime
    updated_at: datetime

class TaskStepBase(BaseModel):
    step_name: str
    description: Optional[str] = None
    status: str = "pending"
    task_id: str

class TaskStepCreate(TaskStepBase):
    pass

class TaskStepUpdate(BaseModel):
    step_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    task_id: Optional[str] = None

class TaskStepResponse(TaskStepBase):
    id: str
    created_at: datetime
    updated_at: datetime

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Lawmox Entity Tracker API"}

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_database()

# Entity endpoints
@app.get("/entities", response_model=List[EntityResponse])
async def get_entities():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM entities ORDER BY created_at DESC")
            entities = cur.fetchall()
            return [EntityResponse(**entity) for entity in entities]
    finally:
        conn.close()

@app.post("/entities", response_model=EntityResponse)
async def create_entity(entity: EntityCreate):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO entities (entity_name, ein, date_of_formation, registered_address, state_of_formation, entity_type, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING *
            """, (
                entity.entity_name, entity.ein, entity.date_of_formation,
                entity.registered_address, entity.state_of_formation, entity.entity_type, entity.status
            ))
            result = cur.fetchone()
            conn.commit()
            return EntityResponse(**result)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@app.get("/entities/{entity_id}", response_model=EntityResponse)
async def get_entity(entity_id: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM entities WHERE id = %s", (entity_id,))
            entity = cur.fetchone()
            if not entity:
                raise HTTPException(status_code=404, detail="Entity not found")
            return EntityResponse(**entity)
    finally:
        conn.close()

@app.put("/entities/{entity_id}", response_model=EntityResponse)
async def update_entity(entity_id: str, entity: EntityUpdate):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Build dynamic update query
            update_fields = []
            values = []
            for field, value in entity.dict(exclude_unset=True).items():
                update_fields.append(f"{field} = %s")
                values.append(value)
            
            if not update_fields:
                raise HTTPException(status_code=400, detail="No fields to update")
            
            values.append(entity_id)
            query = f"""
                UPDATE entities 
                SET {', '.join(update_fields)}, updated_at = NOW()
                WHERE id = %s
                RETURNING *
            """
            
            cur.execute(query, values)
            result = cur.fetchone()
            conn.commit()
            
            if not result:
                raise HTTPException(status_code=404, detail="Entity not found")
            return EntityResponse(**result)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@app.delete("/entities/{entity_id}")
async def delete_entity(entity_id: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM entities WHERE id = %s RETURNING id", (entity_id,))
            result = cur.fetchone()
            conn.commit()
            
            if not result:
                raise HTTPException(status_code=404, detail="Entity not found")
            return {"message": "Entity deleted successfully"}
    finally:
        conn.close()

# Account endpoints
@app.get("/accounts", response_model=List[AccountResponse])
async def get_accounts():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, account_name, username, entity_id, created_at, updated_at FROM accounts ORDER BY created_at DESC")
            accounts = cur.fetchall()
            return [AccountResponse(**account) for account in accounts]
    finally:
        conn.close()

@app.post("/accounts", response_model=AccountResponse)
async def create_account(account: AccountCreate):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Encrypt password
            encrypted_password = cipher_suite.encrypt(account.password.encode()).decode()
            
            cur.execute("""
                INSERT INTO accounts (account_name, username, encrypted_password, entity_id)
                VALUES (%s, %s, %s, %s)
                RETURNING id, account_name, username, entity_id, created_at, updated_at
            """, (account.account_name, account.username, encrypted_password, account.entity_id))
            
            result = cur.fetchone()
            conn.commit()
            return AccountResponse(**result)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

# Task endpoints
@app.get("/tasks", response_model=List[TaskResponse])
async def get_tasks():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM tasks ORDER BY created_at DESC")
            tasks = cur.fetchall()
            return [TaskResponse(**task) for task in tasks]
    finally:
        conn.close()

@app.post("/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO tasks (task_name, description, status, entity_id)
                VALUES (%s, %s, %s, %s)
                RETURNING *
            """, (task.task_name, task.description, task.status, task.entity_id))
            
            result = cur.fetchone()
            conn.commit()
            return TaskResponse(**result)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

# Task step endpoints
@app.get("/task-steps", response_model=List[TaskStepResponse])
async def get_task_steps():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM task_steps ORDER BY created_at DESC")
            steps = cur.fetchall()
            return [TaskStepResponse(**step) for step in steps]
    finally:
        conn.close()

@app.post("/task-steps", response_model=TaskStepResponse)
async def create_task_step(step: TaskStepCreate):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO task_steps (step_name, description, status, task_id)
                VALUES (%s, %s, %s, %s)
                RETURNING *
            """, (step.step_name, step.description, step.status, step.task_id))
            
            result = cur.fetchone()
            conn.commit()
            return TaskStepResponse(**result)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

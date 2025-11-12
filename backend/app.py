from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import date, datetime
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from cryptography.fernet import Fernet
import json
import subprocess
import time
import signal
import sys

app = FastAPI(title="Lawmox Entity Tracker", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files and templates
app.mount("/static", StaticFiles(directory="frontend"), name="static")
templates = Jinja2Templates(directory="frontend")

# Database connection
def get_db_connection():
    max_retries = 30
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            # Use local PostgreSQL in container
            conn = psycopg2.connect(
                host="localhost",
                database="lawmox_entity_tracker",
                user="lawmox_user",
                password="lawmox_password",
                cursor_factory=RealDictCursor
            )
            return conn
        except Exception as e:
            if attempt == max_retries - 1:
                raise HTTPException(status_code=500, detail=f"Database connection failed after {max_retries} attempts: {str(e)}")
            time.sleep(retry_delay)

# Encryption for passwords
encryption_key = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode())
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
            print("Database initialized successfully")
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
    status: Optional[str] = None

class EntityResponse(EntityBase):
    id: str
    created_at: datetime
    updated_at: datetime

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

# Serve frontend
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Lawmox Entity Tracker - Single Container"}

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    print("Starting Lawmox Entity Tracker...")
    print("Initializing database...")
    init_database()
    print("Application ready!")

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

@app.get("/accounts/{account_id}", response_model=AccountResponse)
async def get_account(account_id: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, account_name, username, entity_id, created_at, updated_at FROM accounts WHERE id = %s", (account_id,))
            account = cur.fetchone()
            if not account:
                raise HTTPException(status_code=404, detail="Account not found")
            return AccountResponse(**account)
    finally:
        conn.close()

@app.put("/accounts/{account_id}", response_model=AccountResponse)
async def update_account(account_id: str, account: AccountUpdate):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Build dynamic update query
            update_fields = []
            values = []
            for field, value in account.dict(exclude_unset=True).items():
                update_fields.append(f"{field} = %s")
                values.append(value)
            
            if not update_fields:
                raise HTTPException(status_code=400, detail="No fields to update")
            
            values.append(account_id)
            query = f"""
                UPDATE accounts 
                SET {', '.join(update_fields)}, updated_at = NOW()
                WHERE id = %s
                RETURNING id, account_name, username, entity_id, created_at, updated_at
            """
            
            cur.execute(query, values)
            result = cur.fetchone()
            conn.commit()
            
            if not result:
                raise HTTPException(status_code=404, detail="Account not found")
            return AccountResponse(**result)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@app.delete("/accounts/{account_id}")
async def delete_account(account_id: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM accounts WHERE id = %s RETURNING id", (account_id,))
            result = cur.fetchone()
            conn.commit()
            
            if not result:
                raise HTTPException(status_code=404, detail="Account not found")
            return {"message": "Account deleted successfully"}
    finally:
        conn.close()

# Task endpoints
@app.get("/tasks", response_model=List[Task])
async def get_tasks():
    try:
        response = supabase.table("tasks").select("*").execute()
        tasks = response.data
        
        # Get task steps for each task
        for task in tasks:
            steps_response = supabase.table("task_steps").select("*").eq("task_id", task["id"]).order("step_order").execute()
            task["steps"] = steps_response.data
        
        return tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tasks", response_model=Task)
async def create_task(task: TaskCreate):
    try:
        task_data = task.dict()
        steps = task_data.pop("steps", [])
        
        # Create task
        response = supabase.table("tasks").insert(task_data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create task")
        
        task_id = response.data[0]["id"]
        
        # Create task steps if provided
        if steps:
            for step in steps:
                step["task_id"] = task_id
            steps_response = supabase.table("task_steps").insert(steps).execute()
            response.data[0]["steps"] = steps_response.data
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: str):
    try:
        response = supabase.table("tasks").select("*").eq("id", task_id).execute()
        if response.data:
            task = response.data[0]
            steps_response = supabase.table("task_steps").select("*").eq("task_id", task_id).order("step_order").execute()
            task["steps"] = steps_response.data
            return task
        raise HTTPException(status_code=404, detail="Task not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, task: TaskUpdate):
    try:
        update_data = {k: v for k, v in task.dict().items() if v is not None}
        steps = update_data.pop("steps", None)
        
        response = supabase.table("tasks").update(update_data).eq("id", task_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Update steps if provided
        if steps is not None:
            # Delete existing steps
            supabase.table("task_steps").delete().eq("task_id", task_id).execute()
            
            # Create new steps
            if steps:
                for step in steps:
                    step["task_id"] = task_id
                steps_response = supabase.table("task_steps").insert(steps).execute()
                response.data[0]["steps"] = steps_response.data
            else:
                response.data[0]["steps"] = []
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    try:
        response = supabase.table("tasks").delete().eq("id", task_id).execute()
        if response.data:
            return {"message": "Task deleted successfully"}
        raise HTTPException(status_code=404, detail="Task not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

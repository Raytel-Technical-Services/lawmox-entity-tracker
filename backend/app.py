from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import date, datetime
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from cryptography.fernet import Fernet
import json

# Load environment variables
load_dotenv()

app = FastAPI(title="Lawmox Entity Tracker API", version="1.0.0")

# CORS middleware for GitHub Pages
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your GitHub Pages URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# Encryption for passwords
encryption_key = os.getenv("ENCRYPTION_KEY").encode()
cipher_suite = Fernet(encryption_key)

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

class Entity(EntityBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AccountBase(BaseModel):
    entity_id: str
    account_name: str
    login_url: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None  # Will be encrypted
    account_type: Optional[str] = None
    notes: Optional[str] = None

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    account_name: Optional[str] = None
    login_url: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    account_type: Optional[str] = None
    notes: Optional[str] = None

class Account(AccountBase):
    id: str
    created_at: datetime
    updated_at: datetime
    password_encrypted: Optional[str] = None  # Encrypted password

    class Config:
        from_attributes = True

class TaskStepBase(BaseModel):
    step_order: int
    step_description: str
    completed: bool = False

class TaskStepCreate(TaskStepBase):
    pass

class TaskStep(TaskStepBase):
    id: str
    task_id: str
    completion_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    entity_id: str
    account_id: Optional[str] = None
    task_title: str
    description: Optional[str] = None
    deadline: Optional[date] = None
    priority: str = "medium"
    status: str = "pending"
    steps: Optional[List[TaskStepCreate]] = []

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    task_title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[date] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    steps: Optional[List[TaskStepCreate]] = None

class Task(TaskBase):
    id: str
    completion_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    steps: Optional[List[TaskStep]] = []

    class Config:
        from_attributes = True

# Helper functions
def encrypt_password(password: str) -> str:
    return cipher_suite.encrypt(password.encode()).decode()

def decrypt_password(encrypted_password: str) -> str:
    return cipher_suite.decrypt(encrypted_password.encode()).decode()

# Entity endpoints
@app.get("/entities", response_model=List[Entity])
async def get_entities():
    try:
        response = supabase.table("entities").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/entities", response_model=Entity)
async def create_entity(entity: EntityCreate):
    try:
        response = supabase.table("entities").insert(entity.dict()).execute()
        if response.data:
            return response.data[0]
        raise HTTPException(status_code=400, detail="Failed to create entity")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/entities/{entity_id}", response_model=Entity)
async def get_entity(entity_id: str):
    try:
        response = supabase.table("entities").select("*").eq("id", entity_id).execute()
        if response.data:
            return response.data[0]
        raise HTTPException(status_code=404, detail="Entity not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/entities/{entity_id}", response_model=Entity)
async def update_entity(entity_id: str, entity: EntityUpdate):
    try:
        update_data = {k: v for k, v in entity.dict().items() if v is not None}
        response = supabase.table("entities").update(update_data).eq("id", entity_id).execute()
        if response.data:
            return response.data[0]
        raise HTTPException(status_code=404, detail="Entity not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/entities/{entity_id}")
async def delete_entity(entity_id: str):
    try:
        response = supabase.table("entities").delete().eq("id", entity_id).execute()
        if response.data:
            return {"message": "Entity deleted successfully"}
        raise HTTPException(status_code=404, detail="Entity not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Account endpoints
@app.get("/accounts", response_model=List[Account])
async def get_accounts():
    try:
        response = supabase.table("accounts").select("*").execute()
        # Don't return encrypted passwords in the response
        accounts = response.data
        for account in accounts:
            account.pop('password_encrypted', None)
        return accounts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/accounts", response_model=Account)
async def create_account(account: AccountCreate):
    try:
        account_data = account.dict()
        if account_data.get("password"):
            account_data["password_encrypted"] = encrypt_password(account_data.pop("password"))
        
        response = supabase.table("accounts").insert(account_data).execute()
        if response.data:
            result = response.data[0]
            result.pop('password_encrypted', None)
            return result
        raise HTTPException(status_code=400, detail="Failed to create account")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/accounts/{account_id}", response_model=Account)
async def get_account(account_id: str):
    try:
        response = supabase.table("accounts").select("*").eq("id", account_id).execute()
        if response.data:
            result = response.data[0]
            result.pop('password_encrypted', None)
            return result
        raise HTTPException(status_code=404, detail="Account not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/accounts/{account_id}", response_model=Account)
async def update_account(account_id: str, account: AccountUpdate):
    try:
        update_data = {k: v for k, v in account.dict().items() if v is not None}
        if update_data.get("password"):
            update_data["password_encrypted"] = encrypt_password(update_data.pop("password"))
        
        response = supabase.table("accounts").update(update_data).eq("id", account_id).execute()
        if response.data:
            result = response.data[0]
            result.pop('password_encrypted', None)
            return result
        raise HTTPException(status_code=404, detail="Account not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/accounts/{account_id}")
async def delete_account(account_id: str):
    try:
        response = supabase.table("accounts").delete().eq("id", account_id).execute()
        if response.data:
            return {"message": "Account deleted successfully"}
        raise HTTPException(status_code=404, detail="Account not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

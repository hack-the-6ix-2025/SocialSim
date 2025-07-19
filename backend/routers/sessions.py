from fastapi import APIRouter, HTTPException
from utils.supabase_client import supabase
from typing import List, Literal
from uuid import UUID
from pydantic import BaseModel


router = APIRouter()


class SessionCreate(BaseModel):
    name: str
    actual_duration: int
    completion_status: Literal["not_started", "in_progress", "completed"]
    participants: List[int]
    associated_simulation: int

# Create individual session


# Host session

# Join session

# Add session to database
@router.post("/create-session/")
def add_session_to_database(session: SessionCreate): 
    try:
        response = (
            supabase.table("sessions")
            .insert({
                "name": session.name,
                "actual_duration": session.actual_duration,
                "completion_status": session.completion_status,
                "participants": session.participants,
                "associated_simulation": session.associated_simulation
            })
            .execute()
        )
        if not response.data:
            return []
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Fetch session history list_user_sessions

# Session details 

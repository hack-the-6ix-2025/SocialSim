from fastapi import APIRouter, HTTPException, Query
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

# Fetch all session history
@router.get("/all/history/")
def get_all_previous_sessions():
    response = (
        supabase.table("sessions")
        .select("*")
        .execute()
    )
    if not response.data:
        return []
    return response.data

# Session details 
@router.get("/{sim_id}")
def get_simulation(session_id : int):
    try:
        response = (
            supabase.table("sessions")
            .select("*")
            .eq("session_id", session_id)  
            .single()
            .execute()
        )
        if not response.data:
            return []
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# Filter sessions by category (one category per session, stored as text)
@router.get("/category/")
def filter_sessions_by_category(categories: list[str] = Query(...)):
    try:
        # Get sessions where the 'categories' text column matches any of the provided categories
        sessions_resp = (
            supabase.table("sessions")
            .select("*")
            .in_("categories", categories)
            .execute()
        )
        return sessions_resp.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

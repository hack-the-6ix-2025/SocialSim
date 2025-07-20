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
@router.get("/history/")
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
    
# Filter sessions by category 
@router.get("/category/")
def filter_sessions_by_category(categories: list[str] = Query(...)):
    try:
        # Get category_ids for the given category names
        category_ids_resp = (
            supabase.table("categories")
            .select("category_id")
            .in_("name", categories)
            .execute()
        )
        category_ids = [c["category_id"] for c in category_ids_resp.data]

        if not category_ids:
            return []

        # Get session_ids from session_categories for those category_ids
        session_ids_resp = (
            supabase.table("session_categories")
            .select("session_id")
            .in_("category_id", category_ids)
            .execute()
        )
        session_ids = list({s["session_id"] for s in session_ids_resp.data})

        if not session_ids:
            return []

        # Get sessions with those session_ids
        sessions_resp = (
            supabase.table("sessions")
            .select("*")
            .in_("session_id", session_ids)
            .execute()
        )
        return sessions_resp.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

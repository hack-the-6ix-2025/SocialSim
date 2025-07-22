from fastapi import APIRouter, HTTPException, Query
from utils.supabase_client import supabase
from typing import List, Literal
from uuid import UUID
from pydantic import BaseModel
import sys
import os
sys.path.append(os.path.join(
    os.path.dirname(os.path.__file__),
    "..", # router
    "..", # backend
    "..", # root
    "Scoring"
))
# from MockModel import MockModel

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
    
# AI feedback
from fastapi import UploadFile, File, Form
import tempfile

class FeedbackRequest(BaseModel):
    session_id: int

# @router.put("/generate-feedback/")
# async def generate_feedback(
#     session_id: int = Form(...),
#     video: UploadFile = File(...)
# ):
#     """
#     Accepts a video file and session_id, processes the video, generates feedback, and stores it in the database.
#     """
#     try:
#         # Save uploaded video to a temporary file
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
#             contents = await video.read()
#             tmp.write(contents)
#             tmp_path = tmp.name

#         # TODO: Extract features/embeddings from video (placeholder)
#         # For now, use dummy embedding
#         embedding = ['dummy embedding']

#         # Generate feedback using the model
#         model = MockModel()
#         feedback = model.predict(embedding)

#         # Store feedback in the database (sessions table, add 'feedback' column if not present)
#         update_resp = (
#             supabase.table("sessions")
#             .update({"feedback": feedback})
#             .eq("session_id", session_id)
#             .execute()
#         )

#         return {"session_id": session_id, "feedback": feedback, "db_response": update_resp.data}
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))
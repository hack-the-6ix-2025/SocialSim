from fastapi import APIRouter, HTTPException
from utils.supabase_client import supabase

router = APIRouter()

# for now, feedback is just one string which includes both +/- feedback

@router.post("/submit/")
def submit_feedback(session_id: int, feedback: str):
    try:
        response = (
            supabase.table("analytics")
            .insert({
                "session_id": session_id,
                "feedback": feedback
            })
            .execute()
        )
        if not response.data:
            return []
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/{sim_id}")
def view_session_feedback(session_id : int):
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
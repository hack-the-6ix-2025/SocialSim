from fastapi import APIRouter, HTTPException
from utils.supabase_client import supabase
from pydantic import BaseModel
from typing import List

router = APIRouter()

class ProfileCreate(BaseModel):
    user_id: str  # UUID from auth.users
    role: str
    field: str
    studyLevel: str
    interests: List[str]
    experience: str
    focusAreas: List[str]
    goals: List[str]
    studyLevel: str

@router.post("/create-user/")
def add_user_profile(profile: ProfileCreate):
    try:
        response = (
            supabase.table("profiles")
            .insert({
                "user_id": profile.user_id,
                "role": profile.role,
                "field": profile.field,
                "studyLevel": profile.studyLevel,
                "interests": profile.interests,
                "experience": profile.experience,
                "focusAreas": profile.focusAreas,
                "goals": profile.goals,
            })
            .execute()
        )
        if not response.data:
            return []
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.put("/update/{user_id}")
def update_user_profile(profile : ProfileCreate):
    try:
        response = (
            supabase.table("profiles")
            .update({
                "role": profile.role,
                "field": profile.field,
                "studyLevel": profile.studyLevel,
                "interests": profile.interests,
                "experience": profile.experience,
                "focusAreas": profile.focusAreas,
                "goals": profile.goals,
            })
            .eq("user_id", profile.user_id)
            .execute()
        )
        if not response.data:
            return []
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/delete/{user_id}")
def delete_user_profile(user_id):
    try:
        response = (
            supabase.table("profiles")
            .delete()
            .eq("user_id", user_id)
            .execute()
        )
        return {"deleted": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/{user_id}")
def get_user_profile(user_id : str):
    try:
        response = (
            supabase.table("profiles")
            .select("*")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not response.data:
            return {}
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
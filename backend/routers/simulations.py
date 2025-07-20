from fastapi import APIRouter, HTTPException, Depends, Query
from utils.supabase_client import supabase



router = APIRouter()

# View all simulations
@router.get("/")
def list_simulations():
    response = (
        supabase.table("simulations")
        .select("*")
        .execute()
    )
    if not response.data:
        return []
    return response.data

# View simulation details
@router.get("/{sim_id}")
def get_simulation(sim_id : int):
    try:
        response = (
            supabase.table("simulations")
            .select("*")
            .eq("sim_id", sim_id)  
            .single()
            .execute()
        )
        if not response.data:
            return []
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# Search simulations
# For now only works if the search text is like a substring of the description
@router.get("/search/")
def search_simulation_description(search_text: str = Query(...)):
    try:
        response = (
            supabase.table("simulations")
            .select("*")
            .ilike("description", f"%{search_text}%")
            .execute()
        )
        if not response.data:
            return []
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Filter simulations by category 
@router.get("/category/")
def filter_sessions_by_category(categories: list[str] = Query(...)):
    try:
        # Get sessions where the 'categories' text column matches any of the provided categories
        sessions_resp = (
            supabase.table("simulations")
            .select("*")
            .in_("category", categories)
            .execute()
        )
        return sessions_resp.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
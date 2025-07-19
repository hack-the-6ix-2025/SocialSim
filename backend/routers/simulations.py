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
# So far each simulation has one category, but you can filter by multiple categories
@router.get("/category/{category}")
def filter_simulations_by_category(categories: list[str] = Query(...)):
    try:
        response = (
            supabase.table("simulations")
            .select("*")
            .ov("categories", categories)
            .execute()
        )
        if not response.data:
            return []
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
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
@router.get("/simulations/category/")
def filter_simulations_by_category(categories: list[str] = Query(...)):
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

        # Get simulation_ids from simulation_categories for those category_ids
        simulation_ids_resp = (
            supabase.table("simulation_categories")
            .select("simulation_id")
            .in_("category_id", category_ids)
            .execute()
        )
        simulation_ids = list({s["simulation_id"] for s in simulation_ids_resp.data})

        if not simulation_ids:
            return []

        # Get simulations with those simulation_ids
        simulations_resp = (
            supabase.table("simulations")
            .select("*")
            .in_("sim_id", simulation_ids)
            .execute()
        )
        return simulations_resp.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
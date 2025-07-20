from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import simulations, sessions, analytics, profiles
from utils.supabase_client import supabase

app = FastAPI()

app.include_router(simulations.router, prefix="/simulations", tags=["simulations"])
app.include_router(profiles.router, prefix="/profiles", tags=["profiles"])
app.include_router(sessions.router, prefix="/sessions", tags=["sessions"]) 
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"]) 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] for all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def start():
    return {"hello"}
from fastapi import FastAPI
from routers import simulations, users, sessions, analytics
from utils.supabase_client import supabase

app = FastAPI()

app.include_router(simulations.router, prefix="/simulations", tags=["simulations"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(sessions.router, prefix="/sessions", tags=["sessions"]) 

@app.get("/")
def start():
    return {"hello"}
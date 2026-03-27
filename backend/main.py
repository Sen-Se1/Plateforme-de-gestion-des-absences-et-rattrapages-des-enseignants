from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# TODO: import routers once created
# from app.routers import users, ...

app = FastAPI(title="Gestion des Absences et Rattrapages des Enseignants")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(users.router)
# TODO: Include routers when ready

@app.get("/")
async def root():
    return {"message": "Welcome to the Gestion des Absences API"}

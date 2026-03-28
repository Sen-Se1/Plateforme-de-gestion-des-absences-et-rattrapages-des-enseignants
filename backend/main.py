from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import *
from app.core.database import Base, engine
from app.routers import auth, utilisateurs
# from app.routers import departements, groupes, matieres, salles, absences, rattrapages, emplois_du_temps, notifications, dashboard
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Gestion des Absences et Rattrapages des Enseignants",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(utilisateurs.router, prefix="/api/v1/users", tags=["users"])
# ... add other routers

@app.get("/")
async def root():
    return {"message": "Bienvenue dans l'API Gestion des Absences"}

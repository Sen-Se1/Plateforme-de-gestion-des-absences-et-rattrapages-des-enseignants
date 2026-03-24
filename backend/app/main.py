from fastapi import FastAPI
from app.core.config import settings
from app.api.routes import (
    auth,
    departements,
    matieres,
    salles,
    groupes,
    utilisateurs,
    seances,
    demandes_absence,
    propositions_rattrapage,
    seances_rattrapage,
    notifications,
)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
)

# Inclusion des routeurs
app.include_router(auth.router, prefix=f"{settings.API_PREFIX}/auth", tags=["Authentification"])
app.include_router(departements.router, prefix=f"{settings.API_PREFIX}/departements", tags=["Départements"])
app.include_router(matieres.router, prefix=f"{settings.API_PREFIX}/matieres", tags=["Matières"])
app.include_router(salles.router, prefix=f"{settings.API_PREFIX}/salles", tags=["Salles"])
app.include_router(groupes.router, prefix=f"{settings.API_PREFIX}/groupes", tags=["Groupes"])
app.include_router(utilisateurs.router, prefix=f"{settings.API_PREFIX}/utilisateurs", tags=["Utilisateurs"])
app.include_router(seances.router, prefix=f"{settings.API_PREFIX}/seances", tags=["Séances"])
app.include_router(demandes_absence.router, prefix=f"{settings.API_PREFIX}/demandes-absence", tags=["Demandes d'absence"])
app.include_router(propositions_rattrapage.router, prefix=f"{settings.API_PREFIX}/propositions-rattrapage", tags=["Propositions de rattrapage"])
app.include_router(seances_rattrapage.router, prefix=f"{settings.API_PREFIX}/seances-rattrapage", tags=["Séances de rattrapage"])
app.include_router(notifications.router, prefix=f"{settings.API_PREFIX}/notifications", tags=["Notifications"])

@app.get("/", tags=["Général"])
async def root():
    """
    Point d'entrée racine.
    """
    return {
        "message": f"Bienvenue sur l'API {settings.APP_NAME}",
        "documentation": "/docs"
    }

@app.get("/sante", tags=["Général"])
async def health_check():
    """
    Vérification de l'état de santé du service.
    """
    return {"status": "ok"}

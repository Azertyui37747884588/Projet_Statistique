from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import des routes (à jour selon ta structure)
from backend.routes import (
    data,
    prediction,
    resources,
    stats_tests,
    visualisations,
)

# Création de l'application FastAPI
app = FastAPI(
    title="TTK StatTestIA – API Backend",
    description="API d'analyse statistique, visualisation et prédiction du diabète.",
    version="1.0.0",
)

# Configuration CORS (pour Vercel et développement local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://localhost:5173",  # Vite dev
        "https://*.vercel.app",    # Vercel deployments
        "*",                        # Fallback (à restreindre en production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routes
app.include_router(data.router, prefix="/data", tags=["Données"])
app.include_router(prediction.router, prefix="/prediction", tags=["Prédiction"])
app.include_router(resources.router, prefix="/resources", tags=["Ressources"])
app.include_router(stats_tests.router, prefix="/stats", tags=["Tests statistiques"])
app.include_router(visualisations.router, prefix="/visualisation", tags=["Visualisation"])

# Page d'accueil (test rapide)
@app.get("/")
async def root():
    return {"message": "Bienvenue sur l'API backend de TTK StatTestIA 🚀"}

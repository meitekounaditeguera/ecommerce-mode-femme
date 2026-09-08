from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, avis, categorie, commande, couleur, paiement, produit, taille
from fastapi.staticfiles import StaticFiles

app = FastAPI(title=settings.PROJECT_NAME)

# CORS : autorise le frontend React (Vite tourne par défaut sur le port 5173)
# à appeler cette API depuis le navigateur.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categorie.router)
app.include_router(produit.router)
app.include_router(taille.router)
app.include_router(auth.router)
app.include_router(commande.router)
app.include_router(paiement.router)
app.include_router(avis.router)
app.include_router(couleur.router)
app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/")
def health_check():
    return {"status": "ok", "message": "API e-commerce opérationnelle"}
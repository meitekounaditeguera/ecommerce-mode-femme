from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import creer_token_acces, hasher_mot_de_passe, verifier_mot_de_passe
from app.models import Utilisateur
from app.schemas.utilisateur import Token, UtilisateurCreate, UtilisateurOut
from app.core.security import get_utilisateur_courant

router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.post("/register", response_model=UtilisateurOut, status_code=201)
def inscription(utilisateur: UtilisateurCreate, db: Session = Depends(get_db)):
    existe_deja = db.query(Utilisateur).filter(Utilisateur.email == utilisateur.email).first()
    if existe_deja:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    nouveau = Utilisateur(
        email=utilisateur.email,
        password_hash=hasher_mot_de_passe(utilisateur.mot_de_passe),
    )
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)
    return nouveau


@router.post("/login", response_model=Token)
def connexion(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    utilisateur = db.query(Utilisateur).filter(Utilisateur.email == form_data.username).first()
    if not utilisateur or not verifier_mot_de_passe(form_data.password, utilisateur.password_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    token = creer_token_acces(utilisateur.id)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/moi", response_model=UtilisateurOut)
def qui_suis_je(utilisateur_courant: Utilisateur = Depends(get_utilisateur_courant)):
    return utilisateur_courant
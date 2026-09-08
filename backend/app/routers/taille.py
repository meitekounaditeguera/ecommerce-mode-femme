from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import Utilisateur
from app.core.security import get_admin_courant

from app.core.database import get_db
from app.models import Taille
from app.schemas.taille import TailleCreate, TailleOut

router = APIRouter(prefix="/tailles", tags=["Tailles"])


@router.post("/", response_model=TailleOut, status_code=201)
def creer_taille(
    taille: TailleCreate,
     db: Session = Depends(get_db),
     admin: Utilisateur = Depends(get_admin_courant),
     ):
    nouvelle = Taille(nom=taille.nom)
    db.add(nouvelle)
    db.commit()
    db.refresh(nouvelle)
    return nouvelle


@router.get("/", response_model=list[TailleOut])
def lister_tailles(db: Session = Depends(get_db)):
    return db.query(Taille).all()
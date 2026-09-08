from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_admin_courant
from app.models import Couleur, Utilisateur
from app.schemas.couleur import CouleurCreate, CouleurOut

router = APIRouter(prefix="/couleurs", tags=["Couleurs"])


@router.post("/", response_model=CouleurOut, status_code=201)
def creer_couleur(
    couleur: CouleurCreate,
    db: Session = Depends(get_db),
    admin: Utilisateur = Depends(get_admin_courant),
):
    nouvelle = Couleur(nom=couleur.nom)
    db.add(nouvelle)
    db.commit()
    db.refresh(nouvelle)
    return nouvelle


@router.get("/", response_model=list[CouleurOut])
def lister_couleurs(db: Session = Depends(get_db)):
    return db.query(Couleur).all()
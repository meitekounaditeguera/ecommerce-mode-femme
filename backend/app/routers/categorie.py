from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import Utilisateur
from app.core.security import get_admin_courant

from app.core.database import get_db
from app.models import Categorie
from app.schemas.categorie import CategorieCreate, CategorieOut

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.post("/", response_model=CategorieOut, status_code=201)
def creer_categorie(
    categorie: CategorieCreate, 
    db: Session = Depends(get_db),
    admin: Utilisateur = Depends(get_admin_courant),
    ):
    nouvelle = Categorie(nom=categorie.nom, slug=categorie.slug)
    db.add(nouvelle)
    db.commit()
    db.refresh(nouvelle)  # récupère l'id généré par la base après insertion
    return nouvelle


@router.get("/", response_model=list[CategorieOut])
def lister_categories(db: Session = Depends(get_db)):
    return db.query(Categorie).all()


@router.get("/{categorie_id}", response_model=CategorieOut)
def obtenir_categorie(categorie_id: int, db: Session = Depends(get_db)):
    categorie = db.query(Categorie).filter(Categorie.id == categorie_id).first()
    if categorie is None:
        raise HTTPException(status_code=404, detail="Categorie introuvable")
    return categorie


@router.delete("/{categorie_id}", status_code=204)
def supprimer_categorie(
    categorie_id: int, 
    db: Session = Depends(get_db),
    admin: Utilisateur = Depends(get_admin_courant),
    ):
    categorie = db.query(Categorie).filter(Categorie.id == categorie_id).first()
    if categorie is None:
        raise HTTPException(status_code=404, detail="Categorie introuvable")
    db.delete(categorie)
    db.commit()
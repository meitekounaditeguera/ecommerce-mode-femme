from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_utilisateur_courant
from app.models import Avis, Commande, Utilisateur
from app.schemas.avis import AvisCreate, AvisOut

router = APIRouter(prefix="/avis", tags=["Avis"])


@router.post("/", response_model=AvisOut, status_code=201)
def creer_avis(
    donnees: AvisCreate,
    db: Session = Depends(get_db),
    utilisateur_courant: Utilisateur = Depends(get_utilisateur_courant),
):
    commande = db.query(Commande).filter(Commande.id == donnees.commande_id).first()
    if commande is None:
        raise HTTPException(status_code=404, detail="Commande introuvable")

    # Condition 1 : la commande appartient à l'utilisateur connecté
    if commande.utilisateur_id != utilisateur_courant.id:
        raise HTTPException(status_code=403, detail="Cette commande ne vous appartient pas")

    # Condition 3 : la commande doit être payée
    if commande.statut != "payee":
        raise HTTPException(
            status_code=409,
            detail="Vous ne pouvez noter un produit que sur une commande payée",
        )

    # Condition 2 : le produit doit faire partie des lignes de cette commande
    produit_present = any(
    ligne.produit_variante.produit_id == donnees.produit_id for ligne in commande.lignes

    )
    if not produit_present:
        raise HTTPException(
            status_code=400,
            detail="Ce produit ne fait pas partie de cette commande",
        )

    nouvel_avis = Avis(
        produit_id=donnees.produit_id,
        utilisateur_id=utilisateur_courant.id,
        commande_id=donnees.commande_id,
        note=donnees.note,
        commentaire=donnees.commentaire,
    )
    db.add(nouvel_avis)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Vous avez déjà noté ce produit pour cette commande",
        )
    db.refresh(nouvel_avis)
    return nouvel_avis


@router.get("/produit/{produit_id}", response_model=list[AvisOut])
def avis_du_produit(produit_id: int, db: Session = Depends(get_db)):
    return db.query(Avis).filter(Avis.produit_id == produit_id).all()
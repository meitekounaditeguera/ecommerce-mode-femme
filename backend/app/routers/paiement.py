import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_utilisateur_courant
from app.models import Commande, Paiement, Utilisateur
from app.schemas.paiement import PaiementCreate, PaiementOut

router = APIRouter(prefix="/commandes", tags=["Paiements"])


@router.post("/{commande_id}/paiement", response_model=PaiementOut, status_code=201)
def payer_commande(
    commande_id: int,
    donnees: PaiementCreate,
    db: Session = Depends(get_db),
    utilisateur_courant: Utilisateur = Depends(get_utilisateur_courant),
):
    commande = db.query(Commande).filter(Commande.id == commande_id).first()
    if commande is None:
        raise HTTPException(status_code=404, detail="Commande introuvable")

    if commande.utilisateur_id != utilisateur_courant.id:
        raise HTTPException(status_code=403, detail="Cette commande ne vous appartient pas")

    if commande.statut != "en_attente":
        raise HTTPException(
            status_code=409,
            detail=f"Cette commande est déjà au statut '{commande.statut}', paiement impossible",
        )

    try:
        if donnees.forcer_echec:
            paiement = Paiement(
                commande_id=commande.id,
                statut="echoue",
                methode=donnees.methode,
                reference_simulee=None,
            )
            commande.statut = "annulee"
            # Restitution du stock : la commande ne se fera pas, le stock redevient disponible
            for ligne in commande.lignes:
                ligne.produit_taille.stock += ligne.quantite
        else:
            paiement = Paiement(
                commande_id=commande.id,
                statut="reussi",
                methode=donnees.methode,
                reference_simulee=str(uuid.uuid4()),
            )
            commande.statut = "payee"

        db.add(paiement)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Un paiement existe déjà pour cette commande")

    db.refresh(paiement)
    return paiement
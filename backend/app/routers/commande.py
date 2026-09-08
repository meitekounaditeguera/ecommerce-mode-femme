from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_utilisateur_courant
from app.models import Commande, LigneCommande, ProduitVariante, Utilisateur
from app.schemas.commande import CommandeCreate, CommandeOut

router = APIRouter(prefix="/commandes", tags=["Commandes"])


@router.post("/", response_model=CommandeOut, status_code=201)
def creer_commande(
    donnees: CommandeCreate,
    db: Session = Depends(get_db),
    utilisateur_courant: Utilisateur = Depends(get_utilisateur_courant),
):
    if not donnees.lignes:
        raise HTTPException(status_code=400, detail="Le panier est vide")

    # Étape 1 : vérifier existence + stock AVANT de toucher à quoi que ce soit
    variantes = {}
    for ligne in donnees.lignes:
        variante = db.query(ProduitVariante).filter(
            ProduitVariante.id == ligne.produit_variante_id
        ).first()
        if variante is None:
            raise HTTPException(
                status_code=404,
                detail=f"Variante produit_variante_id={ligne.produit_variante_id} introuvable",
            )
        if variante.stock < ligne.quantite:
            raise HTTPException(
                status_code=409,
                detail=f"Stock insuffisant pour {variante.produit.nom} ({variante.couleur.nom}, {variante.taille.nom}) : "
                       f"{variante.stock} disponible(s), {ligne.quantite} demandé(s)",
            )
        variantes[ligne.produit_variante_id] = variante

    # Étape 2 : tout créer dans UNE SEULE transaction
    try:
        total = sum(
            variantes[l.produit_variante_id].produit.prix * l.quantite
            for l in donnees.lignes
        )
        commande = Commande(utilisateur_id=utilisateur_courant.id, total=total, statut="en_attente")
        db.add(commande)
        db.flush()  # attribue un id à `commande` sans encore commit

        for ligne in donnees.lignes:
            variante = variantes[ligne.produit_variante_id]
            db.add(LigneCommande(
                commande_id=commande.id,
                produit_variante_id=ligne.produit_variante_id,
                quantite=ligne.quantite,
                prix_unitaire=variante.produit.prix,
            ))
            variante.stock -= ligne.quantite  # décrément du stock

        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Erreur lors de la création de la commande")

    db.refresh(commande)
    return commande


@router.get("/mes-commandes", response_model=list[CommandeOut])
def mes_commandes(
    db: Session = Depends(get_db),
    utilisateur_courant: Utilisateur = Depends(get_utilisateur_courant),
):
    return db.query(Commande).filter(Commande.utilisateur_id == utilisateur_courant.id).all()
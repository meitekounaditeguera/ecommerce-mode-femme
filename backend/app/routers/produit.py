from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Produit
from app.schemas.produit import ProduitCreate, ProduitOut
from app.models import Produit, ProduitVariante, ImageProduit, Utilisateur
from app.schemas.produit_variante import ProduitVarianteCreate, ProduitVarianteOut
from app.schemas.image_produit import ImageProduitCreate, ImageProduitOut
from app.schemas.produit import ProduitUpdate
from app.core.security import get_admin_courant

router = APIRouter(prefix="/produits", tags=["Produits"])


@router.post("/", response_model=ProduitOut, status_code=201)
def creer_produit(
    produit: ProduitCreate,
    db: Session = Depends(get_db),
    admin: Utilisateur = Depends(get_admin_courant),
):
    if not admin:
        raise HTTPException(status_code=403, detail="Accès refusé")
    nouveau = Produit(**produit.model_dump())
    db.add(nouveau)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="categorie_id invalide : cette catégorie n'existe pas",
        )
    db.refresh(nouveau)
    return nouveau


@router.get("/", response_model=list[ProduitOut])
def lister_produits(db: Session = Depends(get_db)):
    return db.query(Produit).filter(Produit.actif == True).all()


@router.get("/{produit_id}", response_model=ProduitOut)
def obtenir_produit(produit_id: int, db: Session = Depends(get_db)):
    produit = db.query(Produit).filter(
        Produit.id == produit_id, Produit.actif == True
    ).first()
    if produit is None:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    return produit


@router.delete("/{produit_id}", status_code=204)
def supprimer_produit(
    produit_id: int,
    db: Session = Depends(get_db),
    admin: Utilisateur = Depends(get_admin_courant),
    ):
    produit = db.query(Produit).filter(Produit.id == produit_id).first()
    if produit is None:
        raise HTTPException(status_code=404, detail="Produit introuvable")

    produit.actif = False
    db.commit()
@router.post("/{produit_id}/variantes", response_model=ProduitVarianteOut, status_code=201)
def ajouter_variante(
    produit_id: int,
    variante: ProduitVarianteCreate,
    db: Session = Depends(get_db),
    admin: Utilisateur = Depends(get_admin_courant),
):
    produit = db.query(Produit).filter(Produit.id == produit_id).first()
    if produit is None:
        raise HTTPException(status_code=404, detail="Produit introuvable")

    nouvelle = ProduitVariante(
        produit_id=produit_id,
        couleur_id=variante.couleur_id,
        taille_id=variante.taille_id,
        stock=variante.stock,
    )
    db.add(nouvelle)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Cette combinaison couleur+taille existe déjà pour ce produit, ou référence invalide",
        )
    db.refresh(nouvelle)
    return nouvelle

@router.post("/{produit_id}/images", response_model=ImageProduitOut, status_code=201)
def ajouter_image(
    produit_id: int, 
    image: ImageProduitCreate,
    db: Session = Depends(get_db),
    admin: Utilisateur = Depends(get_admin_courant),
    ):
    produit = db.query(Produit).filter(Produit.id == produit_id).first()
    if produit is None:
        raise HTTPException(status_code=404, detail="Produit introuvable")

    nouvelle = ImageProduit(produit_id=produit_id, **image.model_dump())
    db.add(nouvelle)
    db.commit()
    db.refresh(nouvelle)
    return nouvelle


@router.patch("/{produit_id}", response_model=ProduitOut)
def modifier_produit(
    produit_id: int,
    donnees: ProduitUpdate,
    db: Session = Depends(get_db),
    admin: Utilisateur = Depends(get_admin_courant),
):
    produit = db.query(Produit).filter(Produit.id == produit_id).first()
    if produit is None:
        raise HTTPException(status_code=404, detail="Produit introuvable")

    for champ, valeur in donnees.model_dump(exclude_unset=True).items():
        setattr(produit, champ, valeur)

    db.commit()
    db.refresh(produit)
    return produit
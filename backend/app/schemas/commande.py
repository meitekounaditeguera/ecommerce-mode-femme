from decimal import Decimal
from pydantic import BaseModel

from app.schemas.produit_variante import ProduitVarianteOut


class LigneCommandeCreate(BaseModel):
    produit_variante_id: int
    quantite: int


class CommandeCreate(BaseModel):
    lignes: list[LigneCommandeCreate]


class LigneCommandeOut(BaseModel):
    id: int
    quantite: int
    prix_unitaire: Decimal
    produit_variante: ProduitVarianteOut

    class Config:
        from_attributes = True


class CommandeOut(BaseModel):
    id: int
    statut: str
    total: Decimal
    lignes: list[LigneCommandeOut]

    class Config:
        from_attributes = True
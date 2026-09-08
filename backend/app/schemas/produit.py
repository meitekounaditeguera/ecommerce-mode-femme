from decimal import Decimal
from pydantic import BaseModel

from app.schemas.categorie import CategorieOut
from app.schemas.produit_variante import ProduitVarianteOut
from app.schemas.image_produit import ImageProduitOut


class ProduitBase(BaseModel):
    nom: str
    description: str | None = None
    prix: Decimal
    categorie_id: int


class ProduitCreate(ProduitBase):
    pass


class ProduitOut(ProduitBase):
    id: int
    actif: bool
    categorie: CategorieOut
    variantes: list[ProduitVarianteOut] = []
    images: list[ImageProduitOut] = []

    class Config:
        from_attributes = True

class ProduitUpdate(BaseModel):
    nom: str | None = None
    description: str | None = None
    prix: Decimal | None = None
    categorie_id: int | None = None        
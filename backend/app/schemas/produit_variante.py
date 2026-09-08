from pydantic import BaseModel

from app.schemas.taille import TailleOut
from app.schemas.couleur import CouleurOut


class ProduitVarianteCreate(BaseModel):
    couleur_id: int
    taille_id: int
    stock: int


class ProduitResume(BaseModel):
    id: int
    nom: str

    class Config:
        from_attributes = True


class ProduitVarianteOut(BaseModel):
    id: int
    couleur: CouleurOut
    taille: TailleOut
    stock: int
    produit: ProduitResume
    image_url: str | None = None

    class Config:
        from_attributes = True
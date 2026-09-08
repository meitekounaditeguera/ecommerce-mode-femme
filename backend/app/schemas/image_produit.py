from pydantic import BaseModel

from app.schemas.couleur import CouleurOut


class ImageProduitCreate(BaseModel):
    url: str
    couleur_id: int | None = None
    ordre: int = 0
    est_principale: bool = False


class ImageProduitOut(BaseModel):
    id: int
    url: str
    couleur: CouleurOut | None = None
    ordre: int
    est_principale: bool

    class Config:
        from_attributes = True
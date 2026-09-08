from pydantic import BaseModel, Field


class AvisCreate(BaseModel):
    produit_id: int
    commande_id: int
    note: int = Field(ge=1, le=5)  # borne la note entre 1 et 5
    commentaire: str | None = None


class AvisOut(BaseModel):
    id: int
    note: int
    commentaire: str | None

    class Config:
        from_attributes = True
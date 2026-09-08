from pydantic import BaseModel


class CategorieBase(BaseModel):
    """Champs communs, partagés entre création et lecture."""
    nom: str
    slug: str


class CategorieCreate(CategorieBase):
    """Ce que le client envoie pour CRÉER une catégorie (POST)."""
    pass


class CategorieOut(CategorieBase):
    """Ce que l'API RENVOIE au client (GET) — inclut l'id généré par la base."""
    id: int

    class Config:
        from_attributes = True  # autorise Pydantic à lire un objet SQLAlchemy directement
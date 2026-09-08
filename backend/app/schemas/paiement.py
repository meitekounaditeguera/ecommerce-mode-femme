from pydantic import BaseModel


class PaiementCreate(BaseModel):
    """Ce que le client envoie pour tenter de payer une commande."""
    methode: str = "carte_simulee"
    forcer_echec: bool = False  # utile pour tester volontairement l'échec


class PaiementOut(BaseModel):
    id: int
    statut: str
    methode: str
    reference_simulee: str | None

    class Config:
        from_attributes = True
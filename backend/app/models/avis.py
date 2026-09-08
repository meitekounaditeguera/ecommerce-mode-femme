from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Avis(Base):
    __tablename__ = "avis"

    id = Column(Integer, primary_key=True, index=True)
    note = Column(Integer, nullable=False)  # de 1 à 5
    commentaire = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    produit_id = Column(Integer, ForeignKey("produits.id"), nullable=False)
    utilisateur_id = Column(Integer, ForeignKey("utilisateurs.id"), nullable=False)
    commande_id = Column(Integer, ForeignKey("commandes.id"), nullable=False)

    produit = relationship("Produit", back_populates="avis")
    utilisateur = relationship("Utilisateur", back_populates="avis")
    commande = relationship("Commande", back_populates="avis")

    __table_args__ = (
        UniqueConstraint("produit_id", "utilisateur_id", "commande_id", name="uq_avis_produit_user_commande"),
    )
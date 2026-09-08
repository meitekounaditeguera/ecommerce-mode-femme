from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Paiement(Base):
    __tablename__ = "paiements"

    id = Column(Integer, primary_key=True, index=True)
    statut = Column(String, nullable=False, default="en_attente")
    # valeurs possibles : en_attente / reussi / echoue / rembourse
    methode = Column(String, nullable=False, default="carte_simulee")
    reference_simulee = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # unique=True : garantit UNE commande = UN SEUL paiement (relation 1-vers-1)
    commande_id = Column(Integer, ForeignKey("commandes.id"), unique=True, nullable=False)

    commande = relationship("Commande", back_populates="paiement")
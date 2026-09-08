from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Commande(Base):
    __tablename__ = "commandes"

    id = Column(Integer, primary_key=True, index=True)
    statut = Column(String, nullable=False, default="en_attente")
    # valeurs possibles : en_attente / payee / expediee / annulee
    total = Column(Numeric(10, 2), nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Une commande appartient à UN utilisateur -> FK ici, dans le "fils"
    utilisateur_id = Column(Integer, ForeignKey("utilisateurs.id"), nullable=False)

    utilisateur = relationship("Utilisateur", back_populates="commandes")
    lignes = relationship("LigneCommande", back_populates="commande")
    avis = relationship("Avis", back_populates="commande")
    # uselist=False : une commande n'a qu'UN SEUL paiement (relation 1-vers-1)
    paiement = relationship("Paiement", back_populates="commande", uselist=False)
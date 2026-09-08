from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="client", nullable=False)  # "client" ou "admin"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationship() : pas une vraie colonne SQL, c'est un raccourci Python
    # qui permet d'écrire "utilisateur.commandes" pour récupérer
    # automatiquement toutes ses commandes liées (jointure faite par SQLAlchemy).
    commandes = relationship("Commande", back_populates="utilisateur")
    avis = relationship("Avis", back_populates="utilisateur")
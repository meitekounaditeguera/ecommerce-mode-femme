from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Couleur(Base):
    __tablename__ = "couleurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, unique=True, nullable=False)  # "Rouge", "Bleu marine"...

    variantes = relationship("ProduitVariante", back_populates="couleur")
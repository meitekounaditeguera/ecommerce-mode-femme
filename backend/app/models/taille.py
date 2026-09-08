from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Taille(Base):
    __tablename__ = "tailles"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, unique=True, nullable=False)  # "S", "M", "L", "XL", "XXL", "XXXL", "4XL"

    variantes = relationship("ProduitVariante", back_populates="taille")
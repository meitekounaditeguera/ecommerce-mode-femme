from sqlalchemy import Column, Integer, String, Numeric, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Produit(Base):
    __tablename__ = "produits"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    prix = Column(Numeric(10, 2), nullable=False)  # 10 chiffres au total, 2 après la virgule
    actif = Column(Boolean, nullable=False, default=True) # Indique si le produit est actif
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # LA vraie contrainte SQL d'intégrité référentielle
    categorie_id = Column(Integer, ForeignKey("categories.id"), nullable=False)

    categorie = relationship("Categorie", back_populates="produits")
    avis = relationship("Avis", back_populates="produit")
    variantes = relationship("ProduitVariante", back_populates="produit")
    images = relationship("ImageProduit", back_populates="produit")
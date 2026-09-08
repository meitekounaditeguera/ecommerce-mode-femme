from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class ImageProduit(Base):
    __tablename__ = "images_produit"

    id = Column(Integer, primary_key=True, index=True)
    produit_id = Column(Integer, ForeignKey("produits.id"), nullable=False)
    couleur_id = Column(Integer, ForeignKey("couleurs.id"), nullable=True)  # NULL = photo générale
    url = Column(String, nullable=False)
    ordre = Column(Integer, nullable=False, default=0)
    est_principale = Column(Boolean, nullable=False, default=False)

    produit = relationship("Produit", back_populates="images")
    couleur = relationship("Couleur")
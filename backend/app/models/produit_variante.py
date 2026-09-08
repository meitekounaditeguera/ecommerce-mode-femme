from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class ProduitVariante(Base):
    __tablename__ = "produits_variantes"

    id = Column(Integer, primary_key=True, index=True)
    produit_id = Column(Integer, ForeignKey("produits.id"), nullable=False)
    couleur_id = Column(Integer, ForeignKey("couleurs.id"), nullable=False)
    taille_id = Column(Integer, ForeignKey("tailles.id"), nullable=False)
    stock = Column(Integer, nullable=False, default=0)

    __table_args__ = (
        UniqueConstraint("produit_id", "couleur_id", "taille_id", name="uq_produit_couleur_taille"),
    )

    produit = relationship("Produit", back_populates="variantes")
    couleur = relationship("Couleur", back_populates="variantes")
    taille = relationship("Taille", back_populates="variantes")
    lignes_commande = relationship("LigneCommande", back_populates="produit_variante")
    

    @property
    def image_url(self) -> str | None:
        """Renvoie l'image du produit correspondant à la couleur de cette variante."""
        if not self.produit:
            return None
        images_couleur = [img for img in self.produit.images if img.couleur_id == self.couleur_id]
        if not images_couleur:
            images_couleur = [img for img in self.produit.images if img.couleur_id is None]
        if not images_couleur:
            return None
        principale = next((img for img in images_couleur if img.est_principale), images_couleur[0])
        return principale.url
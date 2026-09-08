from sqlalchemy import Column, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class LigneCommande(Base):
    __tablename__ = "lignes_commande"

    id = Column(Integer, primary_key=True, index=True)
    quantite = Column(Integer, nullable=False)
    # Prix figé au moment de l'achat (le prix du produit peut changer après !)
    prix_unitaire = Column(Numeric(10, 2), nullable=False)

    # Une ligne appartient à UNE commande, et référence UN produit
    commande_id = Column(Integer, ForeignKey("commandes.id"), nullable=False)
    produit_variante_id = Column(Integer, ForeignKey("produits_variantes.id"), nullable=False)

    commande = relationship("Commande", back_populates="lignes")
    produit_variante = relationship("ProduitVariante", back_populates="lignes_commande")
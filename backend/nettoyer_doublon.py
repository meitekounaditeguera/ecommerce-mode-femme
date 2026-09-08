from app.core.database import SessionLocal
from app.models import Produit, ProduitVariante, ImageProduit

db = SessionLocal()

# Supprime d'abord les enfants (contrainte FK), puis le produit lui-même
db.query(ImageProduit).filter(ImageProduit.produit_id == 4).delete()
db.query(ProduitVariante).filter(ProduitVariante.produit_id == 4).delete()
db.query(Produit).filter(Produit.id == 4).delete()

db.commit()
print("Produit id=4 (doublon) supprimé définitivement")
db.close()
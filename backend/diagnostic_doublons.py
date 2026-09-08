from app.core.database import SessionLocal
from app.models import Produit, ImageProduit

db = SessionLocal()

produits = db.query(Produit).filter(Produit.nom == "Robe volantée col nœud").all()

print(f"Nombre de fiches trouvées : {len(produits)}")
for p in produits:
    nb_images = db.query(ImageProduit).filter(ImageProduit.produit_id == p.id).count()
    print(f" - id={p.id} | actif={p.actif} | images={nb_images}")

db.close()
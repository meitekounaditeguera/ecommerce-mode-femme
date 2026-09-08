from app.core.database import SessionLocal
from app.models import Produit, ProduitVariante

db = SessionLocal()
p = db.query(Produit).filter(Produit.id == 4).first()
nb_variantes = db.query(ProduitVariante).filter(ProduitVariante.produit_id == 4).count()
print(f"id=4 : categorie_id={p.categorie_id}, prix={p.prix}, variantes={nb_variantes}")
db.close()
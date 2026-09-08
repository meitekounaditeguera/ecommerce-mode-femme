from app.core.database import SessionLocal
from app.models import Produit, Categorie

db = SessionLocal()

accessoires = db.query(Categorie).filter(Categorie.nom == "Accessoires").first()

if accessoires is None:
    print("Catégorie 'Accessoires' introuvable")
else:
    print(f"Catégorie 'Accessoires' : id={accessoires.id}")
    produits_lies = db.query(Produit).filter(Produit.categorie_id == accessoires.id).all()
    print(f"\n{len(produits_lies)} produit(s) encore lié(s) :")
    for p in produits_lies:
        print(f"  - id={p.id} | nom='{p.nom}' | actif={p.actif}")

db.close()
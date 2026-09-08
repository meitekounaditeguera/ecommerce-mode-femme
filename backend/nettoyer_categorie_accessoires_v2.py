from app.core.database import SessionLocal
from app.models import Produit, Categorie

db = SessionLocal()

accessoires = db.query(Categorie).filter(Categorie.nom == "Accessoires").first()

if accessoires:
    produits_lies = db.query(Produit).filter(Produit.categorie_id == accessoires.id).all()
    for p in produits_lies:
        p.categorie_id = 3  # Robes courtes, peu importe puisqu'ils sont inactifs
        print(f"Recatégorisé : id={p.id} '{p.nom}'")
    db.commit()

    db.delete(accessoires)
    db.commit()
    print("Catégorie 'Accessoires' supprimée")
else:
    print("Catégorie 'Accessoires' déjà supprimée")

db.close()
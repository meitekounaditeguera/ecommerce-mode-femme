from app.core.database import SessionLocal
from app.models import Produit, Categorie

db = SessionLocal()

# Retrouve "Robe fleurie" même désactivée (pas de filtre actif=True ici)
produit = db.query(Produit).filter(Produit.nom == "Robe fleurie").first()

if produit is None:
    print("Produit introuvable")
else:
    print(f"Trouvé : id={produit.id}, categorie_id actuel={produit.categorie_id}")
    # Réaffecte vers "Robes courtes" (id=3), pour libérer "Accessoires"
    produit.categorie_id = 3
    db.commit()
    print("Recatégorisé vers Robes courtes")

# Supprime la catégorie Accessoires, maintenant qu'elle n'est plus référencée
accessoires = db.query(Categorie).filter(Categorie.nom == "Accessoires").first()
if accessoires:
    db.delete(accessoires)
    db.commit()
    print("Catégorie 'Accessoires' supprimée")
else:
    print("Catégorie 'Accessoires' introuvable (déjà supprimée ?)")

db.close()
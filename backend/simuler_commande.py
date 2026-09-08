from app.core.database import SessionLocal
from app.models import Utilisateur, Commande, LigneCommande

db = SessionLocal()

# Un utilisateur factice pour la démo
utilisateur = Utilisateur(email="test@example.com", password_hash="fake_hash")
db.add(utilisateur)
db.commit()
db.refresh(utilisateur)

# Une commande factice
commande = Commande(utilisateur_id=utilisateur.id, total=25000)
db.add(commande)
db.commit()
db.refresh(commande)

# La ligne qui référence ton produit (mets le bon id ici !)
PRODUIT_ID = 1  # <-- remplace par l'id réel de "Casque Bluetooth"
ligne = LigneCommande(commande_id=commande.id, produit_id=PRODUIT_ID, quantite=1, prix_unitaire=25000)
db.add(ligne)
db.commit()

print(f"Commande {commande.id} créée, référence produit_id={PRODUIT_ID}")
db.close()
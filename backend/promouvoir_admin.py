from app.core.database import SessionLocal
from app.models import Utilisateur

db = SessionLocal()
utilisateur = db.query(Utilisateur).filter(Utilisateur.email == "kounadi@test.com").first()
utilisateur.role = "admin"
db.commit()
print(f"{utilisateur.email} est maintenant {utilisateur.role}")
db.close()
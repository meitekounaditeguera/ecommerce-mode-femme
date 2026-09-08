from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

# check_same_thread=False : nécessaire car FastAPI peut utiliser des threads
# différents de celui qui a ouvert la connexion (contrairement à un script
# séquentiel classique).
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
)


@event.listens_for(engine, "connect")
def _appliquer_pragmas_sqlite(dbapi_connection, connection_record):
    """
    Rappel de la démo qu'on a faite :
    - foreign_keys : désactivé par défaut, DOIT être réactivé à CHAQUE connexion
    - journal_mode WAL : améliore la concurrence lecture/écriture

    Cet event listener s'exécute automatiquement à chaque fois que SQLAlchemy
    ouvre une nouvelle connexion physique vers le fichier .db.
    """
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base dont hériteront tous les modèles SQLAlchemy (models/*.py)
Base = declarative_base()


def get_db():
    """
    Dépendance FastAPI : ouvre une session par requête HTTP,
    la ferme systématiquement après (même en cas d'erreur).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
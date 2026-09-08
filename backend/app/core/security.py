from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Utilisateur


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def hasher_mot_de_passe(mot_de_passe: str) -> str:
    """Transforme un mot de passe en clair en hash bcrypt (à sens unique)."""
    return pwd_context.hash(mot_de_passe)


def verifier_mot_de_passe(mot_de_passe: str, mot_de_passe_hash: str) -> bool:
    """Vérifie qu'un mot de passe en clair correspond au hash stocké."""
    return pwd_context.verify(mot_de_passe, mot_de_passe_hash)


def creer_token_acces(utilisateur_id: int) -> str:
    """Génère un JWT contenant l'id utilisateur, signé, avec expiration."""
    expiration = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": str(utilisateur_id), "exp": expiration}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decoder_token(token: str) -> int | None:
    """Vérifie la signature et l'expiration du token, renvoie l'id utilisateur ou None."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return int(payload.get("sub"))
    except JWTError:
        return None



def get_utilisateur_courant(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Utilisateur:
    """
    Dépendance à utiliser sur toute route qui doit être protégée.
    Lit le token envoyé par le client, le décode, retrouve l'utilisateur en base.
    """
    erreur_auth = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les identifiants",
        headers={"WWW-Authenticate": "Bearer"},
    )

    utilisateur_id = decoder_token(token)
    if utilisateur_id is None:
        raise erreur_auth

    utilisateur = db.query(Utilisateur).filter(Utilisateur.id == utilisateur_id).first()
    if utilisateur is None:
        raise erreur_auth

    return utilisateur

def get_admin_courant(utilisateur_courant: Utilisateur = Depends(get_utilisateur_courant)) -> Utilisateur:
    """
    Dépendance à utiliser sur toute route réservée aux admins.
    Réutilise get_utilisateur_courant, puis vérifie le rôle en plus.
    """
    if utilisateur_courant.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs",
        )
    return utilisateur_courant
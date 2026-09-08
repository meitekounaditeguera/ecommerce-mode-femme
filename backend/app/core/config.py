from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Configuration centralisée de l'application.
    Les valeurs peuvent être surchargées via un fichier .env
    (ex: DATABASE_URL=sqlite:///./autre_nom.db)
    """

    PROJECT_NAME: str = "E-commerce API"
    DATABASE_URL: str = "sqlite:///./app.db"

    # Sécurité JWT
    SECRET_KEY: str = "change-moi-en-production-avec-une-vraie-cle-secrete"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24h

    class Config:
        env_file = ".env"


settings = Settings()
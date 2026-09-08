from pydantic import BaseModel, EmailStr


class UtilisateurCreate(BaseModel):
    email: EmailStr
    mot_de_passe: str


class UtilisateurOut(BaseModel):
    id: int
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
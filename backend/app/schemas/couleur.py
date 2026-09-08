from pydantic import BaseModel


class CouleurBase(BaseModel):
    nom: str


class CouleurCreate(CouleurBase):
    pass


class CouleurOut(CouleurBase):
    id: int

    class Config:
        from_attributes = True
from pydantic import BaseModel


class TailleBase(BaseModel):
    nom: str  # "S", "M", "L", "XL", "XXL", "XXXL"


class TailleCreate(TailleBase):
    pass


class TailleOut(TailleBase):
    id: int

    class Config:
        from_attributes = True
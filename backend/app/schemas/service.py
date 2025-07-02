from pydantic import BaseModel

class ServiceBase(BaseModel):
    name: str
    duration_min: int
    description: str

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: str | None = None
    duration_min: int | None = None
    description: str | None = None

class ServiceInDB(ServiceBase):
    id: int

    class Config:
        from_attributes = True

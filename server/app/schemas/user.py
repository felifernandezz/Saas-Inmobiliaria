from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    full_name: str | None = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    full_name: str | None = None

    class Config:
        from_attributes = True
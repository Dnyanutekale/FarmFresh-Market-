from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=150)
    phone: str | None = None
    role: str = "customer"  # customer, farmer, admin

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    # Optional farmer fields upon registration
    farm_name: str | None = None
    farm_location: str | None = None
    bio: str | None = None

class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    farm_name: str | None = None
    farm_location: str | None = None
    bio: str | None = None
    avatar_url: str | None = None

class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    is_verified_farmer: bool
    farm_name: str | None = None
    farm_location: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    created_at: datetime

class FarmerProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    farm_name: str | None = None
    farm_location: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    is_verified_farmer: bool
    created_at: datetime
    product_count: int = 0

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    email: str | None = None
    user_id: int | None = None
    role: str | None = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

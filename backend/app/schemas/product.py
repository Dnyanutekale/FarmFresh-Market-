from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import FarmerProfileOut

class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    category: str = Field(..., description="Vegetables, Fruits, Dry Fruits, Dry Products")
    description: str | None = None
    price_per_unit: float = Field(..., gt=0)
    unit: str = "kg"  # kg, 500g, 250g, bunch, box, piece, dozen
    stock_quantity: float = Field(default=0.0, ge=0)
    image_url: str | None = None
    harvest_date: date | None = None
    is_organic: bool = False
    is_featured: bool = False
    is_available: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    description: str | None = None
    price_per_unit: float | None = Field(default=None, gt=0)
    unit: str | None = None
    stock_quantity: float | None = Field(default=None, ge=0)
    image_url: str | None = None
    harvest_date: date | None = None
    is_organic: bool | None = None
    is_featured: bool | None = None
    is_available: bool | None = None

class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farmer_id: int
    rating: float
    review_count: int
    created_at: datetime
    updated_at: datetime
    farmer: FarmerProfileOut | None = None

class ProductFilterParams(BaseModel):
    search: str | None = None
    category: str | None = None
    min_price: float | None = None
    max_price: float | None = None
    location: str | None = None
    is_organic: bool | None = None
    is_featured: bool | None = None
    farmer_id: int | None = None
    sort_by: str | None = "newest"  # newest, price_asc, price_desc, rating

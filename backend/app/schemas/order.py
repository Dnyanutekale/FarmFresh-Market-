from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: float = Field(..., gt=0)

class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    product_id: int
    farmer_id: int
    product_name: str
    product_image: str | None = None
    unit_price: float
    unit: str
    quantity: float
    subtotal: float
    status: str

class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    shipping_name: str = Field(..., min_length=2)
    shipping_phone: str = Field(..., min_length=7)
    shipping_address: str = Field(..., min_length=5)
    shipping_city: str = Field(..., min_length=2)
    shipping_postal_code: str = Field(..., min_length=3)
    order_notes: str | None = None
    payment_method: str = "cod"  # cod, razorpay_mock, stripe_mock

class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    customer_id: int
    total_amount: float
    discount_amount: float
    shipping_amount: float
    final_amount: float
    status: str
    payment_method: str
    payment_status: str
    transaction_id: str | None = None
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    shipping_postal_code: str
    order_notes: str | None = None
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemOut]

class OrderStatusUpdate(BaseModel):
    status: str  # pending, confirmed, packed, dispatched, delivered, cancelled

class FarmerOrderItemUpdate(BaseModel):
    status: str  # pending, confirmed, packed, dispatched, delivered

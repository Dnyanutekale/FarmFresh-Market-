from datetime import datetime, date
from sqlalchemy import String, Boolean, DateTime, Date, Text, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    farmer_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    name: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    # Categories: "Vegetables", "Fruits", "Dry Fruits", "Dry Products"
    category: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Pricing & Inventory (Price in ₹)
    price_per_unit: Mapped[float] = mapped_column(Float, nullable=False)
    # Unit types: "kg", "500g", "250g", "bunch", "box", "piece", "dozen"
    unit: Mapped[str] = mapped_column(String(30), default="kg", nullable=False)
    stock_quantity: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    
    # Produce metadata
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    harvest_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_organic: Mapped[bool] = mapped_column(Boolean, default=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    
    rating: Mapped[float] = mapped_column(Float, default=5.0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer: Mapped["User"] = relationship("User", back_populates="products")
    order_items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="product")

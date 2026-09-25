from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    role: Mapped[str] = mapped_column(String(20), default="customer")  # customer, farmer, admin
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Farmer specific attributes
    is_verified_farmer: Mapped[bool] = mapped_column(Boolean, default=False)
    farm_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    farm_location: Mapped[str | None] = mapped_column(String(200), nullable=True)  # e.g., "Nashik, Maharashtra"
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    products: Mapped[list["Product"]] = relationship("Product", back_populates="farmer", cascade="all, delete-orphan")
    orders: Mapped[list["Order"]] = relationship("Order", back_populates="customer")

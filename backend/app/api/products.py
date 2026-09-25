import os
import shutil
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductOut
from app.config import settings

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=list[ProductOut])
async def get_products(
    search: str | None = Query(None, description="Search term for name or description"),
    category: str | None = Query(None, description="Filter by category"),
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    location: str | None = Query(None, description="Filter by farm location"),
    is_organic: bool | None = Query(None),
    is_featured: bool | None = Query(None),
    farmer_id: int | None = Query(None),
    sort_by: str | None = Query("newest", pattern="^(newest|price_asc|price_desc|rating)$"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Product)
        .options(selectinload(Product.farmer))
        .join(User, Product.farmer_id == User.id)
        .where(Product.is_available == True)
    )

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.where(
            or_(
                Product.name.ilike(search_fmt),
                Product.description.ilike(search_fmt),
                Product.category.ilike(search_fmt),
                User.farm_name.ilike(search_fmt),
                User.farm_location.ilike(search_fmt)
            )
        )
    
    if category and category.lower() != "all":
        query = query.where(Product.category.ilike(category))

    if min_price is not None:
        query = query.where(Product.price_per_unit >= min_price)

    if max_price is not None:
        query = query.where(Product.price_per_unit <= max_price)

    if location:
        query = query.where(User.farm_location.ilike(f"%{location}%"))

    if is_organic is not None:
        query = query.where(Product.is_organic == is_organic)

    if is_featured is not None:
        query = query.where(Product.is_featured == is_featured)

    if farmer_id is not None:
        query = query.where(Product.farmer_id == farmer_id)

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Product.price_per_unit.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price_per_unit.desc())
    elif sort_by == "rating":
        query = query.order_by(Product.rating.desc(), Product.review_count.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    products = result.scalars().all()
    return products

@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Return categories with their active product counts"""
    result = await db.execute(
        select(Product.category, func.count(Product.id))
        .where(Product.is_available == True)
        .group_by(Product.category)
    )
    categories = [{"name": cat, "count": count} for cat, count in result.all()]
    return categories

@router.get("/featured", response_model=list[ProductOut])
async def get_featured_products(
    limit: int = 8,
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Product)
        .options(selectinload(Product.farmer))
        .where(and_(Product.is_available == True, Product.is_featured == True))
        .order_by(Product.rating.desc(), Product.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.farmer))
        .where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload a product image locally and return the access URL"""
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid image file format. Only JPEG, PNG, WEBP allowed.")
    
    extension = Path(file.filename).suffix or ".jpg"
    filename = f"{uuid.uuid4().hex}{extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"image_url": f"/uploads/{filename}", "filename": filename}

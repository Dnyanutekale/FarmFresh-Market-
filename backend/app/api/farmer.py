from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from app.schemas.order import OrderItemOut, FarmerOrderItemUpdate
from app.api.deps import require_farmer

router = APIRouter(prefix="/farmer", tags=["Farmer Dashboard"])

@router.get("/dashboard")
async def get_farmer_dashboard_stats(
    current_farmer: User = Depends(require_farmer),
    db: AsyncSession = Depends(get_db)
):
    # Total products count
    p_count_res = await db.execute(
        select(func.count(Product.id)).where(Product.farmer_id == current_farmer.id)
    )
    total_products = p_count_res.scalar() or 0

    # Total orders received for this farmer's products
    orders_res = await db.execute(
        select(OrderItem).where(OrderItem.farmer_id == current_farmer.id)
    )
    order_items = orders_res.scalars().all()
    total_orders = len(order_items)
    
    # Total revenue earned
    total_revenue = sum(item.subtotal for item in order_items if item.status != "cancelled")
    
    # Pending fulfillment count
    pending_count = sum(1 for item in order_items if item.status in ["pending", "confirmed", "packed"])

    return {
        "farmer_name": current_farmer.full_name,
        "farm_name": current_farmer.farm_name,
        "farm_location": current_farmer.farm_location,
        "is_verified": current_farmer.is_verified_farmer,
        "total_revenue": round(total_revenue, 2),
        "total_products": total_products,
        "total_orders": total_orders,
        "pending_fulfillments": pending_count
    }

@router.get("/products", response_model=list[ProductOut])
async def get_farmer_products(
    current_farmer: User = Depends(require_farmer),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Product)
        .options(selectinload(Product.farmer))
        .where(Product.farmer_id == current_farmer.id)
        .order_by(Product.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    current_farmer: User = Depends(require_farmer),
    db: AsyncSession = Depends(get_db)
):
    product = Product(
        farmer_id=current_farmer.id,
        name=product_in.name,
        category=product_in.category,
        description=product_in.description,
        price_per_unit=product_in.price_per_unit,
        unit=product_in.unit,
        stock_quantity=product_in.stock_quantity,
        image_url=product_in.image_url,
        harvest_date=product_in.harvest_date,
        is_organic=product_in.is_organic,
        is_featured=product_in.is_featured,
        is_available=product_in.is_available and (product_in.stock_quantity > 0)
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    
    # Reload with farmer
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.farmer))
        .where(Product.id == product.id)
    )
    return result.scalar_one()

@router.put("/products/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    current_farmer: User = Depends(require_farmer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.farmer))
        .where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if current_farmer.role != "admin" and product.farmer_id != current_farmer.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this product")

    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    if product.stock_quantity <= 0:
        product.is_available = False

    await db.commit()
    # Re-query with eager loading to avoid MissingGreenlet
    result2 = await db.execute(
        select(Product)
        .options(selectinload(Product.farmer))
        .where(Product.id == product.id)
    )
    return result2.scalar_one()

@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    current_farmer: User = Depends(require_farmer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if current_farmer.role != "admin" and product.farmer_id != current_farmer.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")

    await db.delete(product)
    await db.commit()
    return None

@router.get("/orders", response_model=list[dict])
async def get_farmer_orders(
    current_farmer: User = Depends(require_farmer),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all order items associated with this farmer alongside overall order details"""
    query = (
        select(OrderItem, Order)
        .join(Order, OrderItem.order_id == Order.id)
        .where(OrderItem.farmer_id == current_farmer.id)
        .order_by(Order.created_at.desc())
    )
    result = await db.execute(query)
    rows = result.all()

    orders_data = []
    for item, order in rows:
        orders_data.append({
            "item_id": item.id,
            "order_id": order.id,
            "order_number": order.order_number,
            "created_at": order.created_at,
            "product_name": item.product_name,
            "product_image": item.product_image,
            "quantity": item.quantity,
            "unit": item.unit,
            "unit_price": item.unit_price,
            "subtotal": item.subtotal,
            "fulfillment_status": item.status,
            "customer_name": order.shipping_name,
            "customer_phone": order.shipping_phone,
            "shipping_address": f"{order.shipping_address}, {order.shipping_city} - {order.shipping_postal_code}",
            "payment_method": order.payment_method,
            "payment_status": order.payment_status
        })

    return orders_data

@router.patch("/orders/{item_id}/status", response_model=dict)
async def update_item_status(
    item_id: int,
    status_update: FarmerOrderItemUpdate,
    current_farmer: User = Depends(require_farmer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(OrderItem).where(OrderItem.id == item_id))
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")

    if current_farmer.role != "admin" and item.farmer_id != current_farmer.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this order item")

    valid_statuses = ["pending", "confirmed", "packed", "dispatched", "delivered"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")

    item.status = status_update.status

    # Check if all items in parent order are delivered or dispatched
    order_res = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == item.order_id)
    )
    order = order_res.scalar_one()
    all_statuses = [i.status for i in order.items]
    if all(s == "delivered" for s in all_statuses):
        order.status = "delivered"
    elif all(s in ["dispatched", "delivered"] for s in all_statuses):
        order.status = "dispatched"
    elif any(s in ["packed", "confirmed"] for s in all_statuses):
        order.status = "confirmed"

    await db.commit()
    return {"message": "Status updated successfully", "item_id": item.id, "status": item.status, "order_status": order.status}

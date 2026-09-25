import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, OrderOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")
    
    order_number = f"FFM-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    
    total_amount = 0.0
    order_items_to_create = []

    for item in order_in.items:
        product_res = await db.execute(select(Product).where(Product.id == item.product_id))
        product = product_res.scalar_one_or_none()
        
        if not product or not product.is_available:
            raise HTTPException(status_code=400, detail=f"Product ID {item.product_id} is no longer available")
        
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.stock_quantity} {product.unit}"
            )
        
        item_subtotal = round(product.price_per_unit * item.quantity, 2)
        total_amount += item_subtotal
        
        # Deduct stock
        product.stock_quantity -= item.quantity
        if product.stock_quantity <= 0:
            product.is_available = False
            
        order_item = OrderItem(
            product_id=product.id,
            farmer_id=product.farmer_id,
            product_name=product.name,
            product_image=product.image_url,
            unit_price=product.price_per_unit,
            unit=product.unit,
            quantity=item.quantity,
            subtotal=item_subtotal,
            status="pending"
        )
        order_items_to_create.append(order_item)

    # Free delivery on orders over ₹500, else flat ₹40
    shipping_amount = 0.0 if total_amount >= 500 else 40.0
    discount_amount = 0.0
    final_amount = round(total_amount + shipping_amount - discount_amount, 2)

    order = Order(
        order_number=order_number,
        customer_id=current_user.id,
        total_amount=round(total_amount, 2),
        discount_amount=discount_amount,
        shipping_amount=shipping_amount,
        final_amount=final_amount,
        status="pending",
        payment_method=order_in.payment_method,
        payment_status="completed" if order_in.payment_method in ["razorpay_mock", "stripe_mock"] else "pending",
        shipping_name=order_in.shipping_name,
        shipping_phone=order_in.shipping_phone,
        shipping_address=order_in.shipping_address,
        shipping_city=order_in.shipping_city,
        shipping_postal_code=order_in.shipping_postal_code,
        order_notes=order_in.order_notes,
        items=order_items_to_create
    )

    db.add(order)
    await db.commit()

    # Reload order with items
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order.id)
    )
    return result.scalar_one()

@router.get("", response_model=list[OrderOut])
async def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.customer_id == current_user.id)
        .order_by(Order.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{order_id}", response_model=OrderOut)
async def get_order_by_id(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id)
    )
    result = await db.execute(query)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if current_user.role != "admin" and order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")

    return order

@router.patch("/{order_id}/cancel", response_model=OrderOut)
async def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if current_user.role != "admin" and order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this order")

    if order.status in ["dispatched", "delivered"]:
        raise HTTPException(status_code=400, detail="Cannot cancel an order that is already dispatched or delivered")

    order.status = "cancelled"
    
    # Restore stock
    for item in order.items:
        p_res = await db.execute(select(Product).where(Product.id == item.product_id))
        p = p_res.scalar_one_or_none()
        if p:
            p.stock_quantity += item.quantity
            p.is_available = True
            
    await db.commit()
    # Re-query with eager loading to avoid MissingGreenlet
    result2 = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order.id)
    )
    return result2.scalar_one()

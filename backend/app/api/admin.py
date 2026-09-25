from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.schemas.order import OrderOut, OrderStatusUpdate
from app.schemas.user import UserOut
from app.api.deps import require_admin

router = APIRouter(prefix="/admin", tags=["Admin Panel"])

@router.get("/dashboard")
async def get_admin_dashboard_metrics(
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    total_users_res = await db.execute(select(func.count(User.id)))
    total_users = total_users_res.scalar() or 0

    farmers_count_res = await db.execute(select(func.count(User.id)).where(User.role == "farmer"))
    farmers_count = farmers_count_res.scalar() or 0

    customers_count_res = await db.execute(select(func.count(User.id)).where(User.role == "customer"))
    customers_count = customers_count_res.scalar() or 0

    products_count_res = await db.execute(select(func.count(Product.id)))
    products_count = products_count_res.scalar() or 0

    orders_count_res = await db.execute(select(func.count(Order.id)))
    orders_count = orders_count_res.scalar() or 0

    revenue_res = await db.execute(
        select(func.sum(Order.final_amount)).where(Order.status != "cancelled")
    )
    total_revenue = revenue_res.scalar() or 0.0

    return {
        "total_users": total_users,
        "farmers_count": farmers_count,
        "customers_count": customers_count,
        "products_count": products_count,
        "orders_count": orders_count,
        "total_revenue": round(total_revenue, 2)
    }

@router.get("/farmers", response_model=list[UserOut])
async def list_farmers_admin(
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.role == "farmer").order_by(User.created_at.desc()))
    return result.scalars().all()

@router.patch("/farmers/{farmer_id}/verify", response_model=UserOut)
async def toggle_farmer_verification(
    farmer_id: int,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == farmer_id, User.role == "farmer"))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    farmer.is_verified_farmer = not farmer.is_verified_farmer
    await db.commit()
    await db.refresh(farmer)
    return farmer

@router.get("/orders", response_model=list[OrderOut])
async def list_all_orders(
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()

@router.patch("/orders/{order_id}/status", response_model=OrderOut)
async def update_order_status_admin(
    order_id: int,
    status_update: OrderStatusUpdate,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status_update.status
    if status_update.status == "delivered":
        order.payment_status = "completed"
        for item in order.items:
            item.status = "delivered"

    await db.commit()
    # Re-query with eager loading to avoid MissingGreenlet
    result2 = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order.id)
    )
    return result2.scalar_one()

from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.products import router as products_router
from app.api.orders import router as orders_router
from app.api.farmer import router as farmer_router
from app.api.admin import router as admin_router
from app.api.payment import router as payment_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(products_router)
api_router.include_router(orders_router)
api_router.include_router(farmer_router)
api_router.include_router(admin_router)
api_router.include_router(payment_router)

__all__ = ["api_router"]

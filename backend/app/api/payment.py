import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.order import Order
from app.schemas.payment import MockPaymentInitiateRequest, MockPaymentVerifyRequest, MockPaymentResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/payment", tags=["Payment Integration (Sandbox)"])

@router.post("/initiate", response_model=MockPaymentResponse)
async def initiate_payment(
    request: MockPaymentInitiateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Order).where(Order.id == request.order_id))
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.customer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    transaction_id = f"mock_tx_{request.gateway}_{uuid.uuid4().hex[:12]}"
    
    return MockPaymentResponse(
        success=True,
        order_id=order.id,
        transaction_id=transaction_id,
        message=f"Mock {request.gateway.capitalize()} test session initiated successfully",
        client_secret=f"test_sec_{uuid.uuid4().hex}"
    )

@router.post("/verify", response_model=MockPaymentResponse)
async def verify_payment(
    request: MockPaymentVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Order).where(Order.id == request.order_id))
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.customer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    if request.status == "success":
        order.payment_status = "completed"
        order.payment_method = f"{request.gateway}_mock"
        order.transaction_id = request.transaction_id
        order.status = "confirmed"
        await db.commit()
        await db.refresh(order)
        
        return MockPaymentResponse(
            success=True,
            order_id=order.id,
            transaction_id=request.transaction_id,
            message="Payment simulated successfully and order marked as confirmed"
        )
    else:
        order.payment_status = "failed"
        await db.commit()
        raise HTTPException(status_code=400, detail="Payment simulation marked as failed")

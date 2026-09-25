from pydantic import BaseModel

class MockPaymentInitiateRequest(BaseModel):
    order_id: int
    gateway: str = "razorpay"  # razorpay or stripe
    amount: float

class MockPaymentVerifyRequest(BaseModel):
    order_id: int
    gateway: str
    transaction_id: str
    status: str = "success"  # success or failed

class MockPaymentResponse(BaseModel):
    success: bool
    order_id: int
    transaction_id: str
    message: str
    client_secret: str | None = None

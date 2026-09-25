from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.schemas.user import UserCreate, UserOut, UserUpdate, Token, LoginRequest, FarmerProfileOut
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    existing = await db.execute(select(User).where(User.email == user_in.email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )
    
    # Auto-verify farmers in dev/portfolio mode so user can test immediately
    is_verified = True if user_in.role == "farmer" else False
    
    new_user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=user_in.role,
        is_active=True,
        is_verified_farmer=is_verified,
        farm_name=user_in.farm_name,
        farm_location=user_in.farm_location,
        bio=user_in.bio,
        avatar_url=f"https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop" if user_in.role == "farmer" else None
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    token = create_access_token(subject=new_user.id, role=new_user.role)
    return Token(access_token=token, user=UserOut.model_validate(new_user))

@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email.lower()))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is deactivated")
        
    token = create_access_token(subject=user.id, role=user.role)
    return Token(access_token=token, user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
        
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.get("/farmers", response_model=list[FarmerProfileOut])
async def list_farmers(db: AsyncSession = Depends(get_db)):
    """List farmers for the 'Meet Our Farmers' section"""
    result = await db.execute(select(User).where(User.role == "farmer", User.is_active == True))
    farmers = result.scalars().all()
    
    farmer_list = []
    for f in farmers:
        p_count_res = await db.execute(
            select(func.count(Product.id)).where(Product.farmer_id == f.id, Product.is_available == True)
        )
        count = p_count_res.scalar() or 0
        farmer_data = FarmerProfileOut(
            id=f.id,
            full_name=f.full_name,
            farm_name=f.farm_name,
            farm_location=f.farm_location,
            bio=f.bio,
            avatar_url=f.avatar_url,
            is_verified_farmer=f.is_verified_farmer,
            created_at=f.created_at,
            product_count=count
        )
        farmer_list.append(farmer_data)
        
    return farmer_list

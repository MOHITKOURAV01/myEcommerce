"""
Authentication routes for user registration and login.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database
from datetime import timedelta
from app.config.database import get_db
from app.config.settings import settings
from app.models.schemas import UserCreate, UserLogin, UserResponse, Token, MessageResponse
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.helpers import serialize_doc

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: Database = Depends(get_db)):
    """
    Register a new user.
    
    Args:
        user: User registration data
        db: Database instance
        
    Returns:
        Created user data
        
    Raises:
        HTTPException: If email already exists
    """
    # Check if user already exists
    existing_user = db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = hash_password(user.password)
    
    # Create user document
    from datetime import datetime
    user_doc = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "role": user.role,
        "created_at": datetime.utcnow()
    }
    
    # Insert user
    result = db.users.insert_one(user_doc)
    
    # Get created user
    created_user = db.users.find_one({"_id": result.inserted_id})
    
    return serialize_doc(created_user)


@router.post("/login", response_model=Token)
async def login_user(user_credentials: UserLogin, db: Database = Depends(get_db)):
    """
    Login user and return JWT token.
    
    Args:
        user_credentials: User login credentials
        db: Database instance
        
    Returns:
        JWT access token
        
    Raises:
        HTTPException: If credentials are invalid
    """
    # Find user by email
    user = db.users.find_one({"email": user_credentials.email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

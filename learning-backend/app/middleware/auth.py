"""
Authentication middleware and dependencies.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo.database import Database
from typing import Optional
from app.config.database import get_db
from app.utils.security import decode_access_token
from app.models.schemas import TokenData

# Security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Database = Depends(get_db)
) -> dict:
    """
    Dependency to get current authenticated user.
    
    Args:
        credentials: HTTP Bearer token
        db: Database instance
        
    Returns:
        User document from database
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode token
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    # Get user from database
    user = db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_active_user(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Dependency to get current active user.
    Can be extended to check if user is active/verified.
    
    Args:
        current_user: Current user from get_current_user
        
    Returns:
        User document
    """
    return current_user


async def require_admin(
    current_user: dict = Depends(get_current_active_user)
) -> dict:
    """
    Dependency to require admin role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User document if admin
        
    Raises:
        HTTPException: If user is not admin
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


async def require_user(
    current_user: dict = Depends(get_current_active_user)
) -> dict:
    """
    Dependency to require user role (non-admin).
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User document if regular user
        
    Raises:
        HTTPException: If user is admin
    """
    if current_user.get("role") != "user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User access required"
        )
    return current_user

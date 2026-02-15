"""
User routes for profile management.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database
from app.config.database import get_db
from app.models.schemas import UserResponse
from app.middleware.auth import get_current_active_user
from app.utils.helpers import serialize_doc

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=UserResponse)
async def get_user_profile(current_user: dict = Depends(get_current_active_user)):
    """
    Get current user's profile.
    Protected route - requires authentication.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User profile data
    """
    # Remove password from response
    user_data = serialize_doc(current_user)
    user_data.pop("password", None)
    
    return user_data

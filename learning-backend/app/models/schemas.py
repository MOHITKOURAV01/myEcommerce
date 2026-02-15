"""
Pydantic models for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic."""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    
    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


# ==================== User Models ====================

class UserBase(BaseModel):
    """Base user model."""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr


class UserCreate(UserBase):
    """User creation model."""
    password: str = Field(..., min_length=6, max_length=100)
    role: Optional[str] = "user"
    
    @validator("role")
    def validate_role(cls, v):
        if v not in ["user", "admin"]:
            raise ValueError("Role must be either 'user' or 'admin'")
        return v


class UserLogin(BaseModel):
    """User login model."""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """User response model."""
    id: str = Field(alias="_id")
    role: str
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data."""
    email: Optional[str] = None
    role: Optional[str] = None


# ==================== Product Models ====================

class ProductBase(BaseModel):
    """Base product model."""
    name: str = Field(..., min_length=2, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    price: float = Field(..., gt=0)
    stock: int = Field(..., ge=0)
    category: str = Field(..., min_length=2, max_length=100)


class ProductCreate(ProductBase):
    """Product creation model."""
    pass


class ProductUpdate(BaseModel):
    """Product update model - all fields optional."""
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    category: Optional[str] = Field(None, min_length=2, max_length=100)


class ProductResponse(ProductBase):
    """Product response model."""
    id: str = Field(alias="_id")
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# ==================== Order Models ====================

class OrderProduct(BaseModel):
    """Product in an order."""
    product_id: str
    quantity: int = Field(..., gt=0)


class OrderBase(BaseModel):
    """Base order model."""
    products: List[OrderProduct] = Field(..., min_items=1)


class OrderCreate(OrderBase):
    """Order creation model."""
    pass


class OrderResponse(BaseModel):
    """Order response model."""
    id: str = Field(alias="_id")
    user_id: str
    products: List[OrderProduct]
    total_amount: float
    status: str
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class OrderUpdate(BaseModel):
    """Order update model - for admin to update status."""
    status: str
    
    @validator("status")
    def validate_status(cls, v):
        if v not in ["pending", "shipped", "delivered", "cancelled"]:
            raise ValueError("Status must be one of: pending, shipped, delivered, cancelled")
        return v


# ==================== Response Models ====================

class MessageResponse(BaseModel):
    """Generic message response."""
    message: str


class ErrorResponse(BaseModel):
    """Error response model."""
    detail: str

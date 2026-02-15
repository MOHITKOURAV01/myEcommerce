"""
Product routes for CRUD operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database
from bson import ObjectId
from typing import List
from datetime import datetime
from app.config.database import get_db
from app.models.schemas import ProductCreate, ProductUpdate, ProductResponse, MessageResponse
from app.middleware.auth import require_admin, get_current_active_user
from app.utils.helpers import serialize_doc, validate_object_id

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    db: Database = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """
    Create a new product.
    Admin only.
    
    Args:
        product: Product data
        db: Database instance
        current_user: Current admin user
        
    Returns:
        Created product data
    """
    # Create product document
    product_doc = {
        **product.model_dump(),
        "created_at": datetime.utcnow()
    }
    
    # Insert product
    result = db.products.insert_one(product_doc)
    
    # Get created product
    created_product = db.products.find_one({"_id": result.inserted_id})
    
    return serialize_doc(created_product)


@router.get("", response_model=List[ProductResponse])
async def get_all_products(
    db: Database = Depends(get_db),
    category: str = None,
    skip: int = 0,
    limit: int = 100
):
    """
    Get all products with optional filtering and pagination.
    Public route - no authentication required.
    
    Args:
        db: Database instance
        category: Optional category filter
        skip: Number of products to skip
        limit: Maximum number of products to return
        
    Returns:
        List of products
    """
    # Build query
    query = {}
    if category:
        query["category"] = category
    
    # Get products
    products = list(db.products.find(query).skip(skip).limit(limit))
    
    return [serialize_doc(product) for product in products]


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product_by_id(product_id: str, db: Database = Depends(get_db)):
    """
    Get a single product by ID.
    Public route - no authentication required.
    
    Args:
        product_id: Product ID
        db: Database instance
        
    Returns:
        Product data
        
    Raises:
        HTTPException: If product not found or invalid ID
    """
    # Validate ObjectId
    if not validate_object_id(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID format"
        )
    
    # Get product
    product = db.products.find_one({"_id": ObjectId(product_id)})
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return serialize_doc(product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    db: Database = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """
    Update a product.
    Admin only.
    
    Args:
        product_id: Product ID
        product_update: Product update data
        db: Database instance
        current_user: Current admin user
        
    Returns:
        Updated product data
        
    Raises:
        HTTPException: If product not found or invalid ID
    """
    # Validate ObjectId
    if not validate_object_id(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID format"
        )
    
    # Get update data (exclude None values)
    update_data = product_update.model_dump(exclude_none=True)
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No update data provided"
        )
    
    # Update product
    result = db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Get updated product
    updated_product = db.products.find_one({"_id": ObjectId(product_id)})
    
    return serialize_doc(updated_product)


@router.delete("/{product_id}", response_model=MessageResponse)
async def delete_product(
    product_id: str,
    db: Database = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """
    Delete a product.
    Admin only.
    
    Args:
        product_id: Product ID
        db: Database instance
        current_user: Current admin user
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If product not found or invalid ID
    """
    # Validate ObjectId
    if not validate_object_id(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID format"
        )
    
    # Delete product
    result = db.products.delete_one({"_id": ObjectId(product_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return {"message": "Product deleted successfully"}

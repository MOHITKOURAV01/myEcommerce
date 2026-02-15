"""
Order routes for order management.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database
from bson import ObjectId
from typing import List
from datetime import datetime
from app.config.database import get_db
from app.models.schemas import OrderCreate, OrderResponse, OrderUpdate, MessageResponse
from app.middleware.auth import get_current_active_user, require_admin
from app.utils.helpers import serialize_doc, validate_object_id

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order: OrderCreate,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Create a new order.
    User only - authenticated users can create orders.
    
    Args:
        order: Order data
        db: Database instance
        current_user: Current authenticated user
        
    Returns:
        Created order data
        
    Raises:
        HTTPException: If product not found or insufficient stock
    """
    # Only regular users can create orders (not admins)
    if current_user.get("role") != "user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only regular users can create orders"
        )
    
    total_amount = 0.0
    order_products = []
    
    # Validate products and calculate total
    for item in order.products:
        # Validate product ID
        if not validate_object_id(item.product_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid product ID: {item.product_id}"
            )
        
        # Get product
        product = db.products.find_one({"_id": ObjectId(item.product_id)})
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product not found: {item.product_id}"
            )
        
        # Check stock
        if product["stock"] < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product: {product['name']}"
            )
        
        # Calculate amount
        item_total = product["price"] * item.quantity
        total_amount += item_total
        
        # Update stock
        db.products.update_one(
            {"_id": ObjectId(item.product_id)},
            {"$inc": {"stock": -item.quantity}}
        )
        
        order_products.append({
            "product_id": item.product_id,
            "quantity": item.quantity
        })
    
    # Create order document
    order_doc = {
        "user_id": str(current_user["_id"]),
        "products": order_products,
        "total_amount": round(total_amount, 2),
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    
    # Insert order
    result = db.orders.insert_one(order_doc)
    
    # Get created order
    created_order = db.orders.find_one({"_id": result.inserted_id})
    
    return serialize_doc(created_order)


@router.get("", response_model=List[OrderResponse])
async def get_orders(
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
    status_filter: str = None,
    skip: int = 0,
    limit: int = 100
):
    """
    Get orders.
    - Regular users see only their own orders
    - Admins see all orders
    
    Args:
        db: Database instance
        current_user: Current authenticated user
        status_filter: Optional status filter
        skip: Number of orders to skip
        limit: Maximum number of orders to return
        
    Returns:
        List of orders
    """
    # Build query
    query = {}
    
    # If user is not admin, only show their orders
    if current_user.get("role") != "admin":
        query["user_id"] = str(current_user["_id"])
    
    # Add status filter if provided
    if status_filter:
        query["status"] = status_filter
    
    # Get orders
    orders = list(db.orders.find(query).skip(skip).limit(limit).sort("created_at", -1))
    
    return [serialize_doc(order) for order in orders]


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_by_id(
    order_id: str,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get a single order by ID.
    Users can only view their own orders, admins can view any order.
    
    Args:
        order_id: Order ID
        db: Database instance
        current_user: Current authenticated user
        
    Returns:
        Order data
        
    Raises:
        HTTPException: If order not found or unauthorized
    """
    # Validate ObjectId
    if not validate_object_id(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID format"
        )
    
    # Get order
    order = db.orders.find_one({"_id": ObjectId(order_id)})
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check authorization
    if current_user.get("role") != "admin" and order["user_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    return serialize_doc(order)


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    order_update: OrderUpdate,
    db: Database = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """
    Update order status.
    Admin only.
    
    Args:
        order_id: Order ID
        order_update: Order update data (status)
        db: Database instance
        current_user: Current admin user
        
    Returns:
        Updated order data
        
    Raises:
        HTTPException: If order not found or invalid ID
    """
    # Validate ObjectId
    if not validate_object_id(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID format"
        )
    
    # Update order
    result = db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": order_update.status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Get updated order
    updated_order = db.orders.find_one({"_id": ObjectId(order_id)})
    
    return serialize_doc(updated_order)

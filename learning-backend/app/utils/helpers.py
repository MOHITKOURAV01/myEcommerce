"""
Helper utilities for common operations.
"""
from bson import ObjectId
from typing import Any, Dict


def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Serialize MongoDB document for JSON response.
    Converts ObjectId to string.
    
    Args:
        doc: MongoDB document
        
    Returns:
        Serialized document
    """
    if doc is None:
        return None
    
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc["_id"] = str(doc["_id"])
    
    # Handle nested ObjectIds in products list (for orders)
    if "products" in doc and isinstance(doc["products"], list):
        for product in doc["products"]:
            if "product_id" in product and isinstance(product["product_id"], ObjectId):
                product["product_id"] = str(product["product_id"])
    
    # Handle user_id in orders
    if "user_id" in doc and isinstance(doc["user_id"], ObjectId):
        doc["user_id"] = str(doc["user_id"])
    
    return doc


def validate_object_id(id_str: str) -> bool:
    """
    Validate if a string is a valid MongoDB ObjectId.
    
    Args:
        id_str: String to validate
        
    Returns:
        True if valid ObjectId, False otherwise
    """
    return ObjectId.is_valid(id_str)

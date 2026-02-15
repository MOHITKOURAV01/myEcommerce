"""
MongoDB database connection and configuration.
"""
import certifi
from pymongo import MongoClient
from pymongo.database import Database
from app.config.settings import settings

ca = certifi.where()


class MongoDB:
    """MongoDB connection manager."""
    
    client: MongoClient = None
    database: Database = None
    
    @classmethod
    def connect_db(cls):
        """Establish connection to MongoDB Atlas."""
        try:
            cls.client = MongoClient(settings.MONGODB_URL, tlsCAFile=ca)
            cls.database = cls.client[settings.DATABASE_NAME]
            
            # Test the connection
            cls.client.admin.command('ping')
            print(f"Connected to MongoDB Atlas - Database: {settings.DATABASE_NAME}")
            
            # Create indexes for better performance
            cls._create_indexes()
            
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            raise
    
    @classmethod
    def _create_indexes(cls):
        """Create database indexes for better query performance."""
        try:
            # Users collection indexes
            cls.database.users.create_index("email", unique=True)
            
            # Products collection indexes
            cls.database.products.create_index("category")
            cls.database.products.create_index("name")
            
            # Orders collection indexes
            cls.database.orders.create_index("user_id")
            cls.database.orders.create_index("status")
            
            print("Database indexes created successfully")
        except Exception as e:
            print(f"Warning: Error creating indexes: {e}")
    
    @classmethod
    def close_db(cls):
        """Close MongoDB connection."""
        if cls.client:
            cls.client.close()
            print("MongoDB connection closed")
    
    @classmethod
    def get_database(cls) -> Database:
        """Get database instance."""
        if cls.database is None:
            cls.connect_db()
        return cls.database


# Create database instance
def get_db() -> Database:
    """Dependency to get database instance."""
    return MongoDB.get_database()

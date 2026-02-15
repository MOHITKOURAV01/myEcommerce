"""
Main entry point for the FastAPI application.
Configures middleware, routes, and database lifecycle events.
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.config.database import MongoDB
from app.routes import auth, users, products, orders

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-ready E-commerce Backend API using FastAPI and MongoDB Atlas",
    debug=settings.DEBUG
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_db_client():
    """Execute on application startup."""
    MongoDB.connect_db()


@app.on_event("shutdown")
async def shutdown_db_client():
    """Execute on application shutdown."""
    MongoDB.close_db()


# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(orders.router)


@app.get("/", tags=["Root"])
async def root():
    """Health check endpoint."""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

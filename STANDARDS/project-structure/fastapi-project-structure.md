# FastAPI Project Structure

Standard project structure for FastAPI applications with best practices.

## Table of Contents

- [Directory Structure](#directory-structure)
- [Application Structure](#application-structure)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [API Routes](#api-routes)
- [Models & Schemas](#models--schemas)
- [Services](#services)
- [Authentication](#authentication)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Directory Structure

### Complete Project Structure

```
my-fastapi-app/
├── src/
│   ├── api/                      # API routes
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── users.py
│   │   │   │   └── posts.py
│   │   │   ├── __init__.py
│   │   │   └── api.py           # API router
│   │   └── __init__.py
│   ├── core/                     # Core application code
│   │   ├── __init__.py
│   │   ├── config.py            # Configuration settings
│   │   ├── security.py          # Security utilities
│   │   ├── database.py          # Database connection
│   │   └── dependencies.py      # Dependency injection
│   ├── models/                   # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── user.py
│   │   └── post.py
│   ├── schemas/                  # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── post.py
│   ├── services/                 # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   └── post_service.py
│   ├── repositories/             # Data access layer
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── user_repository.py
│   │   └── post_repository.py
│   ├── middleware/               # Custom middleware
│   │   ├── __init__.py
│   │   ├── logging.py
│   │   └── error_handler.py
│   ├── utils/                    # Utilities
│   │   ├── __init__.py
│   │   ├── formatting.py
│   │   └── validation.py
│   └── main.py                   # Application entry point
├── tests/                        # Tests
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   │   ├── __init__.py
│   │   └── test_user_service.py
│   └── integration/
│       ├── __init__.py
│       └── test_auth_api.py
├── alembic/                      # Database migrations
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
├── scripts/                      # Utility scripts
│   ├── seed.py
│   └── migrate.py
├── .env.example
├── .gitignore
├── alembic.ini
├── pyproject.toml
├── poetry.lock
├── README.md
└── requirements.txt
```

---

## Application Structure

### main.py (Entry Point)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.api.v1.api import api_router
from src.core.config import settings
from src.core.database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("Starting up...")
    # Create tables (for development)
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.create_all)

    yield

    # Shutdown
    print("Shutting down...")
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
```

---

## Configuration

### core/config.py

```python
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str = "My FastAPI App"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "FastAPI application"
    API_V1_PREFIX: str = "/api/v1"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 5
    DATABASE_MAX_OVERFLOW: int = 10

    # Authentication
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # External APIs
    OPENAI_API_KEY: Optional[str] = None
    STRIPE_API_KEY: Optional[str] = None

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
```

---

## Database Setup

### core/database.py

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from src.core.config import settings

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base class for models
Base = declarative_base()


async def get_db():
    """Database dependency"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

### models/base.py

```python
from sqlalchemy import Column, DateTime, func
from sqlalchemy.ext.declarative import declared_attr
from src.core.database import Base


class TimestampMixin:
    """Add timestamp columns to models"""

    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)


class BaseModel(Base, TimestampMixin):
    """Base model with common fields"""
    __abstract__ = True

    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()
```

### models/user.py

```python
from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid

from src.models.base import BaseModel


class User(BaseModel):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
```

---

## API Routes

### api/v1/api.py

```python
from fastapi import APIRouter

from src.api.v1.endpoints import auth, users, posts

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(posts.router, prefix="/posts", tags=["posts"])
```

### api/v1/endpoints/users.py

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from src.core.database import get_db
from src.core.dependencies import get_current_user
from src.schemas.user import User, UserCreate, UserUpdate
from src.services.user_service import UserService
from src.models.user import User as UserModel

router = APIRouter()


@router.get("/", response_model=List[User])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """List all users"""
    service = UserService(db)
    users = await service.list_users(skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Get user by ID"""
    service = UserService(db)
    user = await service.get_user(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Create new user"""
    service = UserService(db)

    # Check if user exists
    existing = await service.get_user_by_email(user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    user = await service.create_user(user_in)
    return user


@router.patch("/{user_id}", response_model=User)
async def update_user(
    user_id: UUID,
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Update user"""
    service = UserService(db)
    user = await service.update_user(user_id, user_in)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Delete user"""
    service = UserService(db)
    await service.delete_user(user_id)
```

---

## Models & Schemas

### schemas/user.py

```python
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)
    is_active: Optional[bool] = None


class User(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

---

## Services

### services/user_service.py

```python
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List, Optional

from src.repositories.user_repository import UserRepository
from src.schemas.user import UserCreate, UserUpdate
from src.models.user import User
from src.core.security import get_password_hash


class UserService:
    def __init__(self, db: AsyncSession):
        self.repository = UserRepository(db)

    async def get_user(self, user_id: UUID) -> Optional[User]:
        return await self.repository.get(user_id)

    async def get_user_by_email(self, email: str) -> Optional[User]:
        return await self.repository.get_by_email(email)

    async def list_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        return await self.repository.list(skip=skip, limit=limit)

    async def create_user(self, user_in: UserCreate) -> User:
        user_data = user_in.model_dump()
        user_data["hashed_password"] = get_password_hash(user_data.pop("password"))
        return await self.repository.create(user_data)

    async def update_user(self, user_id: UUID, user_in: UserUpdate) -> Optional[User]:
        user_data = user_in.model_dump(exclude_unset=True)
        if "password" in user_data:
            user_data["hashed_password"] = get_password_hash(user_data.pop("password"))
        return await self.repository.update(user_id, user_data)

    async def delete_user(self, user_id: UUID) -> bool:
        return await self.repository.delete(user_id)
```

---

## Summary Checklist

### Project Setup
- [ ] Virtual environment created
- [ ] Dependencies installed (FastAPI, SQLAlchemy, Pydantic)
- [ ] Configuration management setup
- [ ] Database connection configured
- [ ] Environment variables defined

### Application Structure
- [ ] Proper directory structure
- [ ] Models and schemas defined
- [ ] API routes organized
- [ ] Services and repositories implemented
- [ ] Authentication setup

### Quality
- [ ] Tests written (unit + integration)
- [ ] API documentation (Swagger/ReDoc)
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Type hints throughout

### Deployment
- [ ] Docker configuration
- [ ] Database migrations
- [ ] Environment-specific configs
- [ ] Health check endpoint
- [ ] Production-ready settings

---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)

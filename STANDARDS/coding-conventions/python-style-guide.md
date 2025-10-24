# Python Style Guide

**Purpose:** Standard Python coding conventions for AI/ML and backend development

**Last Updated:** 2025-10-24
**Based on:** PEP 8, Black formatter, Google Python Style Guide

---

## Quick Reference

| Category | Convention | Example |
|----------|-----------|---------|
| **Variables/Functions** | snake_case | `user_name`, `calculate_total()` |
| **Classes** | PascalCase | `UserService`, `ApiClient` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| **Private** | _leading_underscore | `_private_method()` |
| **Modules** | snake_case | `api_client.py`, `user_service.py` |

---

## Formatting

### Use Black Formatter

```bash
# Install
pip install black

# Format all files
black .

# Check without modifying
black --check .
```

### Line Length

- **Maximum:** 88 characters (Black default)
- **Imports:** Can exceed for clarity
- **Strings:** Use parentheses for multi-line

```python
# ✅ GOOD
result = some_function(
    parameter_one="value",
    parameter_two="another_value",
    parameter_three="yet_another_value",
)

# ✅ GOOD: Multi-line strings
message = (
    "This is a very long message that needs to be split "
    "across multiple lines for better readability."
)
```

---

## Type Hints

### Always Use Type Hints

```python
# ✅ GOOD
from typing import Optional, List, Dict

def get_user(user_id: str) -> Optional[Dict[str, any]]:
    """Fetch user by ID."""
    return db.query(User).filter_by(id=user_id).first()

def process_items(items: List[str]) -> int:
    """Process list of items and return count."""
    return len([item for item in items if item.startswith("active")])

# ❌ BAD: No type hints
def get_user(user_id):
    return db.query(User).filter_by(id=user_id).first()
```

### Modern Type Syntax (Python 3.10+)

```python
# ✅ GOOD: Python 3.10+ syntax
def process_data(data: list[dict[str, any]]) -> str | None:
    if not data:
        return None
    return str(data[0])

# ✅ ACCEPTABLE: Python 3.9 compatible
from typing import List, Dict, Optional, Union

def process_data(data: List[Dict[str, any]]) -> Optional[str]:
    if not data:
        return None
    return str(data[0])
```

---

## Functions

### Function Structure

```python
def calculate_total(
    items: list[dict],
    tax_rate: float = 0.2,
    discount: float = 0.0,
) -> float:
    """
    Calculate total price with tax and discount.

    Args:
        items: List of items with 'price' key
        tax_rate: Tax rate as decimal (default: 0.2 for 20%)
        discount: Discount as decimal (default: 0.0)

    Returns:
        Total price after tax and discount

    Raises:
        ValueError: If tax_rate or discount are negative

    Example:
        >>> items = [{"price": 100}, {"price": 200}]
        >>> calculate_total(items, tax_rate=0.1, discount=0.05)
        313.5
    """
    if tax_rate < 0 or discount < 0:
        raise ValueError("Tax rate and discount must be non-negative")

    subtotal = sum(item["price"] for item in items)
    total_with_tax = subtotal * (1 + tax_rate)
    return total_with_tax * (1 - discount)
```

### Keep Functions Small

```python
# ✅ GOOD: Single responsibility
def validate_email(email: str) -> bool:
    """Check if email format is valid."""
    return "@" in email and "." in email.split("@")[1]

def send_welcome_email(user: User) -> None:
    """Send welcome email to new user."""
    if not validate_email(user.email):
        raise ValueError(f"Invalid email: {user.email}")

    email_service.send(
        to=user.email,
        subject="Welcome!",
        body=render_template("welcome.html", user=user),
    )

# ❌ BAD: Too many responsibilities
def process_user_signup(email: str, name: str) -> None:
    # validation
    # database insertion
    # email sending
    # logging
    # analytics tracking
    pass
```

---

## Classes

### Class Structure

```python
from dataclasses import dataclass
from typing import ClassVar

class UserService:
    """Service for managing user operations."""

    # Class variables
    MAX_LOGIN_ATTEMPTS: ClassVar[int] = 3

    def __init__(self, db: Database, logger: Logger) -> None:
        """Initialize UserService with dependencies."""
        self.db = db
        self.logger = logger
        self._cache: dict[str, User] = {}

    # Public methods
    async def get_user(self, user_id: str) -> User | None:
        """Fetch user by ID with caching."""
        if user_id in self._cache:
            return self._cache[user_id]

        user = await self._fetch_user(user_id)
        if user:
            self._cache[user_id] = user
        return user

    # Private methods
    async def _fetch_user(self, user_id: str) -> User | None:
        """Fetch user from database."""
        return await self.db.query(User).filter_by(id=user_id).first()
```

### Use Dataclasses

```python
# ✅ GOOD: Use dataclasses for data containers
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class User:
    id: str
    name: str
    email: str
    created_at: datetime = field(default_factory=datetime.now)
    is_active: bool = True

    def __post_init__(self) -> None:
        """Validate after initialization."""
        if "@" not in self.email:
            raise ValueError(f"Invalid email: {self.email}")

# ❌ BAD: Manual __init__ with lots of boilerplate
class User:
    def __init__(self, id: str, name: str, email: str):
        self.id = id
        self.name = name
        self.email = email
        self.created_at = datetime.now()
        self.is_active = True
```

---

## Error Handling

### Custom Exceptions

```python
# ✅ GOOD: Custom exception hierarchy
class ServiceError(Exception):
    """Base exception for service errors."""
    pass

class ValidationError(ServiceError):
    """Raised when validation fails."""
    pass

class NotFoundError(ServiceError):
    """Raised when resource not found."""
    pass

# Usage
def get_user(user_id: str) -> User:
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise NotFoundError(f"User {user_id} not found")
    return user
```

### Use Context Managers

```python
# ✅ GOOD: Use context managers for resources
from contextlib import contextmanager

@contextmanager
def database_transaction(db: Database):
    """Context manager for database transactions."""
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

# Usage
with database_transaction(db) as session:
    user = User(name="John", email="john@example.com")
    session.add(user)
```

---

## Imports

### Import Organization

```python
# 1. Standard library imports
import os
import sys
from datetime import datetime
from typing import Optional

# 2. Third-party imports
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# 3. Local application imports
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.services.email import EmailService
```

### Avoid Wildcard Imports

```python
# ✅ GOOD: Explicit imports
from typing import List, Dict, Optional

# ❌ BAD: Wildcard imports
from typing import *
```

---

## FastAPI Conventions

### Route Structure

```python
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

router = APIRouter(prefix="/users", tags=["users"])

class UserCreate(BaseModel):
    """Request model for user creation."""
    name: str
    email: str

class UserResponse(BaseModel):
    """Response model for user data."""
    id: str
    name: str
    email: str

    class Config:
        from_attributes = True

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Database = Depends(get_db),
) -> User:
    """
    Create a new user.

    Args:
        user_data: User creation data
        db: Database session

    Returns:
        Created user

    Raises:
        HTTPException: If user already exists
    """
    existing_user = await db.query(User).filter_by(email=user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    user = User(**user_data.model_dump())
    db.add(user)
    await db.commit()
    return user
```

---

## AI/ML Specific Conventions

### Vector Operations

```python
import numpy as np
from typing import TypeAlias

# Type aliases for clarity
Vector: TypeAlias = np.ndarray
EmbeddingMatrix: TypeAlias = np.ndarray

def cosine_similarity(vec1: Vector, vec2: Vector) -> float:
    """
    Calculate cosine similarity between two vectors.

    Args:
        vec1: First vector
        vec2: Second vector

    Returns:
        Cosine similarity score between -1 and 1
    """
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)

    if norm1 == 0 or norm2 == 0:
        return 0.0

    return dot_product / (norm1 * norm2)
```

### LLM API Calls

```python
from typing import AsyncIterator
import openai

async def generate_completion(
    prompt: str,
    model: str = "gpt-4",
    temperature: float = 0.7,
    max_tokens: int = 1000,
) -> str:
    """
    Generate completion from OpenAI API.

    Args:
        prompt: Input prompt
        model: Model name
        temperature: Sampling temperature (0-2)
        max_tokens: Maximum tokens to generate

    Returns:
        Generated completion text

    Raises:
        OpenAIError: If API call fails
    """
    response = await openai.ChatCompletion.acreate(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content

async def stream_completion(
    prompt: str,
    model: str = "gpt-4",
) -> AsyncIterator[str]:
    """Stream completion tokens from OpenAI API."""
    response = await openai.ChatCompletion.acreate(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )

    async for chunk in response:
        if content := chunk.choices[0].delta.get("content"):
            yield content
```

---

## Testing

### Test Structure

```python
import pytest
from unittest.mock import Mock, patch

class TestUserService:
    """Tests for UserService."""

    @pytest.fixture
    def mock_db(self):
        """Create mock database."""
        return Mock(spec=Database)

    @pytest.fixture
    def user_service(self, mock_db):
        """Create UserService instance."""
        return UserService(db=mock_db)

    async def test_get_user_success(self, user_service, mock_db):
        """Test successful user retrieval."""
        # Arrange
        user_id = "123"
        expected_user = User(id=user_id, name="John", email="john@example.com")
        mock_db.query().filter_by().first.return_value = expected_user

        # Act
        result = await user_service.get_user(user_id)

        # Assert
        assert result == expected_user
        mock_db.query.assert_called_once()

    async def test_get_user_not_found(self, user_service, mock_db):
        """Test user not found."""
        # Arrange
        mock_db.query().filter_by().first.return_value = None

        # Act & Assert
        with pytest.raises(NotFoundError):
            await user_service.get_user("nonexistent")
```

---

## Documentation

### Docstring Format (Google Style)

```python
def complex_function(
    param1: str,
    param2: int,
    param3: Optional[list] = None,
) -> dict[str, any]:
    """
    One-line summary of what the function does.

    More detailed explanation of the function's purpose,
    behavior, and any important notes.

    Args:
        param1: Description of first parameter
        param2: Description of second parameter
        param3: Optional parameter with default value

    Returns:
        Dictionary containing:
            - key1: Description of key1
            - key2: Description of key2

    Raises:
        ValueError: If param2 is negative
        TypeError: If param1 is not a string

    Example:
        >>> result = complex_function("test", 42)
        >>> print(result["key1"])
        'expected_value'

    Note:
        Any additional important information.
    """
    pass
```

---

## Best Practices

### Use Pydantic for Validation

```python
from pydantic import BaseModel, EmailStr, Field, validator

class UserCreate(BaseModel):
    """User creation model with validation."""

    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    age: int = Field(..., ge=0, le=150)

    @validator("name")
    def name_must_not_be_empty(cls, v: str) -> str:
        """Validate name is not empty or whitespace."""
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()
```

### Use Async/Await for I/O

```python
# ✅ GOOD: Use async for I/O operations
async def fetch_user_data(user_id: str) -> dict:
    """Fetch user data from multiple sources."""
    user, posts, comments = await asyncio.gather(
        fetch_user(user_id),
        fetch_posts(user_id),
        fetch_comments(user_id),
    )
    return {"user": user, "posts": posts, "comments": comments}

# ❌ BAD: Sequential I/O
async def fetch_user_data(user_id: str) -> dict:
    user = await fetch_user(user_id)
    posts = await fetch_posts(user_id)  # waits for user first
    comments = await fetch_comments(user_id)  # waits for posts
    return {"user": user, "posts": posts, "comments": comments}
```

---

## Tools

### Required Tools

```bash
# Formatter
pip install black

# Linter
pip install ruff

# Type checker
pip install mypy

# Run checks
black .
ruff check .
mypy .
```

### Pre-commit Hook

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.10.0
    hooks:
      - id: black
  - repo: https://github.com/charliermarsh/ruff-pre-commit
    rev: v0.1.0
    hooks:
      - id: ruff
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.6.0
    hooks:
      - id: mypy
```

---

## Related Resources

- [FastAPI Best Practices](../best-practices/api-design-best-practices.md)
- [Testing Best Practices](../best-practices/testing-best-practices.md)
- [Code Organization](./code-organization.md)

---

**Follow these conventions for clean, maintainable Python code.**

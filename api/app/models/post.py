from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from app.models.user import UserResponse

class PostBase(BaseModel):
    title: str
    content: str  # HTML or Markdown or stringified TipTap JSON
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    tags: List[str] = []
    is_published: bool = True

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None

class PostResponse(PostBase):
    id: str
    slug: str
    author_id: str
    author: Optional[UserResponse] = None
    views_count: int = 0
    likes_count: int = 0
    is_liked_by_me: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PostListResponse(BaseModel):
    items: List[PostResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

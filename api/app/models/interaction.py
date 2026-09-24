from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.user import UserResponse

class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: str
    post_id: str
    user_id: str
    user: Optional[UserResponse] = None
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class LikeToggleResponse(BaseModel):
    liked: bool
    likes_count: int

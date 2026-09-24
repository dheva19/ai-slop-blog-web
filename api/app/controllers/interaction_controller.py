from typing import List
from fastapi import APIRouter, Depends
from app.services.interaction_service import InteractionService
from app.models.interaction import CommentCreate, CommentResponse, LikeToggleResponse
from app.models.user import UserResponse
from app.controllers.deps import get_current_user

router = APIRouter(tags=["Interactions"])
interaction_service = InteractionService()

@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
async def get_comments(post_id: str):
    return await interaction_service.get_comments(post_id)

@router.post("/posts/{post_id}/comments", response_model=CommentResponse)
async def add_comment(
    post_id: str,
    comment_in: CommentCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    return await interaction_service.add_comment(post_id=post_id, user_id=current_user.id, comment_in=comment_in)

@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    await interaction_service.delete_comment(comment_id=comment_id, user_id=current_user.id)
    return {"message": "Komentar berhasil dihapus."}

@router.post("/posts/{post_id}/like", response_model=LikeToggleResponse)
async def toggle_like(
    post_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    return await interaction_service.toggle_like(post_id=post_id, user_id=current_user.id)

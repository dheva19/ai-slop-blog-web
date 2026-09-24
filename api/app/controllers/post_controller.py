from typing import Optional
from fastapi import APIRouter, Depends, Query, Request
from app.services.post_service import PostService
from app.models.post import PostCreate, PostUpdate, PostResponse, PostListResponse
from app.models.user import UserResponse
from app.controllers.deps import get_current_user, get_current_user_optional

router = APIRouter(prefix="/posts", tags=["Posts"])
post_service = PostService()

@router.get("", response_model=PostListResponse)
async def get_posts(
    search: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    author_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(9, ge=1, le=50),
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    current_user_id = current_user.id if current_user else None
    return await post_service.list_posts(
        search=search,
        tag=tag,
        author_id=author_id,
        is_published=True,
        page=page,
        page_size=page_size,
        current_user_id=current_user_id
    )

@router.get("/my-posts", response_model=PostListResponse)
async def get_my_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: UserResponse = Depends(get_current_user)
):
    return await post_service.list_posts(
        author_id=current_user.id,
        is_published=None,  # All draft & published
        page=page,
        page_size=page_size,
        current_user_id=current_user.id
    )

@router.post("", response_model=PostResponse)
async def create_post(
    post_in: PostCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    return await post_service.create_post(author_id=current_user.id, post_in=post_in)

@router.get("/slug/{slug}", response_model=PostResponse)
async def get_post_by_slug(
    slug: str,
    request: Request,
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    current_user_id = current_user.id if current_user else None
    client_ip = request.client.host if request.client else ""
    user_agent = request.headers.get("user-agent", "")
    return await post_service.get_post_by_slug(
        slug=slug,
        current_user_id=current_user_id,
        track_view=True,
        ip=client_ip,
        ua=user_agent
    )

@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: str,
    post_in: PostUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    return await post_service.update_post(post_id=post_id, author_id=current_user.id, post_in=post_in)

@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    success = await post_service.delete_post(post_id=post_id, author_id=current_user.id)
    return {"success": success, "message": "Postingan berhasil dihapus."}

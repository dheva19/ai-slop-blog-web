from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
from fastapi import HTTPException, status
from app.repositories.post_repository import PostRepository
from app.repositories.user_repository import UserRepository
from app.repositories.interaction_repository import LikeRepository
from app.repositories.analytics_repository import AnalyticsRepository
from app.models.post import PostCreate, PostUpdate, PostResponse, PostListResponse
from app.models.user import UserResponse
from app.utils.slug import slugify

class PostService:
    def __init__(self):
        self.post_repo = PostRepository()
        self.user_repo = UserRepository()
        self.like_repo = LikeRepository()
        self.analytics_repo = AnalyticsRepository()

    async def _format_post_response(self, post_doc: Dict[str, Any], current_user_id: Optional[str] = None) -> PostResponse:
        author_doc = await self.user_repo.get_by_id(post_doc["author_id"])
        author_res = None
        if author_doc:
            author_res = UserResponse(
                id=str(author_doc["_id"]),
                username=author_doc["username"],
                email=author_doc["email"],
                full_name=author_doc.get("full_name"),
                avatar_url=author_doc.get("avatar_url"),
                bio=author_doc.get("bio"),
                created_at=author_doc["created_at"]
            )

        post_id_str = str(post_doc["_id"])
        is_liked = False
        if current_user_id:
            is_liked = await self.like_repo.is_liked(post_id_str, current_user_id)

        return PostResponse(
            id=post_id_str,
            slug=post_doc["slug"],
            title=post_doc["title"],
            content=post_doc["content"],
            excerpt=post_doc.get("excerpt"),
            cover_image=post_doc.get("cover_image"),
            tags=post_doc.get("tags", []),
            is_published=post_doc.get("is_published", True),
            author_id=post_doc["author_id"],
            author=author_res,
            views_count=post_doc.get("views_count", 0),
            likes_count=post_doc.get("likes_count", 0),
            is_liked_by_me=is_liked,
            created_at=post_doc["created_at"],
            updated_at=post_doc.get("updated_at", post_doc["created_at"])
        )

    async def create_post(self, author_id: str, post_in: PostCreate) -> PostResponse:
        base_slug = slugify(post_in.title)
        if not base_slug:
            base_slug = "post"

        slug = base_slug
        existing = await self.post_repo.get_by_slug(slug)
        if existing:
            slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"

        now = datetime.utcnow()
        post_doc = {
            "title": post_in.title,
            "slug": slug,
            "content": post_in.content,
            "excerpt": post_in.excerpt or (post_in.content[:160] + "..." if len(post_in.content) > 160 else post_in.content),
            "cover_image": post_in.cover_image,
            "tags": [t.strip().lower() for t in post_in.tags if t.strip()],
            "is_published": post_in.is_published,
            "author_id": author_id,
            "views_count": 0,
            "likes_count": 0,
            "created_at": now,
            "updated_at": now
        }

        created = await self.post_repo.create(post_doc)
        return await self._format_post_response(created, author_id)

    async def get_post_by_slug(self, slug: str, current_user_id: Optional[str] = None, track_view: bool = False, ip: str = "", ua: str = "") -> PostResponse:
        post = await self.post_repo.get_by_slug(slug)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artikel blog tidak ditemukan.")

        if not post.get("is_published", True) and post.get("author_id") != current_user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artikel masih berstatus draft.")

        if track_view:
            post_id_str = str(post["_id"])
            await self.post_repo.increment_views(post_id_str)
            await self.analytics_repo.log_traffic(post_id=post_id_str, ip_hash=ip, user_agent=ua)
            post["views_count"] = post.get("views_count", 0) + 1

        return await self._format_post_response(post, current_user_id)

    async def update_post(self, post_id: str, author_id: str, post_in: PostUpdate) -> PostResponse:
        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artikel tidak ditemukan.")

        if post["author_id"] != author_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Anda tidak memiliki izin mengedit artikel ini.")

        update_dict = {k: v for k, v in post_in.dict(exclude_unset=True).items() if v is not None}
        if "title" in update_dict and update_dict["title"] != post["title"]:
            base_slug = slugify(update_dict["title"])
            slug = base_slug
            existing = await self.post_repo.get_by_slug(slug)
            if existing and str(existing["_id"]) != post_id:
                slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
            update_dict["slug"] = slug

        updated = await self.post_repo.update(post_id, update_dict)
        return await self._format_post_response(updated, author_id)

    async def delete_post(self, post_id: str, author_id: str) -> bool:
        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artikel tidak ditemukan.")

        if post["author_id"] != author_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Anda tidak memiliki izin menghapus artikel ini.")

        return await self.post_repo.delete(post_id)

    async def list_posts(self, search: Optional[str] = None, tag: Optional[str] = None, author_id: Optional[str] = None, is_published: Optional[bool] = True, page: int = 1, page_size: int = 10, current_user_id: Optional[str] = None) -> PostListResponse:
        query: Dict[str, Any] = {}
        if is_published is not None:
            query["is_published"] = is_published

        if author_id:
            query["author_id"] = author_id

        if tag:
            query["tags"] = tag.lower().strip()

        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"excerpt": {"$regex": search, "$options": "i"}},
                {"tags": {"$in": [search.lower().strip()]}}
            ]

        skip = (page - 1) * page_size
        items_raw, total = await self.post_repo.list_posts(query=query, skip=skip, limit=page_size)

        items = []
        for doc in items_raw:
            formatted = await self._format_post_response(doc, current_user_id)
            items.append(formatted)

        total_pages = (total + page_size - 1) // page_size if total > 0 else 1
        return PostListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

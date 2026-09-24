from typing import List
from datetime import datetime
from fastapi import HTTPException, status
from app.repositories.interaction_repository import CommentRepository, LikeRepository
from app.repositories.post_repository import PostRepository
from app.repositories.user_repository import UserRepository
from app.models.interaction import CommentCreate, CommentResponse, LikeToggleResponse
from app.models.user import UserResponse

class InteractionService:
    def __init__(self):
        self.comment_repo = CommentRepository()
        self.like_repo = LikeRepository()
        self.post_repo = PostRepository()
        self.user_repo = UserRepository()

    async def add_comment(self, post_id: str, user_id: str, comment_in: CommentCreate) -> CommentResponse:
        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artikel tidak ditemukan.")

        now = datetime.utcnow()
        doc = {
            "post_id": post_id,
            "user_id": user_id,
            "content": comment_in.content.strip(),
            "created_at": now
        }
        created = await self.comment_repo.create(doc)

        author = await self.user_repo.get_by_id(user_id)
        author_res = None
        if author:
            author_res = UserResponse(
                id=str(author["_id"]),
                username=author["username"],
                email=author["email"],
                full_name=author.get("full_name"),
                avatar_url=author.get("avatar_url"),
                bio=author.get("bio"),
                created_at=author["created_at"]
            )

        return CommentResponse(
            id=str(created["_id"]),
            post_id=post_id,
            user_id=user_id,
            user=author_res,
            content=created["content"],
            created_at=now
        )

    async def get_comments(self, post_id: str) -> List[CommentResponse]:
        docs = await self.comment_repo.get_by_post_id(post_id)
        results = []
        for doc in docs:
            user_doc = await self.user_repo.get_by_id(doc["user_id"])
            user_res = None
            if user_doc:
                user_res = UserResponse(
                    id=str(user_doc["_id"]),
                    username=user_doc["username"],
                    email=user_doc["email"],
                    full_name=user_doc.get("full_name"),
                    avatar_url=user_doc.get("avatar_url"),
                    bio=user_doc.get("bio"),
                    created_at=user_doc["created_at"]
                )
            results.append(CommentResponse(
                id=str(doc["_id"]),
                post_id=doc["post_id"],
                user_id=doc["user_id"],
                user=user_res,
                content=doc["content"],
                created_at=doc["created_at"]
            ))
        return results

    async def delete_comment(self, comment_id: str, user_id: str) -> bool:
        success = await self.comment_repo.delete(comment_id, user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tidak dapat menghapus komentar.")
        return True

    async def toggle_like(self, post_id: str, user_id: str) -> LikeToggleResponse:
        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artikel tidak ditemukan.")

        already_liked = await self.like_repo.is_liked(post_id, user_id)
        if already_liked:
            await self.like_repo.remove_like(post_id, user_id)
            await self.post_repo.adjust_likes(post_id, -1)
            liked = False
        else:
            await self.like_repo.add_like(post_id, user_id)
            await self.post_repo.adjust_likes(post_id, 1)
            liked = True

        current_count = await self.like_repo.count_likes(post_id)
        return LikeToggleResponse(liked=liked, likes_count=current_count)

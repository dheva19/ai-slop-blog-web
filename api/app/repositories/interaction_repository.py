from bson import ObjectId
from typing import Optional, List, Dict, Any
from app.core.database import get_database

class CommentRepository:
    @property
    def collection(self):
        return get_database()["comments"]

    async def create(self, comment_data: Dict[str, Any]) -> Dict[str, Any]:
        result = await self.collection.insert_one(comment_data)
        comment_data["_id"] = result.inserted_id
        return comment_data

    async def get_by_post_id(self, post_id: str) -> List[Dict[str, Any]]:
        cursor = self.collection.find({"post_id": post_id}).sort("created_at", -1)
        return await cursor.to_list(length=200)

    async def delete(self, comment_id: str, user_id: str) -> bool:
        try:
            res = await self.collection.delete_one({"_id": ObjectId(comment_id), "user_id": user_id})
            return res.deleted_count > 0
        except Exception:
            return False

class LikeRepository:
    @property
    def collection(self):
        return get_database()["likes"]

    async def is_liked(self, post_id: str, user_id: str) -> bool:
        doc = await self.collection.find_one({"post_id": post_id, "user_id": user_id})
        return doc is not None

    async def add_like(self, post_id: str, user_id: str) -> bool:
        try:
            await self.collection.update_one(
                {"post_id": post_id, "user_id": user_id},
                {"$setOnInsert": {"post_id": post_id, "user_id": user_id}},
                upsert=True
            )
            return True
        except Exception:
            return False

    async def remove_like(self, post_id: str, user_id: str) -> bool:
        res = await self.collection.delete_one({"post_id": post_id, "user_id": user_id})
        return res.deleted_count > 0

    async def count_likes(self, post_id: str) -> int:
        return await self.collection.count_documents({"post_id": post_id})

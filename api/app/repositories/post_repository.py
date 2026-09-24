from bson import ObjectId
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.core.database import get_database

class PostRepository:
    @property
    def collection(self):
        return get_database()["posts"]

    async def get_by_id(self, post_id: str) -> Optional[Dict[str, Any]]:
        try:
            return await self.collection.find_one({"_id": ObjectId(post_id)})
        except Exception:
            return None

    async def get_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"slug": slug})

    async def create(self, post_data: Dict[str, Any]) -> Dict[str, Any]:
        result = await self.collection.insert_one(post_data)
        post_data["_id"] = result.inserted_id
        return post_data

    async def update(self, post_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            update_data["updated_at"] = datetime.utcnow()
            await self.collection.update_one({"_id": ObjectId(post_id)}, {"$set": update_data})
            return await self.get_by_id(post_id)
        except Exception:
            return None

    async def delete(self, post_id: str) -> bool:
        try:
            res = await self.collection.delete_one({"_id": ObjectId(post_id)})
            return res.deleted_count > 0
        except Exception:
            return False

    async def increment_views(self, post_id: str):
        try:
            await self.collection.update_one({"_id": ObjectId(post_id)}, {"$inc": {"views_count": 1}})
        except Exception:
            pass

    async def adjust_likes(self, post_id: str, delta: int):
        try:
            await self.collection.update_one({"_id": ObjectId(post_id)}, {"$inc": {"likes_count": delta}})
        except Exception:
            pass

    async def list_posts(self, query: Dict[str, Any], skip: int = 0, limit: int = 10, sort_by: str = "created_at", sort_order: int = -1):
        cursor = self.collection.find(query).sort(sort_by, sort_order).skip(skip).limit(limit)
        items = await cursor.to_list(length=limit)
        total = await self.collection.count_documents(query)
        return items, total

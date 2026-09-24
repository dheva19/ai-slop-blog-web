from bson import ObjectId
from typing import Optional, Dict, Any
from app.core.database import get_database

class UserRepository:
    @property
    def collection(self):
        return get_database()["users"]

    async def get_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            return await self.collection.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None

    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"email": email.lower().strip()})

    async def get_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"username": username.lower().strip()})

    async def create(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        user_data["email"] = user_data["email"].lower().strip()
        user_data["username"] = user_data["username"].lower().strip()
        result = await self.collection.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        return user_data

    async def update(self, user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            await self.collection.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
            return await self.get_by_id(user_id)
        except Exception:
            return None

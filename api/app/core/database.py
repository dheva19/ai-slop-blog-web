import os
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

def get_database():
    # Inisialisasi on-demand (lazy connection) untuk environment serverless
    if db.client is None or db.db is None:
        mongo_url = settings.MONGODB_URL
        # Pastikan opsi serverSelectionTimeoutMS tidak hang lama di serverless jika salah kredensial
        db.client = AsyncIOMotorClient(
            mongo_url,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        db.db = db.client[settings.DATABASE_NAME]
    return db.db

async def connect_to_mongo():
    try:
        get_database()
        print(f"Connected to MongoDB: {settings.DATABASE_NAME}")
    except Exception as e:
        print(f"MongoDB connection warning: {e}")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        db.client = None
        db.db = None
        print("MongoDB connection closed.")

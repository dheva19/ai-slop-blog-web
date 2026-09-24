from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Modern Blog Platform"
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "blog_db"
    JWT_SECRET: str = "super_secret_jwt_key_change_in_production_123456789"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = (".env", "api/.env")
        extra = "allow"

settings = Settings()

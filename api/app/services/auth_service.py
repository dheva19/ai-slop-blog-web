from datetime import datetime
from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.models.user import UserCreate, UserLogin, UserResponse, Token
from app.core.security import verify_password, get_password_hash, create_access_token

class AuthService:
    def __init__(self):
        self.user_repo = UserRepository()

    async def register(self, user_in: UserCreate) -> Token:
        # Check existing email
        if await self.user_repo.get_by_email(user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email sudah terdaftar."
            )
        # Check existing username
        if await self.user_repo.get_by_username(user_in.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username sudah digunakan."
            )

        hashed_password = get_password_hash(user_in.password)
        user_doc = {
            "username": user_in.username,
            "email": user_in.email,
            "full_name": user_in.full_name or user_in.username,
            "avatar_url": user_in.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_in.username}",
            "bio": user_in.bio or "",
            "hashed_password": hashed_password,
            "created_at": datetime.utcnow()
        }

        created = await self.user_repo.create(user_doc)
        user_res = UserResponse(
            id=str(created["_id"]),
            username=created["username"],
            email=created["email"],
            full_name=created["full_name"],
            avatar_url=created["avatar_url"],
            bio=created["bio"],
            created_at=created["created_at"]
        )

        token = create_access_token(subject=user_res.id)
        return Token(access_token=token, token_type="bearer", user=user_res)

    async def login(self, login_in: UserLogin) -> Token:
        user = await self.user_repo.get_by_email(login_in.email)
        if not user or not verify_password(login_in.password, user.get("hashed_password", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email atau kata sandi tidak valid."
            )

        user_res = UserResponse(
            id=str(user["_id"]),
            username=user["username"],
            email=user["email"],
            full_name=user.get("full_name"),
            avatar_url=user.get("avatar_url"),
            bio=user.get("bio"),
            created_at=user["created_at"]
        )
        token = create_access_token(subject=user_res.id)
        return Token(access_token=token, token_type="bearer", user=user_res)

    async def get_current_user_profile(self, user_id: str) -> UserResponse:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan.")
        return UserResponse(
            id=str(user["_id"]),
            username=user["username"],
            email=user["email"],
            full_name=user.get("full_name"),
            avatar_url=user.get("avatar_url"),
            bio=user.get("bio"),
            created_at=user["created_at"]
        )

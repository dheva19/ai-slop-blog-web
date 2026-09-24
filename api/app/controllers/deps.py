from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_token
from app.repositories.user_repository import UserRepository
from app.models.user import UserResponse

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)
user_repo = UserRepository()

async def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[UserResponse]:
    if not token:
        return None
    payload = decode_token(token)
    if not payload:
        return None
    user_id: str = payload.get("sub")
    if not user_id:
        return None
    user = await user_repo.get_by_id(user_id)
    if not user:
        return None
    return UserResponse(
        id=str(user["_id"]),
        username=user["username"],
        email=user["email"],
        full_name=user.get("full_name"),
        avatar_url=user.get("avatar_url"),
        bio=user.get("bio"),
        created_at=user["created_at"]
    )

async def get_current_user(current_user: Optional[UserResponse] = Depends(get_current_user_optional)) -> UserResponse:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autentikasi diperlukan untuk tindakan ini.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user

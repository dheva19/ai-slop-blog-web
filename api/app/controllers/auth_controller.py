from fastapi import APIRouter, Depends
from app.services.auth_service import AuthService
from app.models.user import UserCreate, UserLogin, UserResponse, Token
from app.controllers.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])
auth_service = AuthService()

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate):
    return await auth_service.register(user_in)

@router.post("/login", response_model=Token)
async def login(login_in: UserLogin):
    return await auth_service.login(login_in)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

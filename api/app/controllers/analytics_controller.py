from fastapi import APIRouter, Depends
from app.services.analytics_service import AnalyticsService
from app.models.analytics import DashboardStatsResponse
from app.models.user import UserResponse
from app.controllers.deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])
analytics_service = AnalyticsService()

@router.get("/dashboard", response_model=DashboardStatsResponse)
async def get_dashboard_stats(current_user: UserResponse = Depends(get_current_user)):
    return await analytics_service.get_author_stats(current_user.id)

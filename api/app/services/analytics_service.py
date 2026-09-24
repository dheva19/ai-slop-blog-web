from app.repositories.analytics_repository import AnalyticsRepository
from app.models.analytics import DashboardStatsResponse

class AnalyticsService:
    def __init__(self):
        self.analytics_repo = AnalyticsRepository()

    async def get_author_stats(self, author_id: str) -> DashboardStatsResponse:
        data = await self.analytics_repo.get_author_dashboard_stats(author_id)
        return DashboardStatsResponse(**data)

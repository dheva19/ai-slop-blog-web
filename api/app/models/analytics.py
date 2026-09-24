from pydantic import BaseModel
from typing import List, Dict, Any

class DailyTraffic(BaseModel):
    date: str
    views: int
    likes: int

class DashboardStatsResponse(BaseModel):
    total_posts: int
    published_posts: int
    total_views: int
    total_likes: int
    total_comments: int
    recent_traffic: List[DailyTraffic]

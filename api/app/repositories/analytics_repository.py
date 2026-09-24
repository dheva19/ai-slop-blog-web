from bson import ObjectId
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.core.database import get_database

class AnalyticsRepository:
    @property
    def traffic_collection(self):
        return get_database()["traffic_logs"]

    @property
    def posts_collection(self):
        return get_database()["posts"]

    @property
    def comments_collection(self):
        return get_database()["comments"]

    @property
    def likes_collection(self):
        return get_database()["likes"]

    async def log_traffic(self, post_id: str, ip_hash: str = "", user_agent: str = ""):
        await self.traffic_collection.insert_one({
            "post_id": post_id,
            "ip_hash": ip_hash,
            "user_agent": user_agent,
            "timestamp": datetime.utcnow()
        })

    async def get_author_dashboard_stats(self, author_id: str) -> Dict[str, Any]:
        # Get all posts authored by this user
        posts_cursor = self.posts_collection.find({"author_id": author_id})
        posts = await posts_cursor.to_list(length=1000)

        total_posts = len(posts)
        published_posts = sum(1 for p in posts if p.get("is_published", False))
        total_views = sum(p.get("views_count", 0) for p in posts)
        total_likes = sum(p.get("likes_count", 0) for p in posts)

        post_ids_str = [str(p["_id"]) for p in posts]
        total_comments = 0
        if post_ids_str:
            total_comments = await self.comments_collection.count_documents({"post_id": {"$in": post_ids_str}})

        # Calculate daily traffic for the last 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=6)
        start_of_period = datetime(seven_days_ago.year, seven_days_ago.month, seven_days_ago.day)

        pipeline = [
            {
                "$match": {
                    "post_id": {"$in": post_ids_str},
                    "timestamp": {"$gte": start_of_period}
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}
                    },
                    "views": {"$sum": 1}
                }
            }
        ]
        traffic_results = await self.traffic_collection.aggregate(pipeline).to_list(length=10)
        traffic_map = {item["_id"]: item["views"] for item in traffic_results}

        # Build complete 7-day timeline
        recent_traffic = []
        for i in range(7):
            day = start_of_period + timedelta(days=i)
            day_str = day.strftime("%Y-%m-%d")
            recent_traffic.append({
                "date": day_str,
                "views": traffic_map.get(day_str, 0),
                "likes": 0
            })

        return {
            "total_posts": total_posts,
            "published_posts": published_posts,
            "total_views": total_views,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "recent_traffic": recent_traffic
        }

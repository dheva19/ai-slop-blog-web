export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  tags: string[];
  is_published: boolean;
  author_id: string;
  author?: User;
  views_count: number;
  likes_count: number;
  is_liked_by_me: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostListResponse {
  items: Post[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user?: User;
  content: string;
  created_at: string;
}

export interface LikeResponse {
  liked: boolean;
  likes_count: number;
}

export interface DailyTraffic {
  date: string;
  views: number;
  likes: number;
}

export interface DashboardStats {
  total_posts: number;
  published_posts: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  recent_traffic: DailyTraffic[];
}

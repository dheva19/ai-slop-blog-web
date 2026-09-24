import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/services/AuthContext";
import { DashboardStats, Post, PostListResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Eye, Heart, MessageSquare, Plus, Trash2, ExternalLink
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [statsRes, postsRes] = await Promise.all([
          api.get<DashboardStats>("/analytics/dashboard"),
          api.get<PostListResponse>("/posts/my-posts"),
        ]);
        setStats(statsRes.data);
        setMyPosts(postsRes.data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus postingan ini?")) return;
    try {
      await api.delete(`/posts/${id}`);
      setMyPosts(myPosts.filter((p) => p.id !== id));
    } catch (err) {
      alert("Gagal menghapus postingan.");
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-16 animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 md:h-28 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Penulis</h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            Pantau perkembangan dan analitik traffic pembaca blogmu.
          </p>
        </div>
        <Link to="/write" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto flex items-center justify-center gap-2" size="sm">
            <Plus className="h-4 w-4" /> Tulis Blog Baru
          </Button>
        </Link>
      </div>

      {/* Summary Stat Cards Grid 2 kolom di mobile, 4 kolom di desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Artikel</CardTitle>
            <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-xl md:text-2xl font-bold">{stats?.total_posts || 0}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              {stats?.published_posts || 0} Publish
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Views</CardTitle>
            <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-xl md:text-2xl font-bold">{stats?.total_views || 0}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Total Kunjungan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Likes</CardTitle>
            <Heart className="h-3.5 w-3.5 md:h-4 md:w-4 text-rose-500" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-xl md:text-2xl font-bold">{stats?.total_likes || 0}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Apresiasi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Komentar</CardTitle>
            <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-xl md:text-2xl font-bold">{stats?.total_comments || 0}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Diskusi aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Chart Responsive */}
      <Card>
        <CardHeader className="p-4 md:p-6 pb-2">
          <CardTitle className="text-base md:text-lg">Traffic Kunjungan (7 Hari Terakhir)</CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-6 pt-0 h-64 md:h-72">
          {stats?.recent_traffic && stats.recent_traffic.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.recent_traffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="date" fontSize={11} stroke="#888888" tickFormatter={(v) => v.slice(5)} />
                <YAxis fontSize={11} stroke="#888888" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="views" stroke="#3b82f6" fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-xs md:text-sm">
              Belum ada riwayat traffic terkumpul.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daftar Postingan Saya */}
      <Card>
        <CardHeader className="p-4 md:p-6 pb-2">
          <CardTitle className="text-base md:text-lg">Postingan Saya</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          {myPosts.length === 0 ? (
            <p className="text-muted-foreground text-xs md:text-sm py-4">Belum ada artikel yang ditulis.</p>
          ) : (
            <div className="divide-y">
              {myPosts.map((post) => (
                <div key={post.id} className="py-3 md:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/blog/${post.slug}`} className="font-semibold text-sm md:text-base hover:text-primary transition-colors line-clamp-1">
                        {post.title}
                      </Link>
                      <Badge variant={post.is_published ? "default" : "secondary"} className="text-[10px] h-5">
                        {post.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] md:text-xs text-muted-foreground">
                      <span>{post.views_count} views</span>
                      <span>{post.likes_count} likes</span>
                      <span className="truncate max-w-[200px]">/{post.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/blog/${post.slug}`}>
                      <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> Lihat
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeletePost(post.id)}
                      className="h-8 px-2.5 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

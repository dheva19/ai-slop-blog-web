import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/services/api";
import { Post, PostListResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Heart } from "lucide-react";

export const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get<PostListResponse>("/posts", {
        params: {
          search: search || undefined,
          tag: selectedTag || undefined,
          page,
          page_size: 9,
        },
      });
      setPosts(res.data.items);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, selectedTag]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
      {/* Hero & Search Header */}
      <section className="text-center space-y-3 md:space-y-4 py-6 md:py-10 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Eksplorasi Ide, Cerita, & Teknologi
        </h1>
        <p className="text-muted-foreground text-sm md:text-lg">
          Platform blog modern untuk developer dan kreator berbagi pengetahuan tanpa batas.
        </p>
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari judul artikel atau topik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto">Cari</Button>
        </form>
        {selectedTag && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-xs md:text-sm text-muted-foreground">Filter tag:</span>
            <Badge variant="secondary" className="cursor-pointer text-xs" onClick={() => setSelectedTag(null)}>
              #{selectedTag} ✕
            </Badge>
          </div>
        )}
      </section>

      {/* Post Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-muted/40 animate-pulse border" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 md:py-16 border rounded-xl bg-card px-4">
          <p className="text-muted-foreground text-base md:text-lg">Tidak ada artikel yang ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
              {post.cover_image && (
                <div className="h-44 sm:h-48 overflow-hidden bg-muted">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              )}
              <CardHeader className="p-4 sm:p-5 pb-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  {post.tags.map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary text-[11px]"
                      onClick={() => setSelectedTag(t)}
                    >
                      #{t}
                    </Badge>
                  ))}
                </div>
                <Link to={`/blog/${post.slug}`}>
                  <CardTitle className="text-lg md:text-xl hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                </Link>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-0 flex-1">
                <p className="text-muted-foreground text-xs sm:text-sm line-clamp-3">
                  {post.excerpt || "Baca selengkapnya..."}
                </p>
              </CardContent>
              <CardFooter className="p-4 sm:p-5 pt-0 border-t flex items-center justify-between text-xs text-muted-foreground mt-auto">
                <div className="flex items-center gap-2 overflow-hidden mr-2">
                  <img
                    src={post.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username || 'user'}`}
                    alt="avatar"
                    className="w-5 h-5 rounded-full shrink-0"
                  />
                  <span className="truncate">{post.author?.full_name || post.author?.username || "Penulis"}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {post.views_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-rose-500" />
                    {post.likes_count}
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Mobile Friendly */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Sebelumnya
          </Button>
          <span className="text-xs sm:text-sm text-muted-foreground px-2">
            Hal {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Berikutnya
          </Button>
        </div>
      )}
    </div>
  );
};

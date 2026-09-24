import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/services/AuthContext";
import { Post, Comment, LikeResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Eye, ArrowLeft, Trash2 } from "lucide-react";
import { format } from "date-fns";

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const res = await api.get<Post>(`/posts/slug/${slug}`);
        setPost(res.data);

        // Fetch comments
        const commRes = await api.get<Comment[]>(`/posts/${res.data.id}/comments`);
        setComments(commRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchPostAndComments();
  }, [slug]);

  const handleLike = async () => {
    if (!user) {
      alert("Silakan login terlebih dahulu untuk menyukai postingan ini.");
      return;
    }
    if (!post) return;

    try {
      const res = await api.post<LikeResponse>(`/posts/${post.id}/like`);
      setPost({
        ...post,
        is_liked_by_me: res.data.liked,
        likes_count: res.data.likes_count,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;

    setSubmittingComment(true);
    try {
      const res = await api.post<Comment>(`/posts/${post.id}/comments`, {
        content: newComment,
      });
      setComments([res.data, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-12 space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-56 bg-muted rounded" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl md:text-2xl font-bold">Artikel tidak ditemukan</h2>
        <Link to="/">
          <Button variant="outline">Kembali ke Beranda</Button>
        </Link>
      </div>
    );
  }

  return (
    <article className="container max-w-3xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8">
      <Link to="/" className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke semua artikel
      </Link>

      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
          ))}
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y py-3 md:py-4 gap-3 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <img
              src={post.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username || 'user'}`}
              alt={post.author?.username}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border object-cover shrink-0"
            />
            <div>
              <p className="font-medium text-foreground text-sm">{post.author?.full_name || post.author?.username}</p>
              <p className="text-[11px] sm:text-xs">{post.created_at ? format(new Date(post.created_at), "dd MMM yyyy") : ""}</p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0">
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" /> {post.views_count} views
            </span>
            <Button
              variant={post.is_liked_by_me ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              className="flex items-center gap-1.5 h-8"
            >
              <Heart className={`h-4 w-4 ${post.is_liked_by_me ? "fill-current text-white" : "text-rose-500"}`} />
              <span>{post.likes_count}</span>
            </Button>
          </div>
        </div>
      </div>

      {post.cover_image && (
        <div className="rounded-xl overflow-hidden border max-h-[300px] sm:max-h-[450px]">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Konten Blog dengan overflow wrapping agar tidak terpotong di layar HP */}
      <div
        className="prose dark:prose-invert max-w-none pt-2 leading-relaxed break-words overflow-x-hidden text-sm sm:text-base"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Bagian Komentar */}
      <section className="border-t pt-8 mt-10 space-y-5">
        <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Komentar ({comments.length})
        </h3>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <Textarea
              placeholder="Tulis pendapatmu..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none text-sm"
              rows={3}
            />
            <Button type="submit" size="sm" disabled={submittingComment || !newComment.trim()}>
              {submittingComment ? "Mengirim..." : "Kirim Komentar"}
            </Button>
          </form>
        ) : (
          <div className="p-4 border rounded-lg bg-muted/30 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Silakan <Link to="/login" className="text-primary underline">masuk</Link> untuk berkomentar.
            </p>
          </div>
        )}

        {/* List Komentar */}
        <div className="space-y-3 pt-2">
          {comments.map((comment) => (
            <div key={comment.id} className="p-3 sm:p-4 border rounded-lg bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden mr-2">
                  <img
                    src={comment.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.username || 'u'}`}
                    alt="avatar"
                    className="w-6 h-6 rounded-full shrink-0"
                  />
                  <span className="text-xs sm:text-sm font-semibold truncate">{comment.user?.full_name || comment.user?.username}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                    {comment.created_at ? format(new Date(comment.created_at), "dd MMM") : ""}
                  </span>
                </div>
                {user && user.id === comment.user_id && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-foreground/90 pl-8 break-words">{comment.content}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
};

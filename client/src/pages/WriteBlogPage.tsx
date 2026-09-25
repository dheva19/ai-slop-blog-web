import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/services/AuthContext";
import { Post } from "@/types";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image, Tag, Send, Save } from "lucide-react";

export const WriteBlogPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);

  useEffect(() => {
    if (id) {
      setLoadingPost(true);
      api
        .get<Post>(`/posts/${id}`)
        .then((res) => {
          setTitle(res.data.title);
          setContent(res.data.content);
          setCoverImage(res.data.cover_image || "");
          setTagsInput((res.data.tags || []).join(", "));
        })
        .catch((err) => {
          alert("Gagal memuat artikel untuk diedit.");
          console.error(err);
        })
        .finally(() => setLoadingPost(false));
    }
  }, [id]);

  if (!user) {
    return (
      <div className="container max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Akses Terbatas</h2>
        <p className="text-muted-foreground text-sm">Silakan masuk terlebih dahulu untuk menulis blog.</p>
        <Button onClick={() => navigate("/login")}>Menuju Halaman Masuk</Button>
      </div>
    );
  }

  const handleSubmit = async (publish: boolean) => {
    if (!title.trim()) {
      alert("Judul artikel tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      let res;
      if (id) {
        res = await api.put<Post>(`/posts/${id}`, {
          title,
          content,
          cover_image: coverImage || undefined,
          tags,
          is_published: publish,
        });
      } else {
        res = await api.post<Post>("/posts", {
          title,
          content,
          cover_image: coverImage || undefined,
          tags,
          is_published: publish,
        });
      }

      navigate(`/blog/${res.data.slug}`);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Gagal menyimpan artikel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPost) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12 space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-12 bg-muted rounded w-full" />
        <div className="h-64 bg-muted rounded w-full" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {id ? "Edit Artikel Blog" : "Tulis Blog Baru"}
        </h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5"
            size="sm"
          >
            <Save className="h-4 w-4" /> Draft
          </Button>
          <Button
            variant="default"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5"
            size="sm"
          >
            <Send className="h-4 w-4" /> Publish
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Judul Blog Responsive Font */}
        <Input
          type="text"
          placeholder="Judul artikel blog..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xl md:text-3xl font-bold py-4 md:py-6 px-3 md:px-4"
        />

        {/* Cover Image */}
        <div className="flex items-center gap-2">
          <Image className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            type="text"
            placeholder="URL Gambar Sampul (opsional)"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tags (pisahkan koma: react, fastapi, dev)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Rich Text TipTap Editor */}
        <div className="pt-2">
          <RichTextEditor content={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
};

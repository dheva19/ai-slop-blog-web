import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Image as ImageIcon, Video, Link as LinkIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo, Redo
} from "lucide-react";

// Initialize lowlight with common programming languages
const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const [showImgModal, setShowImgModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disables starter-kit basic codeBlock in favor of codeBlockLowlight
        heading: {
          levels: [1, 2, 3],
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-h-[500px] w-full object-cover mx-auto my-4 border",
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: "rounded-lg mx-auto my-4 aspect-video w-full",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder: "Mulai ceritamu di sini... Sisipkan teks, gambar, video Youtube, atau blok kode!",
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const handleAddImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setShowImgModal(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        editor.chain().focus().setImage({ src: base64 }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddYoutube = () => {
    if (videoUrl) {
      editor.commands.setYoutubeVideo({
        src: videoUrl,
      });
      setVideoUrl("");
      setShowVideoModal(false);
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL Tujuan:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      {/* Menu Toolbar dengan scroll horizontal di mobile */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/40 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("bold") ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className="h-8 w-8 p-0"
            title="Tebal"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("italic") ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className="h-8 w-8 p-0"
            title="Miring"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("strike") ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className="h-8 w-8 p-0"
            title="Coret"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-[1px] h-6 bg-border mx-1 shrink-0" />

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className="h-8 w-8 p-0"
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className="h-8 w-8 p-0"
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className="h-8 w-8 p-0"
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-[1px] h-6 bg-border mx-1 shrink-0" />

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: "left" }) ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className="h-8 w-8 p-0"
            title="Rata Kiri"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: "center" }) ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className="h-8 w-8 p-0"
            title="Rata Tengah"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: "right" }) ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className="h-8 w-8 p-0"
            title="Rata Kanan"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: "justify" }) ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className="h-8 w-8 p-0"
            title="Rata Kanan Kiri (Justify)"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-[1px] h-6 bg-border mx-1 shrink-0" />

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className="h-8 w-8 p-0"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className="h-8 w-8 p-0"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className="h-8 w-8 p-0"
            title="Kutipan"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("codeBlock") ? "secondary" : "ghost"}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className="h-8 w-8 p-0"
            title="Blok Kode"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-[1px] h-6 bg-border mx-1 shrink-0" />

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("link") ? "secondary" : "ghost"}
            onClick={setLink}
            className="h-8 w-8 p-0"
            title="Sisipkan Tautan"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowImgModal(!showImgModal)}
            className="h-8 w-8 p-0"
            title="Sisipkan Gambar"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowVideoModal(!showVideoModal)}
            className="h-8 w-8 p-0"
            title="Sisipkan YouTube"
          >
            <Video className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-[1px] h-6 bg-border mx-1 shrink-0" />

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8 p-0"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8 p-0"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Popover Insert Image Mobile Friendly */}
      {showImgModal && (
        <div className="p-3 bg-muted/60 border-b flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            placeholder="Paste URL gambar (https://...)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full sm:flex-1 h-9 px-3 text-sm border rounded bg-background"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddImage} className="flex-1 sm:flex-initial">Tambah URL</Button>
            <label className="cursor-pointer flex-1 sm:flex-initial inline-flex items-center justify-center text-xs h-9 px-3 rounded border bg-background hover:bg-muted font-medium">
              Upload File
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      )}

      {/* Popover Insert Video Mobile Friendly */}
      {showVideoModal && (
        <div className="p-3 bg-muted/60 border-b flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            placeholder="Paste link YouTube (https://www.youtube.com/watch?v=...)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full sm:flex-1 h-9 px-3 text-sm border rounded bg-background"
          />
          <Button size="sm" onClick={handleAddYoutube}>Embed Video</Button>
        </div>
      )}

      {/* Konten Editor responsif */}
      <div className="p-4 min-h-[300px] prose dark:prose-invert max-w-none focus:outline-none break-words">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

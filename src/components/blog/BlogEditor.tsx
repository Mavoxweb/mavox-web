"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Node, mergeAttributes } from "@tiptap/core";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  type NodeViewProps,
} from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  ImagePlus,
  Link2,
  Megaphone,
  Undo2,
  Redo2,
  Loader2,
  Trash2,
  AlertCircle,
} from "lucide-react";

function CtaBlockView({ deleteNode }: NodeViewProps) {
  return (
    <NodeViewWrapper
      className="blog-cta-editor"
      contentEditable={false}
      data-blog-cta="manual"
    >
      <div className="blog-cta-editor-copy">
        <span className="blog-cta-kicker">CTA</span>
        <strong>Bloco de chamada para ação</strong>
        <span>Solicite Orçamento + Fale no WhatsApp</span>
      </div>
      <button
        type="button"
        onClick={() => deleteNode()}
        className="blog-editor-icon-btn"
        title="Remover CTA"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </NodeViewWrapper>
  );
}

const CtaBlock = Node.create({
  name: "ctaBlock",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  parseHTML() {
    return [{ tag: "div[data-blog-cta]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-blog-cta": "manual",
        class: "blog-cta",
      }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(CtaBlockView);
  },
});

interface BlogEditorProps {
  value: string;
  onChange: (html: string) => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`blog-editor-tool ${active ? "is-active" : ""}`}
    >
      {children}
    </button>
  );
}

function Toolbar({
  editor,
  onPickImage,
  uploading,
}: {
  editor: Editor;
  onPickImage: () => void;
  uploading: boolean;
}) {
  const setLink = useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL do link", previous || "https://");
    if (url === null) return;

    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  }, [editor]);

  return (
    <div className="blog-editor-toolbar">
      <div className="blog-editor-group">
        <ToolbarButton
          title="Desfazer"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Refazer"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div className="blog-editor-group">
        <ToolbarButton
          title="Título H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Título H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Negrito"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Itálico"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Riscado"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Link"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div className="blog-editor-group">
        <ToolbarButton
          title="Lista"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Lista numerada"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Citação"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Bloco de código"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Divisor"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div className="blog-editor-group">
        <ToolbarButton
          title="Inserir imagem"
          onClick={onPickImage}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImagePlus className="w-4 h-4" />
          )}
        </ToolbarButton>
        <ToolbarButton
          title="Inserir CTA"
          onClick={() => editor.chain().focus().insertContent({ type: "ctaBlock" }).run()}
        >
          <Megaphone className="w-4 h-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}

export default function BlogEditor({ value, onChange }: BlogEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: "blog-editor-image" },
      }),
      Placeholder.configure({
        placeholder: "Comece a escrever o artigo…",
      }),
      CtaBlock,
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class: "blog-editor-content",
        "aria-label": "Conteúdo do artigo",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value === editor.getHTML()) return;
    editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
  }, [editor, value]);

  const uploadImage = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;

      setUploading(true);
      setUploadError("");
      try {
        const body = new FormData();
        body.append("file", file);

        const response = await fetch("/api/painel/blog/upload", {
          method: "POST",
          body,
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          setUploadError(data.error || "Falha no upload da imagem.");
          return;
        }

        editor
          ?.chain()
          .focus()
          .setImage({ src: data.url, alt: file.name })
          .run();
      } catch {
        setUploadError("Falha no upload da imagem.");
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  if (!editor) {
    return (
      <div className="blog-editor-shell">
        <div className="blog-editor-loading">
          <Loader2 className="w-5 h-5 animate-spin" /> Carregando editor…
        </div>
      </div>
    );
  }

  return (
    <div
      className="blog-editor-shell"
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes("Files")) event.preventDefault();
      }}
      onDrop={(event) => {
        const file = event.dataTransfer.files?.[0];
        if (!file) return;
        event.preventDefault();
        uploadImage(file);
      }}
      onPaste={(event) => {
        const file = event.clipboardData.files?.[0];
        if (!file) return;
        event.preventDefault();
        uploadImage(file);
      }}
    >
      <Toolbar
        editor={editor}
        uploading={uploading}
        onPickImage={() => fileInputRef.current?.click()}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) uploadImage(file);
          event.target.value = "";
        }}
      />

      {uploadError && (
        <p className="blog-editor-error">
          <AlertCircle className="w-4 h-4" /> {uploadError}
        </p>
      )}

      <EditorContent editor={editor} className="blog-editor-surface" />

      <p className="blog-editor-hint">
        Arraste imagens para o editor ou cole com Ctrl+V. As imagens são
        enviadas automaticamente.
      </p>
    </div>
  );
}

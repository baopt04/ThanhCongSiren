import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";
import "./RichTextEditor.css";

export function RichTextEditor({ value = "", onChange, placeholder = "Nhập nội dung..." }) {
  const editorRef = useRef(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "rich-editor-content",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value]);

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive("bold") ? "active" : ""}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive("italic") ? "active" : ""}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          className={editor?.isActive("strike") ? "active" : ""}
        >
          S
        </button>
        <span className="toolbar-divider" />
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor?.isActive("heading", { level: 2 }) ? "active" : ""}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor?.isActive("heading", { level: 3 }) ? "active" : ""}
        >
          H3
        </button>
        <span className="toolbar-divider" />
        <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={editor?.isActive("bulletList") ? "active" : ""}>
          •
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={editor?.isActive("orderedList") ? "active" : ""}>
          1.
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={editor?.isActive("blockquote") ? "active" : ""}>
          "
        </button>
      </div>
      <EditorContent editor={editor} className="rich-editor-body" />
    </div>
  );
}

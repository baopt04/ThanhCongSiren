import { useEditor, EditorContent } from "@tiptap/react";
import { Extension, Mark, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import { useState, useEffect, useRef, useMemo } from "react";
import { Modal, Popconfirm, ColorPicker, Input, Checkbox, Button, Space, Tooltip } from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  LinkOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";
import { getYouTubeVideoId } from "../../utils/youtubeUtils";
import "./RichTextEditor.css";

// Extension hỗ trợ căn lề (Trái, Giữa, Phải) cho paragraph, heading, blockquote, listItem
const TextAlign = Extension.create({
  name: "textAlign",

  addOptions() {
    return {
      types: ["heading", "paragraph", "blockquote", "listItem"],
      alignments: ["left", "center", "right"],
      defaultAlignment: null,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseHTML: (element) => {
              const alignment = element.style?.textAlign;
              return this.options.alignments.includes(alignment)
                ? alignment
                : this.options.defaultAlignment;
            },
            renderHTML: (attributes) => {
              if (
                !attributes.textAlign ||
                !this.options.alignments.includes(attributes.textAlign)
              ) {
                return {};
              }
              return { style: `text-align: ${attributes.textAlign}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment) =>
        ({ commands }) => {
          if (!this.options.alignments.includes(alignment)) {
            return false;
          }
          return this.options.types
            .map((type) => commands.updateAttributes(type, { textAlign: alignment }))
            .some((response) => response);
        },

      unsetTextAlign:
        () =>
        ({ commands }) => {
          return this.options.types
            .map((type) => commands.resetAttributes(type, "textAlign"))
            .some((response) => response);
        },

      toggleTextAlign:
        (alignment) =>
        ({ editor, commands }) => {
          if (!this.options.alignments.includes(alignment)) {
            return false;
          }
          if (editor.isActive({ textAlign: alignment })) {
            return commands.unsetTextAlign();
          }
          return commands.setTextAlign(alignment);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-l": () => this.editor.commands.setTextAlign("left"),
      "Mod-Shift-e": () => this.editor.commands.setTextAlign("center"),
      "Mod-Shift-r": () => this.editor.commands.setTextAlign("right"),
    };
  },
});

// Mark hỗ trợ đổi màu chữ (Text Color)
const TextColorMark = Mark.create({
  name: "textColor",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.color || null,
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {};
          }
          return {
            style: `color: ${attributes.color}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[style*='color']",
        getAttrs: (element) => {
          const color = element.style.color;
          return color ? { color } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setColor:
        (color) =>
        ({ chain }) => {
          return chain().setMark(this.name, { color }).run();
        },
      unsetColor:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name).run();
        },
    };
  },
});

const COLOR_PRESETS = [
  {
    label: "Màu phổ biến",
    colors: [
      "#0f172a",
      "#d90429",
      "#2563eb",
      "#16a34a",
      "#d97706",
      "#7c3aed",
      "#475569",
    ],
  },
];

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      size: {
        default: "medium",
        parseHTML: (element) => element.getAttribute("data-size") || "medium",
        renderHTML: (attributes) => {
          return {
            "data-size": attributes.size || "medium",
          };
        },
      },
    };
  },
});

export function RichTextEditor({
  value = "",
  onChange,
  onUploadImage,
  onDeleteImage,
  placeholder = "Nhập nội dung mô tả chi tiết...",
}) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImageMap, setDeletingImageMap] = useState({});
  const fileInputRef = useRef(null);

  // Link state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(true);
  const [savedSelectionRange, setSavedSelectionRange] = useState(null);
  const [isEditingExistingLink, setIsEditingExistingLink] = useState(false);
  const handleOpenLinkModalRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "editor-bullet-list",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "editor-ordered-list",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph", "blockquote", "listItem"],
      }),
      TextColorMark,
      CustomImage.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        isAllowedUri: () => true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        allowFullscreen: true,
        width: 640,
        height: 360,
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setRawHtml(html);
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: "rich-editor-content",
      },
      handleKeyDown: (view, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          handleOpenLinkModalRef.current?.();
          return true;
        }
        return false;
      },
    },
  });

  // Synchronize when value changes externally (e.g. form.setFieldsValue)
  useEffect(() => {
    if (value !== rawHtml) {
      setRawHtml(value || "");
      if (editor && editor.getHTML() !== value) {
        editor.commands.setContent(value || "", false);
      }
    }
  }, [value, editor]);

  // Extract all image URLs from content
  const contentImages = useMemo(() => {
    const html = isHtmlMode ? rawHtml : (editor ? editor.getHTML() : value || "");
    if (!html) return [];
    const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const urls = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      if (match[1] && !urls.includes(match[1])) {
        urls.push(match[1]);
      }
    }
    return urls;
  }, [rawHtml, editor, isHtmlMode, value]);

  // Delete image from editor and server
  const executeDeleteImage = async (imgUrl) => {
    if (!imgUrl) return;
    setDeletingImageMap((prev) => ({ ...prev, [imgUrl]: true }));
    try {
      if (onDeleteImage) {
        await onDeleteImage(imgUrl);
      }

      // Remove from ProseMirror editor doc
      if (editor) {
        const { state, dispatch } = editor.view;
        const tr = state.tr;
        let deleted = false;
        state.doc.descendants((node, pos) => {
          if (node.type.name === "image" && node.attrs.src === imgUrl) {
            tr.delete(pos, pos + node.nodeSize);
            deleted = true;
          }
        });
        if (deleted) {
          dispatch(tr);
        }
      }

      // Remove from raw HTML if any
      const currentHtml = editor ? editor.getHTML() : (rawHtml || "");
      const escaped = imgUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`<p>\\s*<img[^>]*src=["']${escaped}["'][^>]*>\\s*<\\/p>|<img[^>]*src=["']${escaped}["'][^>]*>`, "gi");
      const updatedHtml = currentHtml.replace(regex, "");
      setRawHtml(updatedHtml);
      onChange?.(updatedHtml);
    } finally {
      setDeletingImageMap((prev) => ({ ...prev, [imgUrl]: false }));
    }
  };

  // Handle delete selected image from toolbar
  const handleDeleteSelectedImage = () => {
    const currentSrc = editor?.getAttributes("image")?.src;
    if (!currentSrc) return;

    Modal.confirm({
      title: "Xác nhận xóa ảnh khỏi bài viết?",
      icon: <ExclamationCircleOutlined style={{ color: "#ef4444" }} />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa ảnh này khỏi hệ thống lưu trữ và nội dung bài viết không?</p>
          <div style={{ maxHeight: 120, overflow: "hidden", borderRadius: 6, margin: "8px 0", background: "#f8fafc", textAlign: "center" }}>
            <img src={currentSrc} alt="Preview" style={{ maxWidth: "100%", maxHeight: 120, objectFit: "contain" }} />
          </div>
        </div>
      ),
      okText: "Xóa ảnh",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => executeDeleteImage(currentSrc),
    });
  };

  // Toggle between visual WYSIWYG editor and raw HTML code editor
  const toggleHtmlMode = () => {
    if (isHtmlMode) {
      // Switch back from Raw HTML mode to Visual editor
      if (editor) {
        editor.commands.setContent(rawHtml || "", false);
      }
      onChange?.(rawHtml);
      setIsHtmlMode(false);
    } else {
      // Switch from Visual editor to Raw HTML mode
      const currentHtml = editor ? editor.getHTML() : value;
      setRawHtml(currentHtml || "");
      setIsHtmlMode(true);
    }
  };

  const handleRawHtmlChange = (e) => {
    const val = e.target.value;
    setRawHtml(val);
    onChange?.(val);
  };

  const addImageUrl = () => {
    const url = window.prompt(
      "Nhập đường dẫn URL hình ảnh (Ví dụ: https://cdn.yourapp.com/products/jdw450-1.jpg):"
    );
    if (url) {
      const alt = window.prompt("Nhập mô tả ảnh (alt - tùy chọn):") || "";
      editor?.chain().focus().setImage({ src: url, alt }).run();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // Reset file input

    if (onUploadImage) {
      setUploadingImage(true);
      try {
        const res = await onUploadImage(file);
        const url = res?.data?.url || res?.url;
        if (url) {
          const alt = file.name.replace(/\.[^/.]+$/, "");
          if (editor && !isHtmlMode) {
            editor.chain().focus().setImage({ src: url, alt }).run();
          } else {
            const imgTag = `\n<p><img src="${url}" alt="${alt}" /></p>\n`;
            setRawHtml((prev) => (prev ? prev + imgTag : imgTag));
            onChange?.((rawHtml || "") + imgTag);
          }
        }
      } catch (err) {
        console.error("Upload image error:", err);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleOpenLinkModal = () => {
    if (!editor) return;

    const { state } = editor;
    const { from, to, empty } = state.selection;
    setSavedSelectionRange({ from, to });

    const isLinkActive = editor.isActive("link");
    setIsEditingExistingLink(isLinkActive);

    const existingAttrs = editor.getAttributes("link");
    setLinkUrl(existingAttrs?.href || "");
    setLinkOpenInNewTab(existingAttrs?.target !== "_self");

    if (!empty) {
      const selectedText = state.doc.textBetween(from, to, " ");
      setLinkText(selectedText);
    } else if (isLinkActive) {
      const node = state.doc.nodeAt(from);
      setLinkText(node?.text || "");
    } else {
      setLinkText("");
    }

    setLinkModalOpen(true);
  };

  handleOpenLinkModalRef.current = handleOpenLinkModal;

  const handleUnlink = () => {
    if (!editor) return;
    if (savedSelectionRange) {
      const { from, to } = savedSelectionRange;
      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .extendMarkRange("link")
        .unsetLink()
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setLinkModalOpen(false);
  };

  const handleApplyLink = () => {
    if (!editor) return;
    const trimmedUrl = linkUrl.trim();
    if (!trimmedUrl) {
      handleUnlink();
      return;
    }

    // Auto-prefix https:// if no protocol and not a relative link
    let finalUrl = trimmedUrl;
    if (
      !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(finalUrl) &&
      !finalUrl.startsWith("/") &&
      !finalUrl.startsWith("#") &&
      !finalUrl.startsWith("./") &&
      !finalUrl.startsWith("../")
    ) {
      finalUrl = "https://" + finalUrl;
    }

    const target = linkOpenInNewTab ? "_blank" : "_self";
    const rel = linkOpenInNewTab ? "noopener noreferrer" : undefined;

    if (savedSelectionRange) {
      const { from, to } = savedSelectionRange;
      const isTextSelected = from !== to;
      const originalText = isTextSelected ? editor.state.doc.textBetween(from, to, " ") : "";

      if (linkText && linkText.trim() !== originalText) {
        editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .insertContent({
            type: "text",
            text: linkText.trim(),
            marks: [
              {
                type: "link",
                attrs: {
                  href: finalUrl,
                  target,
                  rel,
                },
              },
            ],
          })
          .run();
      } else if (isTextSelected) {
        editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .setLink({ href: finalUrl, target, rel })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "text",
            text: linkText.trim() || finalUrl,
            marks: [
              {
                type: "link",
                attrs: {
                  href: finalUrl,
                  target,
                  rel,
                },
              },
            ],
          })
          .run();
      }
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: finalUrl, target, rel })
        .run();
    }

    setLinkModalOpen(false);
  };

  const addYoutubeVideo = () => {
    const url = window.prompt(
      "Nhập đường dẫn URL video YouTube (Ví dụ: https://www.youtube.com/watch?v=... hoặc https://youtu.be/...):"
    );
    if (!url) return;
    if (editor && !isHtmlMode) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 360,
      });
    } else {
      const videoId = getYouTubeVideoId(url);
      if (videoId) {
        const iframeTag = `\n<div class="pd-video-embed-wrap"><div class="pd-video-box"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>\n`;
        setRawHtml((prev) => (prev ? prev + iframeTag : iframeTag));
        onChange?.((rawHtml || "") + iframeTag);
      }
    }
  };

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar">
        {!isHtmlMode && (
          <>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={editor?.isActive("bold") ? "active" : ""}
              title="In đậm (Bold - Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={editor?.isActive("italic") ? "active" : ""}
              title="In nghiêng (Italic - Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              className={editor?.isActive("strike") ? "active" : ""}
              title="Gạch ngang"
            >
              <s>S</s>
            </button>

            {/* Đổi màu chữ */}
            <ColorPicker
              size="small"
              presets={COLOR_PRESETS}
              value={editor?.getAttributes("textColor")?.color || "#0f172a"}
              onChangeComplete={(color) => {
                editor?.chain().focus().setColor(color.toHexString()).run();
              }}
              onClear={() => {
                editor?.chain().focus().unsetColor().run();
              }}
              allowClear
            >
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                className={`toolbar-btn-color ${editor?.isActive("textColor") ? "active" : ""}`}
                title="Đổi màu chữ (Text Color)"
              >
                <span className="toolbar-color-letter">A</span>
                <span
                  className="toolbar-color-bar"
                  style={{
                    backgroundColor: editor?.getAttributes("textColor")?.color || "#d90429",
                  }}
                />
              </button>
            </ColorPicker>

            <span className="toolbar-divider" />

            {/* Căn lề: Trái, Giữa, Phải */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().setTextAlign("left").run()}
              className={editor?.isActive({ textAlign: "left" }) ? "active" : ""}
              title="Căn lề trái"
            >
              <AlignLeftOutlined />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleTextAlign("center").run()}
              className={editor?.isActive({ textAlign: "center" }) ? "active" : ""}
              title="Căn giữa nội dung"
            >
              <AlignCenterOutlined />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleTextAlign("right").run()}
              className={editor?.isActive({ textAlign: "right" }) ? "active" : ""}
              title="Căn lề phải"
            >
              <AlignRightOutlined />
            </button>

            <span className="toolbar-divider" />

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor?.isActive("heading", { level: 2 }) ? "active" : ""}
              title="Tiêu đề H2"
            >
              H2
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor?.isActive("heading", { level: 3 }) ? "active" : ""}
              title="Tiêu đề H3"
            >
              H3
            </button>

            <span className="toolbar-divider" />

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={editor?.isActive("bulletList") ? "active" : ""}
              title="Danh sách gạch đầu dòng (•)"
            >
              • Danh sách
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={editor?.isActive("orderedList") ? "active" : ""}
              title="Danh sách số thứ tự (1, 2, 3...)"
            >
              1. Thứ tự
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              className={editor?.isActive("blockquote") ? "active" : ""}
              title="Trích dẫn (Blockquote)"
            >
              &ldquo;
            </button>

            <span className="toolbar-divider" />

            {/* Gắn link / Liên kết */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleOpenLinkModal}
              className={`toolbar-btn-link ${editor?.isActive("link") ? "active" : ""}`}
              title="Gắn liên kết (Bôi đen đoạn chữ rồi bấm để chèn link, hoặc phím tắt Ctrl+K)"
            >
              <LinkOutlined /> Gắn link
            </button>
            {editor?.isActive("link") && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleUnlink}
                className="toolbar-btn-unlink"
                title="Gỡ liên kết khỏi đoạn chữ này"
              >
                <DisconnectOutlined /> Gỡ link
              </button>
            )}

            <span className="toolbar-divider" />

            {/* Cloudinary upload button */}
            {onUploadImage && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Chọn ảnh từ máy tính để tải lên Cloudinary và chèn vào vị trí con trỏ"
                  className="toolbar-btn-upload"
                  disabled={uploadingImage}
                >
                  📁 {uploadingImage ? "Đang tải ảnh..." : "Tải ảnh từ máy"}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </>
            )}

            <button
              type="button"
              onClick={addYoutubeVideo}
              className="toolbar-btn-youtube"
              title="Chèn video từ YouTube"
            >
              ▶️ Video YouTube
            </button>

            {/* Image size controls when an image is selected */}
            {editor?.isActive("image") && (
              <>
                <span className="toolbar-divider" />
                <div className="image-toolbar-group">
                  <span className="image-toolbar-label">Cỡ ảnh:</span>
                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().updateAttributes("image", { size: "small" }).run()
                    }
                    className={editor.getAttributes("image").size === "small" ? "active" : ""}
                    title="Thu nhỏ (240px)"
                  >
                    Nhỏ
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().updateAttributes("image", { size: "medium" }).run()
                    }
                    className={
                      !editor.getAttributes("image").size ||
                      editor.getAttributes("image").size === "medium"
                        ? "active"
                        : ""
                    }
                    title="Vừa tầm bao quát (420px - Mặc định)"
                  >
                    Vừa
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().updateAttributes("image", { size: "large" }).run()
                    }
                    className={editor.getAttributes("image").size === "large" ? "active" : ""}
                    title="Lớn (600px)"
                  >
                    Lớn
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().updateAttributes("image", { size: "full" }).run()
                    }
                    className={editor.getAttributes("image").size === "full" ? "active" : ""}
                    title="Toàn chiều rộng (100%)"
                  >
                    Đầy đủ
                  </button>
                </div>
              </>
            )}

            {/* Delete active selected image */}
            {onDeleteImage && editor?.isActive("image") && (
              <button
                type="button"
                onClick={handleDeleteSelectedImage}
                className="toolbar-btn-delete"
                title="Xóa ảnh đang chọn khỏi Cloudinary và nội dung"
              >
                <DeleteOutlined /> Xóa ảnh
              </button>
            )}
          </>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
          <button
            type="button"
            onClick={toggleHtmlMode}
            className={`btn-html-mode ${isHtmlMode ? "active-html" : ""}`}
            title="Chuyển đổi giữa chế độ Soạn thảo trực quan và Mã nguồn HTML"
          >
            {isHtmlMode ? "👁️ Soạn thảo trực quan" : "</> Mã nguồn HTML"}
          </button>
        </div>
      </div>

      {isHtmlMode ? (
        <div className="rich-editor-html-container">
          <div className="rich-editor-html-notice">
            <span>💻 <strong>Chế độ Mã nguồn HTML:</strong> Bạn có thể gõ hoặc dán trực tiếp mã HTML (&lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;img src="..." /&gt;, &lt;strong&gt;...).</span>
          </div>
          <textarea
            value={rawHtml}
            onChange={handleRawHtmlChange}
            className="rich-editor-html-textarea"
            placeholder="<p>Nhập hoặc dán mã HTML vào đây...</p>"
            rows={10}
            spellCheck={false}
          />
        </div>
      ) : (
        <EditorContent editor={editor} className="rich-editor-body" />
      )}

      {/* Images manager list inside content */}
      {onDeleteImage && contentImages.length > 0 && (
        <div className="rich-editor-images-panel">
          <div className="rich-editor-images-header">
            <span>📸 Ảnh trong nội dung ({contentImages.length})</span>
            <span style={{ fontSize: 11, color: "#64748b" }}>
              Bấm nút &quot;Xóa&quot; để xóa ảnh khỏi Cloudinary và gỡ khỏi nội dung
            </span>
          </div>
          <div className="rich-editor-images-list">
            {contentImages.map((src, index) => {
              const fileName = src.split("/").pop()?.split("?")[0] || `Ảnh ${index + 1}`;
              const isDeleting = deletingImageMap[src];
              return (
                <div key={src + index} className="rich-editor-image-item">
                  <img src={src} alt={fileName} />
                  <div className="rich-editor-image-info">
                    <span className="rich-editor-image-name" title={src}>
                      {fileName}
                    </span>
                    <Popconfirm
                      title="Xác nhận xóa ảnh"
                      description="Bạn có chắc chắn muốn xóa ảnh này khỏi hệ thống lưu trữ và nội dung bài viết?"
                      okText="Xóa ảnh"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true, loading: isDeleting }}
                      onConfirm={() => executeDeleteImage(src)}
                    >
                      <button
                        type="button"
                        className="btn-delete-img-item"
                        disabled={isDeleting}
                        title="Xóa ảnh khỏi Cloudinary & bài viết"
                      >
                        <DeleteOutlined /> {isDeleting ? "Đang xóa..." : "Xóa"}
                      </button>
                    </Popconfirm>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal gắn liên kết / chèn link */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
            <LinkOutlined style={{ color: "#2563eb" }} />
            {isEditingExistingLink ? "Chỉnh sửa liên kết" : "Gắn liên kết tới trang"}
          </div>
        }
        open={linkModalOpen}
        onCancel={() => setLinkModalOpen(false)}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              {isEditingExistingLink && (
                <Button danger type="text" icon={<DisconnectOutlined />} onClick={handleUnlink}>
                  Gỡ liên kết
                </Button>
              )}
            </div>
            <Space>
              <Button onClick={() => setLinkModalOpen(false)}>Hủy</Button>
              <Button type="primary" onClick={handleApplyLink} disabled={!linkUrl.trim()}>
                {isEditingExistingLink ? "Cập nhật" : "Gắn link"}
              </Button>
            </Space>
          </div>
        }
        width={480}
        destroyOnClose
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 8 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: "#334155" }}>
              Văn bản hiển thị:
            </label>
            <Input
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Đoạn chữ được hiển thị có chứa link..."
              allowClear
            />
            <span style={{ fontSize: 12, color: "#64748b", marginTop: 4, display: "block" }}>
              {savedSelectionRange && savedSelectionRange.from !== savedSelectionRange.to
                ? "💡 Đoạn chữ bạn vừa bôi đen trong bài viết."
                : "💡 Nhập chữ muốn hiển thị hoặc để trống để hiển thị đường dẫn."}
            </span>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: "#334155" }}>
              Đường dẫn liên kết (URL): <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Ví dụ: https://thanhcong.vn hoặc /san-pham/coi-bao-dong"
              allowClear
              onPressEnter={handleApplyLink}
              autoFocus
            />
            <span style={{ fontSize: 12, color: "#64748b", marginTop: 4, display: "block" }}>
              Hỗ trợ link ngoài trang (<code>https://...</code>) hoặc link trong trang (<code>/san-pham/...</code>).
            </span>
          </div>

          <div style={{ marginTop: 2 }}>
            <Checkbox
              checked={linkOpenInNewTab}
              onChange={(e) => setLinkOpenInNewTab(e.target.checked)}
            >
              <span style={{ fontSize: 13, color: "#334155" }}>
                Mở liên kết trong tab mới (khuyên dùng khi trỏ đến trang khác)
              </span>
            </Checkbox>
          </div>
        </div>
      </Modal>
    </div>
  );
}

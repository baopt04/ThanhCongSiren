import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Tooltip, message } from "antd";
import {
  UnorderedListOutlined,
  OrderedListOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ClearOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import "./ShortDescriptionInput.css";

/**
 * ShortDescriptionInput — Trình nhập mô tả tóm tắt thông minh:
 * 1. Hỗ trợ đánh dấu danh sách (Bullet `• `, Dash `- `, Numbered `1. `)
 * 2. Tự động thêm dấu chấm danh sách khi nhấn phím Enter (auto-bullet)
 * 3. Cho phép thu nhỏ và kéo rộng ô nhập (Resize dọc tự do + nút Mở rộng/Thu gọn)
 * 4. Đếm số ký tự và tích hợp mượt mà với Ant Design Form.Item
 */
export const ShortDescriptionInput = forwardRef(function ShortDescriptionInput(
  {
    value = "",
    onChange,
    placeholder = "Nhập mô tả tóm tắt về đặc điểm nổi bật, ứng dụng của sản phẩm...",
    maxLength = 500,
    rows = 3,
    disabled = false,
  },
  ref
) {
  const textareaRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Expose focus/blur methods to Ant Design Form
  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    blur: () => textareaRef.current?.blur(),
    textArea: textareaRef.current,
  }));

  const currentLength = (value || "").length;
  const isNearLimit = maxLength && currentLength >= maxLength * 0.9;

  // Insert or toggle list markers (•, 1., -)
  const handleInsertMarker = (type = "bullet") => {
    if (disabled) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selStart = textarea.selectionStart;
    const selEnd = textarea.selectionEnd;
    const currentVal = value || "";

    // Case 1: Multi-line selection
    if (selStart !== selEnd) {
      const lineStart = currentVal.lastIndexOf("\n", selStart - 1) + 1;
      let lineEnd = currentVal.indexOf("\n", selEnd);
      if (lineEnd === -1) lineEnd = currentVal.length;

      const before = currentVal.slice(0, lineStart);
      const targetLines = currentVal.slice(lineStart, lineEnd).split("\n");
      const after = currentVal.slice(lineEnd);

      const modifiedLines = targetLines.map((line, idx) => {
        const cleaned = line.replace(/^\s*([•\-\*]|\d+\.)\s*/, "");
        if (!cleaned.trim()) return line;
        if (type === "bullet") return `• ${cleaned}`;
        if (type === "dash") return `- ${cleaned}`;
        if (type === "number") return `${idx + 1}. ${cleaned}`;
        return cleaned; // remove
      });

      const newContent = before + modifiedLines.join("\n") + after;
      if (maxLength && newContent.length > maxLength) {
        message.warning(`Nội dung vượt quá giới hạn ${maxLength} ký tự!`);
        return;
      }

      onChange?.(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = lineStart;
        textarea.selectionEnd = lineStart + modifiedLines.join("\n").length;
      }, 0);
      return;
    }

    // Case 2: Single cursor position
    const lineStart = currentVal.lastIndexOf("\n", selStart - 1) + 1;
    let lineEnd = currentVal.indexOf("\n", selStart);
    if (lineEnd === -1) lineEnd = currentVal.length;

    const currentLine = currentVal.slice(lineStart, lineEnd);
    const prefix =
      type === "bullet" ? "• " : type === "dash" ? "- " : "1. ";

    // If current line already has this prefix, remove it (toggle off)
    if (
      (type === "bullet" && currentLine.startsWith("• ")) ||
      (type === "dash" && currentLine.startsWith("- ")) ||
      (type === "number" && /^\d+\.\s/.test(currentLine)) ||
      type === "remove"
    ) {
      const cleaned = currentLine.replace(/^\s*([•\-\*]|\d+\.)\s*/, "");
      const newContent =
        currentVal.slice(0, lineStart) + cleaned + currentVal.slice(lineEnd);
      onChange?.(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = Math.max(
          lineStart,
          selStart - prefix.length
        );
      }, 0);
      return;
    }

    // Otherwise prepend marker to current line
    const cleaned = currentLine.replace(/^\s*([•\-\*]|\d+\.)\s*/, "");
    const newLine = prefix + cleaned;
    const newContent =
      currentVal.slice(0, lineStart) + newLine + currentVal.slice(lineEnd);

    if (maxLength && newContent.length > maxLength) {
      message.warning(`Nội dung vượt quá giới hạn ${maxLength} ký tự!`);
      return;
    }

    onChange?.(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd =
        lineStart + newLine.length;
    }, 0);
  };

  // Smart keyboard handler for Enter & Backspace
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "Enter" && !e.shiftKey) {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const selStart = textarea.selectionStart;
      const selEnd = textarea.selectionEnd;
      const currentVal = value || "";

      // Find current line bounds
      const lineStart = currentVal.lastIndexOf("\n", selStart - 1) + 1;
      let lineEnd = currentVal.indexOf("\n", selStart);
      if (lineEnd === -1) lineEnd = currentVal.length;

      const currentLine = currentVal.slice(lineStart, selStart);

      // 1. Bullet list check (• or - or *)
      const bulletMatch = currentLine.match(/^(\s*)([•\-\*])\s*(.*)$/);
      if (bulletMatch) {
        const [, indent, bullet, textAfter] = bulletMatch;
        // User pressed Enter on empty bullet line -> exit list
        if (!textAfter.trim() && selStart === lineStart + currentLine.length) {
          e.preventDefault();
          const newVal =
            currentVal.slice(0, lineStart) + currentVal.slice(selStart);
          onChange?.(newVal);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = lineStart;
          }, 0);
          return;
        }

        // Auto-insert next bullet
        e.preventDefault();
        const insertText = `\n${indent}${bullet} `;
        const newVal =
          currentVal.slice(0, selStart) +
          insertText +
          currentVal.slice(selEnd);

        if (maxLength && newVal.length > maxLength) return;

        onChange?.(newVal);
        const newCursorPos = selStart + insertText.length;
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        }, 0);
        return;
      }

      // 2. Numbered list check (1., 2., ...)
      const numberMatch = currentLine.match(/^(\s*)(\d+)\.\s*(.*)$/);
      if (numberMatch) {
        const [, indent, numStr, textAfter] = numberMatch;
        const currentNum = parseInt(numStr, 10);

        // User pressed Enter on empty number line -> exit list
        if (!textAfter.trim() && selStart === lineStart + currentLine.length) {
          e.preventDefault();
          const newVal =
            currentVal.slice(0, lineStart) + currentVal.slice(selStart);
          onChange?.(newVal);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = lineStart;
          }, 0);
          return;
        }

        // Auto-increment number
        e.preventDefault();
        const nextNum = currentNum + 1;
        const insertText = `\n${indent}${nextNum}. `;
        const newVal =
          currentVal.slice(0, selStart) +
          insertText +
          currentVal.slice(selEnd);

        if (maxLength && newVal.length > maxLength) return;

        onChange?.(newVal);
        const newCursorPos = selStart + insertText.length;
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        }, 0);
        return;
      }
    }
  };

  return (
    <div
      className={`short-desc-input-wrapper ${
        isExpanded ? "is-expanded" : ""
      } ${disabled ? "is-disabled" : ""}`}
    >
      {/* Thanh công cụ danh sách & thu phóng */}
      <div className="short-desc-toolbar">
        <div className="short-desc-toolbar-left">
          <Tooltip title="Thêm dấu chấm danh sách (•) — Nhấn Enter ở mỗi dòng sẽ tự động thêm dấu chấm tiếp theo">
            <button
              type="button"
              className="short-desc-btn"
              onClick={() => handleInsertMarker("bullet")}
              disabled={disabled}
            >
              <UnorderedListOutlined />
              <span>• Danh sách</span>
            </button>
          </Tooltip>

          <Tooltip title="Thêm danh sách số thứ tự (1. 2. 3...)">
            <button
              type="button"
              className="short-desc-btn"
              onClick={() => handleInsertMarker("number")}
              disabled={disabled}
            >
              <OrderedListOutlined />
              <span>1. Số thứ tự</span>
            </button>
          </Tooltip>

          <Tooltip title="Thêm gạch đầu dòng (-)">
            <button
              type="button"
              className="short-desc-btn"
              onClick={() => handleInsertMarker("dash")}
              disabled={disabled}
            >
              <MinusOutlined />
              <span>- Gạch ngang</span>
            </button>
          </Tooltip>

          <Tooltip title="Xóa bỏ đánh dấu danh sách ở dòng đang chọn">
            <button
              type="button"
              className="short-desc-btn short-desc-btn-clear"
              onClick={() => handleInsertMarker("remove")}
              disabled={disabled}
            >
              <ClearOutlined />
              <span>Bỏ dấu</span>
            </button>
          </Tooltip>
        </div>

        <div className="short-desc-toolbar-right">
          <Tooltip
            title={
              isExpanded
                ? "Thu nhỏ ô nhập về kích thước ban đầu"
                : "Mở rộng ô nhập để xem toàn bộ nội dung thuận tiện hơn"
            }
          >
            <button
              type="button"
              className={`short-desc-btn short-desc-btn-expand ${
                isExpanded ? "active" : ""
              }`}
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={disabled}
            >
              {isExpanded ? (
                <>
                  <FullscreenExitOutlined />
                  <span>Thu nhỏ</span>
                </>
              ) : (
                <>
                  <FullscreenOutlined />
                  <span>Mở rộng</span>
                </>
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Vùng nhập Text Area với khả năng kéo co giãn tự do */}
      <div className="short-desc-textarea-container">
        <textarea
          ref={textareaRef}
          className="short-desc-textarea"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={isExpanded ? 10 : rows}
          disabled={disabled}
        />
      </div>

      {/* Chân ô nhập: Hướng dẫn nhanh & Đếm ký tự */}
      <div className="short-desc-footer">
        <span className="short-desc-hint">
          💡 <strong>Mẹo:</strong> Nhấn <kbd>Enter</kbd> để tạo dòng danh sách tiếp theo. Nhấn <kbd>Enter</kbd> 2 lần để thoát danh sách. Có thể kéo góc dưới bên phải để mở rộng tùy ý.
        </span>
        {maxLength && (
          <span
            className={`short-desc-counter ${isNearLimit ? "near-limit" : ""}`}
          >
            {currentLength} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

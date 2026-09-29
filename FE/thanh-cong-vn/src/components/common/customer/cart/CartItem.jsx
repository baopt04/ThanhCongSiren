import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function CartItem({ item, onUpdateQty, onRemove }) {
  const [localQty, setLocalQty] = useState(item.quantity || 1);

  useEffect(() => {
    setLocalQty(item.quantity || 1);
  }, [item.quantity]);

  const formatPrice = (price) =>
    price ? price.toLocaleString("vi-VN") + "đ" : "Liên hệ";

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQty(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    onUpdateQty(item.id, item.quantity + 1);
  };

  const handleInputChange = (e) => {
    setLocalQty(e.target.value);
  };

  const handleInputBlur = () => {
    const val = parseInt(localQty, 10);
    if (!isNaN(val) && val >= 1) {
      if (val !== item.quantity) {
        onUpdateQty(item.id, val);
      }
    } else {
      setLocalQty(item.quantity || 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  const subtotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);

  return (
    <div className="cart-item-card">
      {/* 1. Thumbnail Image */}
      <div className="cart-item-img-wrap">
        <img
          src={
            item.image ||
            "https://cdn0344.cdn4s.com/media/2022/coi%20bao%20dong/jdw245pk/coi-hu-bao-xa-lu-lap-dat-tai-nha-dieu-hanh-thuy-dien-sapa.jpg"
          }
          alt={item.name}
          onError={(e) => {
            e.target.src =
              "https://cdn0344.cdn4s.com/media/2022/coi%20bao%20dong/jdw245pk/coi-bao-dong-lk-jdw245pk-lap-tai-nha-may-thuy-dien-song-hinh.jpg";
          }}
        />
      </div>

      {/* 2. Product Information */}
      <div className="cart-item-info">
        <Link
          to={`/san-pham/${item.productId || item.id || item.slug || ""}`}
          className="cart-item-title"
        >
          {item.name}
        </Link>
        {item.sku && <span className="cart-item-sku">Mã SP: {item.sku}</span>}
        <div className="cart-item-spec">
          {item.brand && <span className="cart-spec-pill">{item.brand}</span>}
          {item.warranty && (
            <span className="cart-spec-pill warranty">BH {item.warranty}</span>
          )}
        </div>
      </div>

      {/* 3. Unit Price */}
      <div className="cart-item-unit-price">
        <span className="cart-mobile-label">Đơn giá:</span>
        <span className="cart-price-val">{formatPrice(item.price)}</span>
      </div>

      {/* 4. Quantity Stepper */}
      <div className="cart-item-stepper">
        <span className="cart-mobile-label">Số lượng:</span>
        <div className="cart-stepper-box">
          <button
            type="button"
            className="cart-stepper-btn"
            onClick={handleDecrease}
            disabled={item.quantity <= 1}
            aria-label="Giảm số lượng"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            max="999"
            className="cart-stepper-input"
            value={localQty}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="cart-stepper-btn"
            onClick={handleIncrease}
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>
      </div>

      {/* 5. Subtotal */}
      <div className="cart-item-total">
        <span className="cart-mobile-label">Thành tiền:</span>
        <span className="cart-total-val">{formatPrice(subtotal)}</span>
      </div>

      {/* 6. Delete button */}
      <div className="cart-item-action">
        <button
          type="button"
          className="cart-remove-btn"
          onClick={() => onRemove(item.id)}
          title="Xóa khỏi giỏ hàng"
          aria-label="Xóa"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  );
}
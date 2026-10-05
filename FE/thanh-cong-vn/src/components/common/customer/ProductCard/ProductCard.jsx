import { memo } from "react";
import "./ProductCard.css";
import { Link } from "react-router-dom";
import {
  PhoneOutlined,
  EyeOutlined,
  ShoppingOutlined,
  StarFilled,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { prefetchProductDetail } from "../../../../hooks/queries/customerQueries";

export const ProductCard = memo(function ProductCard({
  id,
  slug,
  name,
  code,
  specs,
  price,
  oldPrice,
  image,
  badge = "Nổi Bật",
  isNew,
  categoryTag,
  rating = 5,
  defaultImg = "https://cdn0344.cdn4s.com/media/2022/coi%20bao%20dong/jdw245pk/coi-hu-bao-xa-lu-lap-dat-tai-nha-dieu-hanh-thuy-dien-sapa.jpg",
  variant = "catalog",
}) {
  const productLink = id ? `/san-pham/${id}` : (slug ? `/san-pham/${slug}` : "#");

  const handlePrefetch = () => {
    const target = id || slug;
    if (target) {
      prefetchProductDetail(target);
    }
  };

  // Resolve Primary Image (isPrimary === 1) & Hover Image (displayOrder === 0 or secondary image)
  let primaryImageUrl = defaultImg;
  let hoverImageUrl = null;

  if (Array.isArray(image) && image.length > 0) {
    // 1. Ảnh đại diện chính: isPrimary === 1
    const primaryObj =
      image.find(
        (item) =>
          item.isPrimary === 1 ||
          item.isPrimary === true ||
          item.isPrimary === "1"
      ) || image[0];

    primaryImageUrl = primaryObj?.imageUrl || defaultImg;

    // 2. Ảnh khi di chuyển chuột qua (hover):
    const hoverObj =
      image.find(
        (item) =>
          (item.displayOrder === 0 || item.displayOrder === "0") &&
          item !== primaryObj
      ) ||
      image.find(
        (item) =>
          (item.displayOrder === 1 || item.displayOrder === "1") &&
          item !== primaryObj
      ) ||
      image.find(
        (item) =>
          (item.isPrimary === 0 ||
            item.isPrimary === false ||
            item.isPrimary === "0") &&
          item !== primaryObj
      ) ||
      image.find((item) => item !== primaryObj);

    hoverImageUrl = hoverObj?.imageUrl || null;
  } else if (typeof image === "string" && image.trim()) {
    primaryImageUrl = image;
  } else if (image && typeof image === "object" && image.imageUrl) {
    primaryImageUrl = image.imageUrl;
  }

  // Format price if numeric or numeric string
  const numPrice = Number(price);
  const displayPrice =
    !isNaN(numPrice) && numPrice > 0
      ? `${numPrice.toLocaleString("vi-VN")} VND`
      : price || "Liên hệ báo giá";

  // Catalog variant matching user's photo & ProductCard.css
  if (variant === "catalog") {
    return (
      <div
        className="tc-catalog-card"
        id={`product-${code || name}`}
        onMouseEnter={handlePrefetch}
        onTouchStart={handlePrefetch}
      >
        {/* Top-Left Badge (Green "Nổi Bật" as in image) */}
        {badge && <div className="tc-catalog-badge">{badge}</div>}

        {/* Product Image + Hover Action Icons */}
        <div className="tc-catalog-thumb-box">
          <Link to={productLink} className="tc-catalog-thumb-link">
            <img
              src={primaryImageUrl}
              alt={name}
              loading="lazy"
              decoding="async"
              className={`tc-catalog-thumb ${hoverImageUrl ? "has-hover" : ""}`}
              onError={(e) => {
                e.target.src = defaultImg;
              }}
            />
            {hoverImageUrl && (
              <img
                src={hoverImageUrl}
                alt={`${name} hover`}
                loading="lazy"
                decoding="async"
                className="tc-catalog-thumb-hover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
          </Link>

          {/* Hover Quick Action Buttons (Bag & Eye) */}
          <div className="tc-catalog-hover-actions">
            <Link
              to={productLink}
              className="tc-catalog-action-btn"
              title="Thêm báo giá / giỏ hàng"
            >
              <ShoppingOutlined />
            </Link>
            <Link
              to={productLink}
              className="tc-catalog-action-btn"
              title="Xem nhanh chi tiết"
            >
              <EyeOutlined />
            </Link>
          </div>
        </div>

        {/* Content Box */}
        <div className="tc-catalog-content">
          <h3 className="tc-catalog-name">
            <Link to={productLink} title={name}>
              {name}
            </Link>
          </h3>

          {/* 5-Star Rating */}
          <div className="tc-catalog-rating">
            {[...Array(5)].map((_, i) => (
              <StarFilled
                key={i}
                className={i < rating ? "tc-star-active" : "tc-star-inactive"}
              />
            ))}
          </div>

          {/* Thin Divider Line */}
          <div className="tc-catalog-divider"></div>

          {/* Price */}
          <div className="tc-catalog-price-row">
            <span className="tc-catalog-price">{displayPrice}</span>
            {oldPrice && <span className="tc-catalog-old-price">{oldPrice}</span>}
          </div>
        </div>
      </div>
    );
  }

  // Classic default card
  return (
    <div
      className="tc-product-card"
      id={`product-${code || name}`}
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch}
    >
      {/* Badges */}
      <div className="tc-product-badges">
        {badge && <span className="tc-badge tc-badge-sale">{badge}</span>}
        {isNew && <span className="tc-badge tc-badge-new">MỚI</span>}
        {categoryTag && <span className="tc-badge tc-badge-tag">{categoryTag}</span>}
      </div>

      {/* Image Container */}
      <Link to={productLink} className="tc-product-thumb-wrapper">
        <img
          src={primaryImageUrl}
          alt={name}
          loading="lazy"
          decoding="async"
          className={`tc-product-thumb ${hoverImageUrl ? "has-hover" : ""}`}
          onError={(e) => {
            e.target.src = defaultImg;
          }}
        />
        {hoverImageUrl && (
          <img
            src={hoverImageUrl}
            alt={`${name} hover`}
            loading="lazy"
            decoding="async"
            className="tc-product-thumb-hover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
        <div className="tc-product-overlay">
          <span className="tc-product-overlay-btn">
            <EyeOutlined /> Xem chi tiết
          </span>
        </div>
      </Link>

      {/* Info Container */}
      <div className="tc-product-info">
        {code && (
          <span className="tc-product-code">
            Mã SP: <strong>{code}</strong>
          </span>
        )}

        <h3 className="tc-product-name">
          <Link to={productLink} title={name}>
            {name}
          </Link>
        </h3>

        {specs && <div className="tc-product-specs">{specs}</div>}

        <div className="tc-product-guarantee">
          <SafetyCertificateOutlined /> CO/CQ Gốc • Bảo hành 24 tháng
        </div>

        <div className="tc-product-bottom-row">
          <div className="tc-product-price-box">
            <span className="tc-product-price">{displayPrice}</span>
            {oldPrice && <span className="tc-product-old-price">{oldPrice}</span>}
          </div>

          <a
            href="tel:0865130088"
            className="tc-product-call-btn"
            title="Gọi tư vấn báo giá ngay"
          >
            <PhoneOutlined /> Báo giá
          </a>
        </div>
      </div>
    </div>
  );
});
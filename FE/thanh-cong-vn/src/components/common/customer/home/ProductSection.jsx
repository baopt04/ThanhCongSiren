import { memo, useState } from "react";
import { Link } from "react-router-dom";
import "./ProductSection.css";
import { PLACEHOLDER_IMAGE } from "../../../../utils/placeholder";

const getCardImage = (product) => {
  if (product.image && typeof product.image === "string") return product.image;
  if (Array.isArray(product.image) && product.image[0]?.imageUrl) return product.image[0].imageUrl;
  if (product.images?.imageUrl) return product.images.imageUrl;
  if (product.imageUrl) return product.imageUrl;
  if (product.thumbnail) return product.thumbnail;
  return PLACEHOLDER_IMAGE;
};

const formatCardPrice = (price) => {
  if (!price) return "Liên hệ báo giá";
  const num = Number(price);
  if (!isNaN(num) && num > 0) {
    return `${num.toLocaleString("vi-VN")} VNĐ`;
  }
  return String(price).includes("VNĐ") ? price : `${price} VNĐ`;
};

export const ProductSection = memo(function ProductSection({
  title,
  categorySlug,
  products = [],
  fallbackProducts = [],
  showButton = true,
  loading = false,
  isScrollableOnMobile = false,
}) {
  const targetSlug = categorySlug || "all";
  const viewAllPath = targetSlug === "all" ? "/san-pham" : `/san-pham/${targetSlug}`;
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      const progress = Math.min(Math.max(scrollLeft / maxScroll, 0), 1);
      setScrollProgress(progress);
    }
  };

  // Ensure exactly 4 cards are shown by supplementing with fallbacks if needed
  const rawList =
    products && products.length >= 4
      ? products
      : [...(products || []), ...fallbackProducts].slice(0, 4);
  const displayItems = rawList.slice(0, 4);

  if (!loading && displayItems.length === 0) {
    return null;
  }

  return (
    <section className="tc-home-section" id={`section-${targetSlug}`}>
      <div className="tc-section-container">
        {/* Section Header with red vertical bar indicator */}
        <div className="tc-section-header-modern">
          <div className="tc-section-title-wrap">
            <span className="tc-title-indicator" />
            <h2 className="tc-section-title-text">{title || "Sản phẩm"}</h2>
          </div>
          <Link to={viewAllPath} className="tc-section-more-link">
            Xem tất cả
          </Link>
        </div>

        {/* 4-Column Product Grid (Hoặc cuộn ngang trên mobile nếu isScrollableOnMobile) */}
        <div
          className={`tc-product-grid-4 ${
            isScrollableOnMobile ? "tc-product-scroll-mobile" : ""
          }`}
          onScroll={isScrollableOnMobile ? handleScroll : undefined}
        >
          {displayItems.map((item, idx) => {
            const productLink = item.id
              ? `/san-pham/${item.id}`
              : item.slug
              ? `/san-pham/${item.slug}`
              : viewAllPath;

            const imgSrc = getCardImage(item);
            const isPlaceholder = imgSrc === PLACEHOLDER_IMAGE || !imgSrc;

            return (
              <div
                key={item.id || item.code || item.slug || idx}
                className="tc-mock-product-card"
              >
                <Link to={productLink} className="tc-mock-card-img-wrap">
                  {!isPlaceholder ? (
                    <img
                      src={imgSrc}
                      alt={item.name || "Sản phẩm"}
                      className="tc-mock-card-img"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="tc-mock-img-placeholder">Ảnh sản phẩm</span>
                  )}
                </Link>

                <div className="tc-mock-card-body">
                  <h3 className="tc-mock-card-name" title={item.name}>
                    <Link to={productLink}>{item.name || "Tên sản phẩm"}</Link>
                  </h3>
                  <div className="tc-mock-card-price">
                    {formatCardPrice(item.price)}
                  </div>
                  {showButton && (
                    <Link to={productLink} className="tc-mock-card-btn">
                      Xem chi tiết
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Thanh chỉ báo cuộn ngang trên mobile */}
        {isScrollableOnMobile && (
          <div className="tc-mobile-scroll-indicator" aria-hidden="true">
            <span
              className="tc-scroll-bar-thumb"
              style={{
                transform: `translateX(${scrollProgress * 36}px)`,
                transition: "transform 0.05s ease-out",
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
});

export function ProductSectionSkeleton({ title = "Sản phẩm" }) {
  return (
    <section className="tc-home-section" aria-hidden="true">
      <div className="tc-section-container">
        <div className="tc-section-header-modern">
          <div className="tc-section-title-wrap">
            <span className="tc-title-indicator" />
            <h2 className="tc-section-title-text">{title}</h2>
          </div>
        </div>

        <div className="tc-product-grid-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="tc-mock-product-card" style={{ opacity: 0.6 }}>
              <div className="tc-mock-card-img-wrap">
                <span className="tc-mock-img-placeholder">Đang tải...</span>
              </div>
              <div className="tc-mock-card-body">
                <div style={{ height: 18, background: "#e2e8f0", borderRadius: 4, marginBottom: 8 }} />
                <div style={{ height: 16, width: "60%", background: "#fee2e2", borderRadius: 4, marginBottom: 14 }} />
                <div style={{ height: 36, background: "#e2e8f0", borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

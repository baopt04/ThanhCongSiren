import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  PhoneOutlined,
  LeftOutlined,
  RightOutlined,
  LoadingOutlined,
  ShoppingCartOutlined,
  ThunderboltOutlined
} from "@ant-design/icons";
import { message } from "antd";
import { detailProductForId } from "../../../../services/customer/CustomerProductService";
import { embedYoutubeInHtml } from "../../../../utils/youtubeUtils";
import { addToCart } from "../../../../utils/cartUtils";
import { isCustomerAuthenticated } from "../../../../utils/auth";
import { createCartItem } from "../../../../services/customer/CustomerCartService";
import "./ProductDetail.css";

export default function ProductDetail() {
  const navigate = useNavigate();
  const { id, param } = useParams();
  const productId = id || param;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await detailProductForId(productId);
        const data = res?.data || res;
        if (isMounted) {
          setProduct(data);
          setActiveImgIndex(0);
        }
      } catch (err) {
        console.error("Error loading product detail:", err);
        if (isMounted) setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (productId) fetchProduct();
    return () => { isMounted = false; };
  }, [productId]);

  // === Derived data from API response ===
  const productImages = product?.images
    ? [...product.images].sort((a, b) => {
      // isPrimary first, then by displayOrder
      if (a.isPrimary !== b.isPrimary) return b.isPrimary - a.isPrimary;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    }).map(img => img.imageUrl)
    : [];

  const activeImg = productImages[activeImgIndex] || productImages[0] || "";

  // Build specifications list from API map
  const technicalSpecs = [];
  if (product?.specifications) {
    Object.entries(product.specifications).forEach(([groupName, specs]) => {
      specs.forEach(spec => {
        technicalSpecs.push({
          label: spec.specName,
          value: spec.specValue,
        });
      });
    });
  }

  // Format price
  const formatPrice = (price) => {
    if (!price || price === 0) return "Liên hệ báo giá";
    return `${price.toLocaleString("vi-VN")} VND`;
  };

  // Calculate discount percentage
  const discountPercent = (product?.price && product?.salePrice && product.price > product.salePrice && product.salePrice > 0)
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : 0;

  const handlePrevImage = () => {
    setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : productImages.length - 1));
  };

  const handleNextImage = () => {
    setActiveImgIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0));
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      setAddingToCart(true);
      if (isCustomerAuthenticated()) {
        await createCartItem({
          productId: product.id,
          quantity: Number(quantity) || 1,
        });
        window.dispatchEvent(new Event("tc_cart_updated"));
      } else {
        addToCart(product, quantity);
      }
      message.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!`);
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err);
      message.error(
        err?.response?.data?.message ||
          err?.message ||
          "Thêm sản phẩm vào giỏ hàng thất bại!"
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      setAddingToCart(true);
      if (isCustomerAuthenticated()) {
        await createCartItem({
          productId: product.id,
          quantity: Number(quantity) || 1,
        });
        window.dispatchEvent(new Event("tc_cart_updated"));
      } else {
        addToCart(product, quantity);
      }
      navigate("/gio-hang");
    } catch (err) {
      console.error("Lỗi khi mua ngay:", err);
      message.error(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể thực hiện mua ngay!"
      );
    } finally {
      setAddingToCart(false);
    }
  };

  // === Loading State ===
  if (loading) {
    return (
      <div className="pd-page">
        <div className="pd-loading-state">
          <LoadingOutlined style={{ fontSize: 40, color: "#d90429" }} />
          <p>Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  // === Error State ===
  if (error || !product) {
    return (
      <div className="pd-page">
        <div className="pd-error-state">
          <h2>😔 {error || "Không tìm thấy sản phẩm"}</h2>
          <Link to="/" className="pd-btn-back">← Quay lại trang chủ</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-page">
      {/* Breadcrumb Navigation */}
      <nav className="pd-breadcrumb" aria-label="Breadcrumb">
        <div className="pd-breadcrumb-inner">
          <Link to="/" className="pd-crumb-link">Trang chủ</Link>
          <span className="pd-crumb-sep">›</span>
          {product.categoryName && (
            <>
              <span className="pd-crumb-link">{product.categoryName}</span>
              <span className="pd-crumb-sep">›</span>
            </>
          )}
          <span className="pd-crumb-active">{product.name}</span>
        </div>
      </nav>

      <div className="pd-container">
        {/* Main 2-Column Product Section */}
        <div className="pd-main-grid">

          {/* CỘT TRÁI: ẢNH SẢN PHẨM */}
          <div className="pd-gallery-col">
            {/* Dải ảnh thu nhỏ xếp theo chiều dọc */}
            {productImages.length > 0 && (
              <div className="pd-thumb-strip">
                {productImages.map((img, i) => (
                  <button
                    type="button"
                    key={i}
                    className={`pd-thumb-btn ${activeImgIndex === i ? "active" : ""}`}
                    onClick={() => setActiveImgIndex(i)}
                    onMouseEnter={() => setActiveImgIndex(i)}
                    title={`Xem ảnh ${i + 1}`}
                  >
                    <img src={img} alt={`Ảnh nhỏ ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Khung ảnh chính to */}
            <div className="pd-main-image-wrap">
              {product.isActive === 1 && <span className="pd-image-badge">Nổi Bật</span>}
              {activeImg ? (
                <img src={activeImg} alt={product.name} className="pd-main-image" />
              ) : (
                <div className="pd-no-image">Chưa có ảnh sản phẩm</div>
              )}

              {/* Nút điều hướng ảnh Trước / Sau */}
              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="pd-nav-arrow pd-nav-prev"
                    onClick={handlePrevImage}
                    title="Xem ảnh trước"
                    aria-label="Previous image"
                  >
                    <LeftOutlined />
                  </button>
                  <button
                    type="button"
                    className="pd-nav-arrow pd-nav-next"
                    onClick={handleNextImage}
                    title="Xem ảnh kế tiếp"
                    aria-label="Next image"
                  >
                    <RightOutlined />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN SẢN PHẨM */}
          <div className="pd-info-col">
            <h1 className="pd-title">
              {product.name}
            </h1>

            <div className="pd-meta-bar">
              {product.slug && (
                <>
                  <span className="pd-meta-item">Mã SP: <strong>{product.slug}</strong></span>
                  <span className="pd-meta-divider">•</span>
                </>
              )}
              {product.brandName && (
                <>
                  <span className="pd-meta-item">Thương hiệu: <strong>{product.brandName}</strong></span>
                  <span className="pd-meta-divider">•</span>
                </>
              )}
              <span className="pd-meta-item pd-stock-tag">
                {product.isActive === 1 ? "Còn hàng" : "Hết hàng"}
              </span>
            </div>

            {/* Giá sản phẩm */}
            <div className="pd-price-box">
              {product.salePrice > 0 ? (
                <>
                  <span className="pd-price-current">{formatPrice(product.salePrice)}</span>
                  {product.price > 0 && product.price !== product.salePrice && (
                    <span className="pd-price-old">{formatPrice(product.price)}</span>
                  )}
                  {discountPercent > 0 && (
                    <span className="pd-price-save">Tiết kiệm {discountPercent}%</span>
                  )}
                </>
              ) : product.price > 0 ? (
                <span className="pd-price-current">{formatPrice(product.price)}</span>
              ) : (
                <span className="pd-price-current pd-price-contact">Liên hệ báo giá</span>
              )}
            </div>

            {/* Tóm tắt ngắn gọn */}
            {product.description && (
              <p className="pd-short-desc">
                {product.description}
              </p>
            )}

            {/* Bảng tóm tắt thông số nhanh từ specifications */}
            {technicalSpecs.length > 0 && (
              <div className="pd-quick-specs">
                {technicalSpecs.slice(0, 6).map((spec, idx) => (
                  <div className="pd-spec-row" key={idx}>
                    <span className="pd-spec-label">{spec.label}:</span>
                    <span className="pd-spec-val">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Cam kết chất lượng tối giản */}
            <div className="pd-commitments">
              <div className="pd-commit-item">✓ Hồ sơ chứng nhận xuất xứ CO/CQ bản gốc công chứng</div>
              <div className="pd-commit-item">✓ Bảo hành chính hãng 24 tháng - Hỗ trợ kỹ thuật trọn đời</div>
              <div className="pd-commit-item">✓ Tư vấn giải pháp lắp đặt & sơ đồ đấu nối tủ GSM từ xa</div>
              <div className="pd-commit-item">✓ Giao hàng toàn quốc - Đóng thùng gỗ bảo vệ an toàn</div>
            </div>

            {/* Nhóm nút hành động */}
            <div className="pd-action-section">
              <div className="pd-qty-selector">
                <button type="button" onClick={handleDecrease} className="pd-qty-btn" title="Giảm số lượng">−</button>
                <span className="pd-qty-value">{quantity}</span>
                <button type="button" onClick={handleIncrease} className="pd-qty-btn" title="Tăng số lượng">+</button>
              </div>

              <button
                type="button"
                className="pd-btn-add-cart"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                <ShoppingCartOutlined /> {addingToCart ? "ĐANG THÊM..." : "THÊM VÀO GIỎ"}
              </button>

              <button
                type="button"
                className="pd-btn-buy-now"
                onClick={handleBuyNow}
                disabled={addingToCart}
              >
                <ThunderboltOutlined /> MUA NGAY
              </button>

              <button type="button" className="pd-btn-quote" onClick={() => window.location.href = "tel:0865130088"}>
                BÁO GIÁ DỰ ÁN
              </button>

              <a href="tel:0865130088" className="pd-btn-hotline" title="Gọi kỹ thuật tư vấn">
                <PhoneOutlined /> 0865.130.088
              </a>
            </div>

          </div>

        </div>

        {/* Tabs Chi Tiết */}
        <div className="pd-tabs-section">
          <div className="pd-tab-nav">
            <button
              type="button"
              className={`pd-tab-btn ${activeTab === "description" ? "active" : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Mô tả chi tiết sản phẩm
            </button>
            <button
              type="button"
              className={`pd-tab-btn ${activeTab === "spec" ? "active" : ""}`}
              onClick={() => setActiveTab("spec")}
            >
              Thông số kỹ thuật
            </button>
          </div>

          <div className="pd-tab-body">
            {activeTab === "description" && (
              <div className="pd-tab-panel">
                {product.longDescription ? (
                  <div
                    className="pd-long-description"
                    dangerouslySetInnerHTML={{ __html: embedYoutubeInHtml(product.longDescription) }}
                  />
                ) : (
                  <p>Chưa có mô tả chi tiết cho sản phẩm này.</p>
                )}
              </div>
            )}

            {activeTab === "spec" && (
              <div className="pd-tab-panel">
                <h3 className="pd-panel-title">Bảng thông số kỹ thuật chi tiết</h3>
                {technicalSpecs.length > 0 ? (
                  <div className="pd-spec-table-wrap">
                    <table className="pd-spec-table">
                      <tbody>
                        {technicalSpecs.map((item, index) => (
                          <tr key={index}>
                            <td className="pd-tbl-label">{item.label}</td>
                            <td className="pd-tbl-value">{item.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>Chưa có thông số kỹ thuật cho sản phẩm này.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Khối liên hệ tư vấn cuối trang (Đơn giản, tinh tế) */}
        <div className="pd-bottom-contact">
          <div className="pd-bcontact-text">
            <h4>Cần tư vấn thiết kế hệ thống & Báo giá dự án?</h4>
            <p>Đội ngũ kỹ sư giàu kinh nghiệm của Thành Công Việt Nam luôn sẵn sàng hỗ trợ kỹ thuật và bản vẽ 24/7.</p>
          </div>
          <div className="pd-bcontact-actions">
            <a href="tel:0865130088" className="pd-bcontact-btn">
              Hotline: 0865.130.088
            </a>
            <a href="https://zalo.me/0865130088" target="_blank" rel="noreferrer" className="pd-bzalo-btn">
              Chat Zalo Kỹ Thuật
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
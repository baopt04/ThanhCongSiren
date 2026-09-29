import { useState, useEffect, useRef } from "react";
import "./CategorySidebar.css";
import { Link, useLocation } from "react-router-dom";
import {
  UnorderedListOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  RightOutlined,
  DownOutlined,
  MessageOutlined,
  CheckCircleFilled,
  LoadingOutlined,
  AppstoreOutlined
} from "@ant-design/icons";
import { getCachedCustomerCategories } from "../../../../utils/categoriesCache";
import { searchCategoryBySlug } from "../../../../services/customer/CustomerProductService";
import { PLACEHOLDER_IMAGE } from '../../../../utils/placeholder';

function getProductPrimaryImage(prod) {
  if (Array.isArray(prod?.image) && prod.image.length > 0) {
    const primary = prod.image.find((img) => img.isPrimary === 1);
    if (primary?.imageUrl) return primary.imageUrl;
    const sorted = [...prod.image].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    return sorted[0]?.imageUrl || prod.image[0]?.imageUrl || "";
  }
  if (prod?.images?.imageUrl) return prod.images.imageUrl;
  if (prod?.imageUrl) return prod.imageUrl;
  return PLACEHOLDER_IMAGE;
}

function formatPrice(price) {
  if (!price || Number(price) <= 0) return "Liên hệ báo giá";
  return `${Number(price).toLocaleString("vi-VN")} VND`;
}

// Fallback tĩnh khi API không trả dữ liệu
const fallbackMenuItems = [
  { name: "Tủ & Bộ điều khiển còi hú", path: "/san-pham/tu-dieu-khien" },
  { name: "Còi báo động động cơ điện cỡ lớn", path: "/san-pham/coi-bao-dong-dong-co-dien-co-lon" },
  { name: "Còi hú động cơ chống cháy nổ", path: "/san-pham/coi-hu-chong-chay-no" },
  { name: "Còi báo động quay tay di động", path: "/san-pham/coi-bao-dong-quay-tay" },
  { name: "Còi hú động cơ điện cỡ nhỏ", path: "/san-pham/coi-hu-co-nho" },
  { name: "Máy thổi khí PCCC (Xăng / Điện)", path: "/san-pham/may-thoi-khi" },
  { name: "Quạt thổi khí & Quạt hút khói", path: "/san-pham/quat-hut-khoi-pccc" },
  { name: "Đệm hơi cứu hộ cứu nạn", path: "/san-pham/dem-hoi-cuu-ho-cuu-nan" },
  { name: "Thiết bị PCCC & CNCH", path: "/san-pham/thiet-bi-bao-chay" },
  { name: "Còi hú xé gió công suất lớn", path: "/san-pham/coi-hu-xe-gio" }
];

function CategoryTreeItem({
  category,
  location,
  level = 0,
  productsCache = {},
  onRequestProducts
}) {
  const hasChildren = category.children && category.children.length > 0;
  const categoryPath = `/san-pham/${category.slug}`;
  const isActive = location.pathname === categoryPath;

  // Kiểm tra xem con nào đang active => tự mở rộng
  const isChildActive = hasChildren && category.children.some(
    (child) => location.pathname === `/san-pham/${child.slug}` ||
      (child.children && child.children.some((gc) => location.pathname === `/san-pham/${gc.slug}`))
  );

  const [expanded, setExpanded] = useState(isActive || isChildActive);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    if (isChildActive) setExpanded(true);
  }, [isChildActive]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleToggle = (e) => {
    if (hasChildren) {
      e.preventDefault();
      setExpanded((prev) => !prev);
    }
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
      if (category.slug && onRequestProducts) {
        onRequestProducts(category.slug);
      }
    }, 120);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  const slugCache = category.slug ? productsCache[category.slug] : null;
  const isLoading = slugCache?.loading;
  const productsList = slugCache?.data;

  return (
    <>
      <li
        className={`tc-cat-tree-li ${isActive ? "active" : ""} ${level > 0 ? "tc-child-item" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link to={categoryPath} onClick={hasChildren ? handleToggle : undefined}>
          <span style={{ paddingLeft: level * 12 }}>{category.name}</span>
          {hasChildren ? (
            <DownOutlined
              className={`tc-tree-arrow ${expanded ? "tc-arrow-expanded" : ""}`}
            />
          ) : (
            <RightOutlined className="tc-tree-arrow" />
          )}
        </Link>

        {/* Flyout popover khi trỏ chuột vào danh mục */}
        {isHovered && category.slug && (
          <div className="tc-cat-flyout-popover">
            <div className="tc-cat-flyout-header">
              <div className="tc-cat-flyout-title">
                <AppstoreOutlined className="tc-cat-flyout-icon" />
                <span>{category.name}</span>
              </div>
              {productsList && !isLoading && (
                <span className="tc-cat-flyout-badge">
                  {productsList.length} sản phẩm
                </span>
              )}
            </div>

            <div className="tc-cat-flyout-body">
              {isLoading ? (
                <div className="tc-cat-flyout-loading">
                  <LoadingOutlined spin />
                  <span>Đang tải sản phẩm...</span>
                </div>
              ) : productsList && productsList.length > 0 ? (
                <div className="tc-cat-flyout-list">
                  {productsList.map((prod) => (
                    <Link
                      key={prod.id}
                      to={`/san-pham/${prod.id}`}
                      className="tc-cat-flyout-item"
                    >
                      <div className="tc-cat-flyout-thumb">
                        <img
                          src={getProductPrimaryImage(prod)}
                          alt={prod.name}
                          onError={(e) => {
                            e.target.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                      </div>
                      <div className="tc-cat-flyout-prod-info">
                        <div className="tc-cat-flyout-prod-name" title={prod.name}>
                          {prod.name}
                        </div>
                        <div className="tc-cat-flyout-prod-price">
                          {formatPrice(prod.price)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="tc-cat-flyout-empty">
                  <span>Chưa có sản phẩm trong danh mục này</span>
                </div>
              )}
            </div>

            {productsList && productsList.length > 0 && (
              <div className="tc-cat-flyout-footer">
                <Link to={categoryPath} className="tc-cat-flyout-all-link">
                  Xem tất cả danh mục &rarr;
                </Link>
              </div>
            )}
          </div>
        )}
      </li>
      {hasChildren && expanded && (
        <ul className="tc-cat-subtree">
          {category.children
            .filter((child) => child.status === 1)
            .map((child) => (
              <CategoryTreeItem
                key={child.id}
                category={child}
                location={location}
                level={level + 1}
                productsCache={productsCache}
                onRequestProducts={onRequestProducts}
              />
            ))}
        </ul>
      )}
    </>
  );
}

export function CategorySidebar() {
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [productsCache, setProductsCache] = useState({});
  const inFlightRef = useRef({});

  const handleRequestProducts = async (slug) => {
    if (!slug) return;
    if (productsCache[slug] || inFlightRef.current[slug]) return;

    inFlightRef.current[slug] = true;
    setProductsCache((prev) => ({
      ...prev,
      [slug]: { loading: true, data: [] },
    }));

    try {
      const res = await searchCategoryBySlug(slug);
      const list = res?.data || (Array.isArray(res) ? res : []);
      setProductsCache((prev) => ({
        ...prev,
        [slug]: { loading: false, data: Array.isArray(list) ? list : [] },
      }));
    } catch (err) {
      console.error(`Error loading products for category slug ${slug}:`, err);
      setProductsCache((prev) => ({
        ...prev,
        [slug]: { loading: false, data: [] },
      }));
    } finally {
      delete inFlightRef.current[slug];
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const res = await getCachedCustomerCategories();
        const data = res?.data || res?.result || res || [];
        const list = Array.isArray(data) ? data : [];

        if (isMounted) {
          if (list.length > 0) {
            // Chỉ hiển thị danh mục có status = 1
            setCategories(list.filter((cat) => cat.status === 1));
          } else {
            setUseFallback(true);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        if (isMounted) {
          setUseFallback(true);
          setLoading(false);
        }
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <aside className="tc-cat-sidebar">
      {/* Category Tree Box */}
      <div className="tc-cat-tree-box">
        <div className="tc-cat-tree-header">
          <UnorderedListOutlined /> DANH MỤC SẢN PHẨM
        </div>

        {loading ? (
          <div className="tc-cat-loading">
            <LoadingOutlined spin /> Đang tải danh mục...
          </div>
        ) : useFallback ? (
          /* Fallback: hiển thị danh mục tĩnh */
          <ul className="tc-cat-tree-list">
            {fallbackMenuItems.map((item, idx) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === "/coi-bao-dong-dong-co-dien-co-lon" &&
                  location.pathname === "/coi-hu-bao-dong");

              return (
                <li key={idx} className={isActive ? "active" : ""}>
                  <Link to={item.path}>
                    <span>{item.name}</span>
                    <RightOutlined className="tc-tree-arrow" />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          /* Dynamic: hiển thị cây danh mục từ API */
          <ul className="tc-cat-tree-list">
            {categories.map((cat) => (
              <CategoryTreeItem
                key={cat.id}
                category={cat}
                location={location}
                productsCache={productsCache}
                onRequestProducts={handleRequestProducts}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Hotline Support Box */}
      <div className="tc-sidebar-hotline-box">
        <div className="tc-side-hotline-header">
          <PhoneOutlined className="tc-side-phone-ic" />
          <span>TƯ VẤN BÁO GIÁ DỰ ÁN</span>
        </div>
        <div className="tc-side-hotline-body">
          <p>Kỹ thuật tư vấn 24/7:</p>
          <a href="tel:0865130088" className="tc-side-phone-num">0865.130.088</a>
          <a
            href="https://zalo.me/0865130088"
            target="_blank"
            rel="noreferrer"
            className="tc-side-zalo-btn"
          >
            <MessageOutlined /> Chat Zalo Báo Giá
          </a>
        </div>
      </div>

      {/* Guarantee Box */}
      <div className="tc-sidebar-guarantee-box">
        <div className="tc-side-guar-header">
          <SafetyCertificateOutlined /> CAM KẾT CHẤT LƯỢNG
        </div>
        <ul className="tc-side-guar-list">
          <li><CheckCircleFilled className="tc-green-ic" /> 100% Lion King chính hãng</li>
          <li><CheckCircleFilled className="tc-green-ic" /> Hồ sơ CO/CQ bản gốc</li>
          <li><CheckCircleFilled className="tc-green-ic" /> Bảo hành 12 - 24 tháng</li>
          <li><CheckCircleFilled className="tc-green-ic" /> Hỗ trợ lắp đặt tận nơi</li>
          <li><CheckCircleFilled className="tc-green-ic" /> Giao hàng toàn quốc</li>
        </ul>
      </div>
    </aside>
  );
}

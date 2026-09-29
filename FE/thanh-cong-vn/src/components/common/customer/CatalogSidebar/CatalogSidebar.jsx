import { useState, useEffect } from "react";
import "./CatalogSidebar.css";
import { DownOutlined, UpOutlined, LoadingOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { getCachedCustomerCategories } from "../../../../utils/categoriesCache";

// Fallback categories khi API không trả dữ liệu
export const DEFAULT_CATEGORIES = [
  { id: "tu-dieu-khien", name: "Tủ điều khiển", slug: "tu-dieu-khien", path: "/san-pham/tu-dieu-khien" },
  { id: "bo-dieu-khien", name: "Bộ điều khiển", slug: "bo-dieu-khien", path: "/san-pham/bo-dieu-khien" },
  { 
    id: "coi-bao-dong", 
    name: "Còi báo động", 
    slug: "coi-hu-bao-dong",
    path: "/san-pham/coi-hu-bao-dong",
    children: [
      { id: "co-lon", name: "Còi báo động động cơ điện cỡ lớn", slug: "coi-bao-dong-dong-co-dien-co-lon", path: "/san-pham/coi-bao-dong-dong-co-dien-co-lon" },
      { id: "chong-chay-no", name: "Còi hú chống cháy nổ", slug: "coi-hu-chong-chay-no", path: "/san-pham/coi-hu-chong-chay-no" },
      { id: "quay-tay", name: "Còi báo động quay tay", slug: "coi-bao-dong-quay-tay", path: "/san-pham/coi-bao-dong-quay-tay" },
      { id: "co-nho", name: "Còi hú cỡ nhỏ", slug: "coi-hu-co-nho", path: "/san-pham/coi-hu-co-nho" }
    ]
  },
  { 
    id: "may-thoi-khi", 
    name: "Máy thổi khí", 
    slug: "may-thoi-khi",
    path: "/san-pham/may-thoi-khi",
    children: [
      { id: "may-thoi-pccc", name: "Máy thổi khí PCCC", slug: "may-thoi-khi-pccc", path: "/san-pham/may-thoi-khi-pccc" },
      { id: "quat-hut-khoi", name: "Quạt hút khói PCCC", slug: "quat-hut-khoi-pccc", path: "/san-pham/quat-hut-khoi-pccc" }
    ]
  },
  { id: "thiet-bi-pccc", name: "Thiết bị PCCC và CNCH", slug: "thiet-bi-bao-chay", path: "/san-pham/thiet-bi-bao-chay" },
  { id: "dem-hoi", name: "Đệm hơi cứu hộ cứu nạn", slug: "dem-hoi-cuu-ho-cuu-nan", path: "/san-pham/dem-hoi-cuu-ho-cuu-nan" },
  { id: "coi-xe-gio", name: "Còi Hú Xé Gió", slug: "coi-hu-xe-gio", path: "/san-pham/coi-hu-xe-gio" },
  { id: "coi-bao-chay", name: "Còi Báo Cháy", slug: "coi-bao-chay", path: "/san-pham/coi-bao-chay" },
  { id: "coi-bao-gio", name: "Còi Báo Giờ", slug: "coi-bao-gio", path: "/san-pham/coi-bao-gio" },
  { id: "coi-chong-trom", name: "Còi Hú Chống Trộm", slug: "coi-hu-chong-trom", path: "/san-pham/coi-hu-chong-trom" },
  { id: "quat-thoi-khi", name: "Quạt Thổi Khí", slug: "quat-thoi-khi", path: "/san-pham/quat-thoi-khi" },
  { id: "quat-hut-khoi-pccc", name: "Quạt Hút Khói PCCC", slug: "quat-hut-khoi-pccc", path: "/san-pham/quat-hut-khoi-pccc" }
];

export const PRICE_RANGES = [
  { id: "all", label: "Tất cả mức giá", min: 0, max: Infinity },
  { id: "under-5m", label: "Dưới 5 triệu", min: 0, max: 5000000 },
  { id: "5m-10m", label: "Từ 5 triệu đến 10 triệu", min: 5000000, max: 10000000 },
  { id: "10m-15m", label: "Từ 10 triệu đến 15 triệu", min: 10000000, max: 15000000 },
  { id: "above-15m", label: "Trên 15 triệu", min: 15000000, max: Infinity }
];


function mapApiCategoriesToSidebar(apiCategories) {
  return apiCategories
    .filter((cat) => cat.status === 1)
    .map((cat) => {
      const mapped = {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        path: `/san-pham/${cat.slug}`,
      };

      if (cat.children && cat.children.length > 0) {
        mapped.children = cat.children
          .filter((child) => child.status === 1)
          .map((child) => ({
            id: child.id,
            name: child.name,
            slug: child.slug,
            path: `/san-pham/${child.slug}`,
            // Hỗ trợ cháu (grandchildren) nếu có
            ...(child.children && child.children.length > 0
              ? {
                  children: child.children
                    .filter((gc) => gc.status === 1)
                    .map((gc) => ({
                      id: gc.id,
                      name: gc.name,
                      slug: gc.slug,
                      path: `/san-pham/${gc.slug}`,
                    })),
                }
              : {}),
          }));
      }

      return mapped;
    });
}

export function CatalogSidebar({
  categories: propCategories,
  activeCategoryId = "all",
  onSelectCategory,
  selectedPriceRange = "all",
  onPriceRangeChange
}) {
  const [apiCategories, setApiCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const res = await getCachedCustomerCategories();
        // API trả về { success: true, data: [...] }
        // Service đã return response.data => res = { success, data }
        const data = res?.data || res?.result || res || [];
        const list = Array.isArray(data) ? data : [];

        if (isMounted) {
          if (list.length > 0) {
            setApiCategories(mapApiCategoriesToSidebar(list));
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading categories for CatalogSidebar:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  // Dùng API categories nếu có, không thì dùng prop hoặc fallback
  const categories = apiCategories.length > 0
    ? apiCategories
    : (propCategories || DEFAULT_CATEGORIES);

  // Store expanded accordion state for parent categories
  const [expandedIds, setExpandedIds] = useState({});

  // Auto-expand danh mục cha nếu danh mục con đang active
  useEffect(() => {
    if (categories.length > 0 && activeCategoryId !== "all") {
      const newExpanded = {};
      categories.forEach((cat) => {
        if (cat.children && cat.children.length > 0) {
          const isChildActive = cat.children.some(
            (sub) => sub.id === activeCategoryId || sub.slug === activeCategoryId
          );
          if (isChildActive || cat.id === activeCategoryId) {
            newExpanded[cat.id] = true;
          }
        }
      });
      setExpandedIds((prev) => ({ ...prev, ...newExpanded }));
    }
  }, [categories, activeCategoryId]);

  const toggleExpand = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCategoryClick = (cat, e) => {
    if (onSelectCategory) {
      e.preventDefault();
      onSelectCategory(cat.slug || cat.id, cat);
    }
  };

  return (
    <aside className="tc-custom-sidebar">
      {/* SECTION 1: DANH MỤC */}
      <div className="tc-sidebar-section">
        <h2 className="tc-sidebar-title">DANH MỤC</h2>

        {loading ? (
          <div className="tc-sidebar-loading">
            <LoadingOutlined spin /> Đang tải danh mục...
          </div>
        ) : (
          <ul className="tc-sidebar-cat-list">
            <li className="tc-sidebar-cat-item">
              <div className={`tc-sidebar-cat-row ${activeCategoryId === "all" ? "active" : ""}`}>
                <button 
                  type="button"
                  className="tc-sidebar-cat-btn"
                  onClick={(e) => handleCategoryClick({ id: "all", slug: "all", name: "Tất cả sản phẩm" }, e)}
                >
                  Tất cả sản phẩm
                </button>
              </div>
            </li>
            {categories.map((cat) => {
              const hasChildren = cat.children && cat.children.length > 0;
              const isExpanded = !!expandedIds[cat.id];
              const isActive = activeCategoryId === cat.id || activeCategoryId === cat.slug;

              return (
                <li key={cat.id} className="tc-sidebar-cat-item">
                  <div className={`tc-sidebar-cat-row ${isActive ? "active" : ""}`}>
                    {cat.path ? (
                      <Link 
                        to={cat.path} 
                        className="tc-sidebar-cat-link"
                        onClick={(e) => handleCategoryClick(cat, e)}
                      >
                        {cat.name}
                      </Link>
                    ) : (
                      <button 
                        type="button"
                        className="tc-sidebar-cat-btn"
                        onClick={(e) => handleCategoryClick(cat, e)}
                      >
                        {cat.name}
                      </button>
                    )}

                    {hasChildren && (
                      <button
                        type="button"
                        className="tc-sidebar-toggle-btn"
                        onClick={(e) => toggleExpand(cat.id, e)}
                        title={isExpanded ? "Thu gọn" : "Mở rộng"}
                      >
                        {isExpanded ? <UpOutlined /> : <DownOutlined />}
                      </button>
                    )}
                  </div>

                  {/* Subcategories (accordion) */}
                  {hasChildren && isExpanded && (
                    <ul className="tc-sidebar-subcat-list">
                      {cat.children.map((sub) => {
                        const isSubActive = activeCategoryId === sub.id || activeCategoryId === sub.slug;
                        return (
                          <li key={sub.id} className="tc-sidebar-subcat-item">
                            <Link
                              to={sub.path}
                              className={`tc-sidebar-subcat-link ${isSubActive ? "active" : ""}`}
                              onClick={(e) => handleCategoryClick(sub, e)}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* SECTION 2: GIÁ SẢN PHẨM */}
      <div className="tc-sidebar-section tc-price-section">
        <h2 className="tc-sidebar-title">GIÁ SẢN PHẨM</h2>
        <div className="tc-sidebar-price-options">
          {PRICE_RANGES.map((range) => {
            const isChecked = selectedPriceRange === range.id;
            return (
              <label 
                key={range.id} 
                className={`tc-price-radio-label ${isChecked ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="priceRange"
                  value={range.id}
                  checked={isChecked}
                  onChange={() => onPriceRangeChange && onPriceRangeChange(range.id)}
                  className="tc-price-radio-input"
                />
                <span className="tc-price-custom-radio"></span>
                <span className="tc-price-radio-text">{range.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

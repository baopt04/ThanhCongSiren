import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pagination } from "antd";
import { LoadingOutlined, FilterOutlined, CloseOutlined } from "@ant-design/icons";
import { ProductCard } from "../ProductCard/ProductCard";
import { CatalogSidebar, DEFAULT_CATEGORIES, PRICE_RANGES } from "../CatalogSidebar/CatalogSidebar";
import { searchCategoryBySlug } from "../../../../services/customer/CustomerProductService";
import "./ProductListingLayout.css";

export function ProductListingLayout({
  pageTitle = "Danh sách sản phẩm",
  breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Danh sách sản phẩm", path: null }
  ],
  categories = DEFAULT_CATEGORIES,
  defaultCategoryId = "all",
  products = [],
  loading = false,
  pageSize = 12,
  guideCard = null,
  headerBadge = null,
  introText = null
}) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(defaultCategoryId);
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  // Danh sách sản phẩm hiện tại (tất cả hoặc theo slug danh mục)
  const [currentProducts, setCurrentProducts] = useState(products);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const categoryCacheRef = useRef({});

  // Đồng bộ sản phẩm ban đầu khi props products thay đổi và chưa chọn slug
  useEffect(() => {
    if (!activeCategory || activeCategory === "all") {
      setCurrentProducts(products);
    }
  }, [products]);

  // Sync activeCategory when prop changes
  useEffect(() => {
    if (defaultCategoryId && defaultCategoryId !== "all") {
      handleSelectCategory(defaultCategoryId, null, false);
    } else {
      setActiveCategory("all");
      setCurrentProducts(products);
    }
  }, [defaultCategoryId]);

  useEffect(() => {
    document.body.classList.toggle("tc-scroll-lock", filterOpen);
    return () => document.body.classList.remove("tc-scroll-lock");
  }, [filterOpen]);

  // Xử lý khi người dùng chọn vào danh mục ở sidebar bên trái
  const handleSelectCategory = async (catSlugOrId, catObj, shouldNavigate = true) => {
    const slug = catObj?.slug || (typeof catSlugOrId === "string" ? catSlugOrId : null);
    setActiveCategory(slug || catSlugOrId || "all");
    setCurrentPage(1);
    setFilterOpen(false);

    if (shouldNavigate) {
      if (!slug || slug === "all") {
        navigate("/san-pham");
      } else {
        navigate(`/san-pham/${slug}`);
      }
    }

    // Nếu chọn "Tất cả sản phẩm"
    if (!slug || slug === "all") {
      setCurrentProducts(products);
      return;
    }

    // Nếu đã có trong cache
    if (categoryCacheRef.current[slug]) {
      setCurrentProducts(categoryCacheRef.current[slug]);
      return;
    }

    // Gọi API searchCategoryBySlug để lấy sản phẩm thuộc danh mục đó
    setIsLoadingCategory(true);
    try {
      const res = await searchCategoryBySlug(slug);
      const list = res?.data || (Array.isArray(res) ? res : []);
      const validList = Array.isArray(list) ? list : [];
      categoryCacheRef.current[slug] = validList;
      setCurrentProducts(validList);
    } catch (error) {
      console.error(`Error loading products for category slug "${slug}":`, error);
      setCurrentProducts([]);
    } finally {
      setIsLoadingCategory(false);
    }
  };

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, selectedPriceRange]);

  // Filtering products by Price Range
  const filteredProducts = useMemo(() => {
    return currentProducts.filter((item) => {
      // Price filter
      let matchesPrice = true;
      if (selectedPriceRange !== "all") {
        const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
        const pNum =
          typeof item.priceNum === "number"
            ? item.priceNum
            : typeof item.price === "number"
            ? item.price
            : 0;
        if (range) {
          matchesPrice = pNum >= range.min && pNum < range.max;
        }
      }

      return matchesPrice;
    });
  }, [currentProducts, selectedPriceRange]);

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

  const handleResetFilters = () => {
    setActiveCategory("all");
    setSelectedPriceRange("all");
    setCurrentPage(1);
    setCurrentProducts(products);
  };

  return (
    <div className="tc-listing-page">
      {/* Top Breadcrumb Navigation */}
      <nav className="tc-listing-breadcrumb" aria-label="Breadcrumb">
        <div className="tc-listing-breadcrumb-inner">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            return (
              <span key={index} className="tc-crumb-item">
                {item.path && !isLast ? (
                  <Link to={item.path} className="tc-crumb-link">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "tc-crumb-active" : "tc-crumb-link"}>
                    {item.label}
                  </span>
                )}
                {!isLast && <span className="tc-crumb-separator">›</span>}
              </span>
            );
          })}
        </div>
      </nav>

      {/* Main 2-Column Container */}
      <div className="tc-listing-container">
        <div className="tc-listing-layout-grid">
          
          {/* CỘT TRÁI: DANH MỤC & GIÁ SẢN PHẨM */}
          <div className="tc-listing-sidebar-col">
            <CatalogSidebar
              categories={categories}
              activeCategoryId={activeCategory}
              onSelectCategory={handleSelectCategory}
              selectedPriceRange={selectedPriceRange}
              onPriceRangeChange={setSelectedPriceRange}
            />
          </div>

          {/* CỘT PHẢI: NỘI DUNG & LƯỚI SẢN PHẨM */}
          <main className="tc-listing-main-col">
            <div className="tc-listing-mobile-filters">
              <button
                type="button"
                className="tc-listing-filter-btn"
                onClick={() => setFilterOpen(true)}
              >
                <FilterOutlined /> Bộ lọc & Danh mục
              </button>
              {(activeCategory && activeCategory !== "all") || selectedPriceRange !== "all" ? (
                <button type="button" className="tc-listing-clear-btn" onClick={handleResetFilters}>
                  Xóa lọc
                </button>
              ) : null}
            </div>

            {/* Optional Header Badge */}
            {headerBadge && (
              <div className="tc-listing-header-box">
                <div className="tc-listing-tab-badge">
                  <span>{headerBadge}</span>
                </div>
                <div className="tc-listing-header-line"></div>
              </div>
            )}

            {/* Optional Intro Text */}
            {introText && (
              <div className="tc-listing-intro">
                <p>{introText}</p>
              </div>
            )}

            {/* Product Grid (3-4 products per row) */}
            {loading || isLoadingCategory ? (
              <div className="tc-listing-loading-box">
                <LoadingOutlined spin style={{ fontSize: 36, color: "#b91c1c" }} />
                <p style={{ marginTop: 14, color: "#64748b", fontWeight: 500, fontSize: 14 }}>
                  Đang tải sản phẩm...
                </p>
              </div>
            ) : paginatedProducts.length > 0 ? (
              <div className="tc-listing-product-grid">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.code || product.id || product.name}
                    variant="catalog"
                    {...product}
                  />
                ))}
              </div>
            ) : (
              <div className="tc-listing-empty-state">
                <p className="tc-empty-message">Không có sản phẩm nào thuộc danh mục này.</p>
                <button 
                  type="button" 
                  className="tc-btn-reset-filters" 
                  onClick={handleResetFilters}
                >
                  Xóa bộ lọc & Xem tất cả sản phẩm
                </button>
              </div>
            )}

            {/* Bottom Pagination */}
            {totalItems > pageSize && (
              <div className="tc-listing-pagination-wrapper">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalItems}
                  onChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 200, behavior: "smooth" });
                  }}
                  showSizeChanger={false}
                />
              </div>
            )}

            {/* Optional Technical Buying Guide Card */}
            {guideCard && (
              <div className="tc-listing-guide-section">
                {guideCard}
              </div>
            )}
          </main>

        </div>
      </div>

      {/* Mobile filter drawer */}
      <div
        className={`tc-filter-drawer-backdrop ${filterOpen ? "is-open" : ""}`}
        onClick={() => setFilterOpen(false)}
        aria-hidden={!filterOpen}
      />
      <aside
        className={`tc-filter-drawer ${filterOpen ? "is-open" : ""}`}
        aria-hidden={!filterOpen}
        aria-label="Bộ lọc sản phẩm"
      >
        <div className="tc-filter-drawer-header">
          <span>Bộ lọc & Danh mục</span>
          <button
            type="button"
            className="tc-filter-drawer-close"
            onClick={() => setFilterOpen(false)}
            aria-label="Đóng bộ lọc"
          >
            <CloseOutlined />
          </button>
        </div>
        <div className="tc-filter-drawer-body">
          <CatalogSidebar
            categories={categories}
            activeCategoryId={activeCategory}
            onSelectCategory={handleSelectCategory}
            selectedPriceRange={selectedPriceRange}
            onPriceRangeChange={(range) => {
              setSelectedPriceRange(range);
              setFilterOpen(false);
            }}
          />
        </div>
      </aside>
    </div>
  );
}

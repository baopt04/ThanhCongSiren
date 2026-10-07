import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Pagination } from "antd";
import { LoadingOutlined, FilterOutlined, CloseOutlined } from "@ant-design/icons";
import { ProductCard } from "../ProductCard/ProductCard";
import { CatalogSidebar, DEFAULT_CATEGORIES, PRICE_RANGES } from "../CatalogSidebar/CatalogSidebar";
import { getByProductForCategeroy } from "../../../../services/customer/CustomerProductService";
import { getCachedCustomerCategories, findCategoryInTree } from "../../../../utils/categoriesCache";
import { queryClient } from "../../../../config/queryClient";
import { categoryProductsQueryKey } from "../../../../hooks/queries/customerQueries";
import { useScrollRestoration } from "../../../../hooks/useScrollRestoration";
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
  introText = null,
  totalItems: serverTotalItems,
  currentPage: serverCurrentPage,
  onPageChange
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const urlPage = isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;

  const [activeCategory, setActiveCategory] = useState(defaultCategoryId);
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [filterOpen, setFilterOpen] = useState(false);

  // Danh sách sản phẩm hiện tại (tất cả hoặc theo ID danh mục)
  const [currentProducts, setCurrentProducts] = useState(products);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [isInitialCategoryLoaded, setIsInitialCategoryLoaded] = useState(
    !defaultCategoryId || defaultCategoryId === "all"
  );
  const categoryCacheRef = useRef({});
  const isFirstMountRef = useRef(true);

  // Đồng bộ sản phẩm ban đầu khi props products thay đổi và chưa chọn danh mục
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
  const handleSelectCategory = async (catIdOrSlug, catObj, shouldNavigate = true) => {
    // 1. Kiểm tra nếu chọn "Tất cả sản phẩm"
    const isAll = !catIdOrSlug || catIdOrSlug === "all" || catObj?.id === "all";
    if (isAll) {
      setActiveCategory("all");
      setCurrentPage(1);
      setFilterOpen(false);
      setIsInitialCategoryLoaded(true);
      if (shouldNavigate) {
        navigate("/san-pham");
      }
      setCurrentProducts(products);
      return;
    }

    // 2. Xác định categoryId và slug
    let categoryId = catObj?.id;
    let slug = catObj?.slug;

    // Nếu chưa có categoryId hoặc slug (ví dụ load từ URL param)
    if (!categoryId || !slug) {
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!categoryId && UUID_REGEX.test(catIdOrSlug)) {
        categoryId = catIdOrSlug;
      }
      try {
        const res = await getCachedCustomerCategories();
        const raw = res?.data || res?.result || res || [];
        const found = findCategoryInTree(Array.isArray(raw) ? raw : [], catIdOrSlug);
        if (found) {
          categoryId = categoryId || found.id;
          slug = slug || found.slug;
        }
      } catch (err) {
        console.error("Error finding category in tree:", err);
      }
    }

    // Fallback nếu không tìm thấy trong tree
    if (!categoryId) {
      categoryId = catIdOrSlug;
    }

    const activeIdentifier = slug || categoryId;
    setActiveCategory(activeIdentifier);
    setCurrentPage(1);
    setFilterOpen(false);

    if (shouldNavigate) {
      navigate(`/san-pham/${slug || categoryId}`);
    }

    // 3. Kiểm tra trong TanStack Query cache trước (hiển thị tức thì 0ms khi quay lại)
    const cached = queryClient.getQueryData(categoryProductsQueryKey(categoryId));
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setCurrentProducts(cached);
      setIsInitialCategoryLoaded(true);
      return;
    }

    // 4. Lấy id danh mục đó truyền vào api getByProductForCategeroy để lấy ra sản phẩm cho người dùng xem
    setIsLoadingCategory(true);
    try {
      const list = await queryClient.fetchQuery({
        queryKey: categoryProductsQueryKey(categoryId),
        queryFn: async () => {
          const res = await getByProductForCategeroy(categoryId);
          const raw = res?.data || (Array.isArray(res) ? res : []);
          return Array.isArray(raw) ? raw : [];
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
      });
      setCurrentProducts(list);
    } catch (error) {
      console.error(`Error loading products for category id "${categoryId}":`, error);
      setCurrentProducts([]);
    } finally {
      setIsLoadingCategory(false);
      setIsInitialCategoryLoaded(true);
    }
  };

  // Reset page to 1 whenever filters change (bỏ qua lần đầu mount để giữ page từ URL)
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    setCurrentPage(1);
  }, [activeCategory, selectedPriceRange]);

  // Server vs Client pagination logic
  const isServerPaginated = Boolean(onPageChange && (!activeCategory || activeCategory === "all"));
  const activeCurrentPage = isServerPaginated && typeof serverCurrentPage === "number" ? serverCurrentPage : currentPage;

  // Đồng bộ currentPage với urlPage khi URL thay đổi (Back/Forward)
  useEffect(() => {
    if (!isServerPaginated) {
      setCurrentPage(urlPage);
    }
  }, [urlPage, isServerPaginated]);

  // Kích hoạt scroll restoration khi dữ liệu đã render đầy đủ
  const isReady = !loading && !isLoadingCategory && isInitialCategoryLoaded;
  useScrollRestoration(isReady);

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

  // Server vs Client pagination logic (already defined above)
  const totalItems = isServerPaginated && typeof serverTotalItems === "number" ? serverTotalItems : filteredProducts.length;

  // Pagination calculation
  const startIndex = (activeCurrentPage - 1) * pageSize;
  const paginatedProducts = isServerPaginated
    ? filteredProducts
    : filteredProducts.slice(startIndex, startIndex + pageSize);

  const handlePageChangeInternal = (newPage) => {
    if (isServerPaginated && onPageChange) {
      onPageChange(newPage);
    } else {
      setCurrentPage(newPage);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newPage === 1) {
          next.delete("page");
        } else {
          next.set("page", String(newPage));
        }
        return next;
      });
      window.scrollTo({ top: 200, behavior: "smooth" });
    }
  };

  const handleResetFilters = () => {
    setActiveCategory("all");
    setSelectedPriceRange("all");
    if (isServerPaginated && onPageChange) {
      onPageChange(1);
    } else {
      setCurrentPage(1);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("page");
        return next;
      });
    }
    setCurrentProducts(products);
    navigate("/san-pham");
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
                  current={activeCurrentPage}
                  pageSize={pageSize}
                  total={totalItems}
                  onChange={handlePageChangeInternal}
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

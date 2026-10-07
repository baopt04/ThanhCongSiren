import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import "./RouteSkeleton.css";

/**
 * Skeleton cho các trang bảng dữ liệu Admin (Sản phẩm, Thương hiệu, Danh mục, Bài viết, Người dùng...)
 */
export function AdminTableSkeleton() {
  return (
    <div className="tc-skeleton-admin">
      {/* Header */}
      <div className="tc-sk-header">
        <div>
          <div className="tc-skeleton-shimmer tc-sk-title" />
          <div className="tc-skeleton-shimmer tc-sk-subtitle" />
        </div>
        <div className="tc-sk-actions">
          <div className="tc-skeleton-shimmer tc-sk-btn-sm" />
          <div className="tc-skeleton-shimmer tc-sk-btn-primary" />
        </div>
      </div>

      {/* Toolbar / Search Filter */}
      <div className="tc-sk-card tc-sk-toolbar">
        <div className="tc-skeleton-shimmer tc-sk-input" />
        <div className="tc-skeleton-shimmer tc-sk-select" />
        <div className="tc-skeleton-shimmer tc-sk-select" />
        <div className="tc-skeleton-shimmer tc-sk-btn-sm" />
      </div>

      {/* Table Card */}
      <div className="tc-sk-card tc-sk-table-card">
        {/* Table Head */}
        <div className="tc-sk-tr tc-sk-thead">
          <div className="tc-skeleton-shimmer tc-sk-th" style={{ width: "5%" }} />
          <div className="tc-skeleton-shimmer tc-sk-th" style={{ width: "10%" }} />
          <div className="tc-skeleton-shimmer tc-sk-th" style={{ width: "30%" }} />
          <div className="tc-skeleton-shimmer tc-sk-th" style={{ width: "18%" }} />
          <div className="tc-skeleton-shimmer tc-sk-th" style={{ width: "15%" }} />
          <div className="tc-skeleton-shimmer tc-sk-th" style={{ width: "12%" }} />
          <div className="tc-skeleton-shimmer tc-sk-th" style={{ width: "10%" }} />
        </div>

        {/* 6 Shimmer Rows */}
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="tc-sk-tr">
            <div className="tc-skeleton-shimmer tc-sk-td-id" />
            <div className="tc-skeleton-shimmer tc-sk-td-thumb" />
            <div className="tc-sk-td-content">
              <div className="tc-skeleton-shimmer tc-sk-td-line-long" />
              <div className="tc-skeleton-shimmer tc-sk-td-line-short" />
            </div>
            <div className="tc-skeleton-shimmer tc-sk-td-tag" />
            <div className="tc-skeleton-shimmer tc-sk-td-tag" />
            <div className="tc-skeleton-shimmer tc-sk-td-status" />
            <div className="tc-sk-td-actions">
              <div className="tc-skeleton-shimmer tc-sk-action-btn" />
              <div className="tc-skeleton-shimmer tc-sk-action-btn" />
            </div>
          </div>
        ))}

        {/* Pagination */}
        <div className="tc-sk-pagination">
          <div className="tc-skeleton-shimmer tc-sk-pag-info" />
          <div className="tc-sk-pag-pages">
            {[1, 2, 3, 4].map((p) => (
              <div key={p} className="tc-skeleton-shimmer tc-sk-pag-btn" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton cho trang Dashboard Tổng quan Admin
 */
export function AdminDashboardSkeleton() {
  return (
    <div className="tc-skeleton-admin">
      <div className="tc-sk-header">
        <div>
          <div className="tc-skeleton-shimmer tc-sk-title" />
          <div className="tc-skeleton-shimmer tc-sk-subtitle" />
        </div>
        <div className="tc-skeleton-shimmer tc-sk-btn-primary" />
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="tc-sk-kpi-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="tc-sk-card tc-sk-kpi-card">
            <div className="tc-sk-kpi-top">
              <div className="tc-skeleton-shimmer tc-sk-kpi-label" />
              <div className="tc-skeleton-shimmer tc-sk-kpi-icon" />
            </div>
            <div className="tc-skeleton-shimmer tc-sk-kpi-value" />
            <div className="tc-skeleton-shimmer tc-sk-kpi-sub" />
          </div>
        ))}
      </div>

      {/* 2 Big Dashboard Panels */}
      <div className="tc-sk-dash-panels">
        <div className="tc-sk-card tc-sk-panel-large">
          <div className="tc-skeleton-shimmer tc-sk-panel-header" />
          <div className="tc-skeleton-shimmer tc-sk-chart" />
        </div>
        <div className="tc-sk-card tc-sk-panel-small">
          <div className="tc-skeleton-shimmer tc-sk-panel-header" />
          {[1, 2, 3, 4].map((r) => (
            <div key={r} className="tc-sk-list-item">
              <div className="tc-skeleton-shimmer tc-sk-avatar" />
              <div className="tc-sk-list-text">
                <div className="tc-skeleton-shimmer tc-sk-td-line-long" />
                <div className="tc-skeleton-shimmer tc-sk-td-line-short" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton cho trang danh sách Sản phẩm / Tin tức khách hàng
 */
export function CustomerListingSkeleton() {
  return (
    <div className="tc-skeleton-customer">
      <div className="tc-sk-cust-container">
        {/* Banner / Tiêu đề */}
        <div className="tc-sk-cust-banner">
          <div className="tc-skeleton-shimmer tc-sk-cust-crumb" />
          <div className="tc-skeleton-shimmer tc-sk-cust-title" />
          <div className="tc-skeleton-shimmer tc-sk-cust-desc" />
        </div>

        {/* Filter Pills */}
        <div className="tc-sk-cust-filters">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="tc-skeleton-shimmer tc-sk-cust-pill" />
          ))}
        </div>

        {/* Grid 8 Cards */}
        <div className="tc-sk-cust-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="tc-sk-cust-card">
              <div className="tc-skeleton-shimmer tc-sk-cust-card-img" />
              <div className="tc-sk-cust-card-body">
                <div className="tc-skeleton-shimmer tc-sk-cust-card-badge" />
                <div className="tc-skeleton-shimmer tc-sk-cust-card-line1" />
                <div className="tc-skeleton-shimmer tc-sk-cust-card-line2" />
                <div className="tc-skeleton-shimmer tc-sk-cust-card-spec" />
                <div className="tc-sk-cust-card-footer">
                  <div className="tc-skeleton-shimmer tc-sk-cust-card-price" />
                  <div className="tc-skeleton-shimmer tc-sk-cust-card-btn" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton cho trang chi tiết sản phẩm / bài viết
 */
export function CustomerDetailSkeleton() {
  return (
    <div className="tc-skeleton-customer">
      <div className="tc-sk-cust-container">
        <div className="tc-skeleton-shimmer tc-sk-cust-crumb" style={{ marginBottom: 24 }} />
        <div className="tc-sk-detail-grid">
          <div className="tc-sk-detail-gallery">
            <div className="tc-skeleton-shimmer tc-sk-detail-main-img" />
            <div className="tc-sk-detail-thumbs">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="tc-skeleton-shimmer tc-sk-detail-thumb" />
              ))}
            </div>
          </div>
          <div className="tc-sk-detail-info">
            <div className="tc-skeleton-shimmer tc-sk-detail-title" />
            <div className="tc-skeleton-shimmer tc-sk-detail-badge" />
            <div className="tc-skeleton-shimmer tc-sk-detail-price" />
            <div className="tc-sk-detail-specs">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="tc-skeleton-shimmer tc-sk-detail-spec-row" />
              ))}
            </div>
            <div className="tc-sk-detail-actions">
              <div className="tc-skeleton-shimmer tc-sk-detail-btn" />
              <div className="tc-skeleton-shimmer tc-sk-detail-btn" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * RouteSkeleton: Tự động phát hiện khi chuyển route:
 * Click chuyển → Skeleton loading siêu mượt tức thì 50-80ms (mặc định 60ms) → Dữ liệu mới xuất hiện
 */
export function RouteSkeleton({ layout = "admin", duration = 60, children }) {
  const location = useLocation();
  const navType = useNavigationType();
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);
  const timerRef = useRef(null);

  // Chọn bộ Skeleton phù hợp với loại trang
  const renderSkeleton = () => {
    if (layout === "admin") {
      const isDashboard = location.pathname === "/admin" || location.pathname === "/admin/";
      return isDashboard ? <AdminDashboardSkeleton /> : <AdminTableSkeleton />;
    }

    // Không hiển thị listing skeleton trên trang chủ
    if (location.pathname === "/" || location.pathname === "") {
      return null;
    }

    // Customer
    const isDetail =
      location.pathname.includes("/chi-tiet/") ||
      (location.pathname.startsWith("/san-pham/") &&
        location.pathname !== "/san-pham" &&
        location.pathname !== "/san-pham/") ||
      Boolean(location.pathname.match(/\/tin-tuc\/.+/i));

    return isDetail ? <CustomerDetailSkeleton /> : <CustomerListingSkeleton />;
  };

  // Khi được dùng trực tiếp làm Suspense fallback (không bọc children)
  if (!children) {
    const skeleton = renderSkeleton();
    if (!skeleton) return null;
    return (
      <div className="tc-route-skeleton-container">
        <div className="tc-route-progress-bar" />
        <div className="tc-skeleton-wrapper tc-skeleton-fade-enter">
          {skeleton}
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Tránh lag khi mới mount trang đầu tiên
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Khi người dùng bấm Back/Forward (POP), KHÔNG làm sập chiều cao/ẩn nội dung
    // để hook useScrollRestoration và trình duyệt khôi phục vị trí cuộn mượt mà
    if (navType === "POP") {
      setLoading(false);
      return;
    }

    // duration = 0 → không ép skeleton delay (điều hướng tức thì)
    if (!duration || duration <= 0) {
      setLoading(false);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    setLoading(true);

    timerRef.current = setTimeout(() => {
      setLoading(false);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [location.pathname, location.search, duration, navType]);

  return (
    <div className="tc-route-skeleton-container">
      {/* Thanh tiến trình micro chạy trên mép màn hình */}
      {loading && <div className="tc-route-progress-bar" />}

      {/* Skeleton loading hiển thị trong 300-500ms */}
      {loading && (
        <div className="tc-skeleton-wrapper tc-skeleton-fade-enter">
          {renderSkeleton()}
        </div>
      )}

      {/* Dữ liệu mới xuất hiện */}
      <div className={loading ? "tc-content-hidden" : "tc-content-visible"}>
        {children}
      </div>
    </div>
  );
}

export default RouteSkeleton;

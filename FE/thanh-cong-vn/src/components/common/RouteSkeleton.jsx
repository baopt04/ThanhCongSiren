import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import "./RouteSkeleton.css";

/**
 * Skeleton cho các trang bảng dữ liệu Admin (Sản phẩm, Thương hiệu, Danh mục, Bài viết, Người dùng...)
 */
export function AdminTableSkeleton() {
  return null;
}

export function AdminDashboardSkeleton() {
  return null;
}

export function CustomerListingSkeleton() {
  return null;
}

export function CustomerDetailSkeleton() {
  return null;
}

/**
 * RouteSkeleton: Khung hiển thị khi đang tải (Suspense fallback) cho các trang khách
 * Đảm bảo header/footer không mất và có hiệu ứng shimmer mượt mà.
 */
export function RouteSkeleton({ children }) {
  if (children) return <>{children}</>;
  return (
    <div className="tc-route-skeleton-container" aria-busy="true" aria-label="Đang tải trang...">
      <div className="tc-route-progress-bar" />
      <div className="tc-skeleton-customer">
        <div className="tc-sk-cust-container">
          <div className="tc-sk-cust-banner">
            <div className="tc-skeleton-shimmer tc-sk-cust-crumb" />
            <div className="tc-skeleton-shimmer tc-sk-cust-title" />
            <div className="tc-skeleton-shimmer tc-sk-cust-desc" />
          </div>
          <div className="tc-sk-cust-filters">
            <div className="tc-skeleton-shimmer tc-sk-cust-pill" />
            <div className="tc-skeleton-shimmer tc-sk-cust-pill" />
            <div className="tc-skeleton-shimmer tc-sk-cust-pill" />
            <div className="tc-skeleton-shimmer tc-sk-cust-pill" />
          </div>
          <div className="tc-sk-cust-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
    </div>
  );
}

export default RouteSkeleton;

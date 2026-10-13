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
/**
 * RouteSkeleton: Tạm thời vô hiệu hóa bộ khung làm mờ để kiểm tra tốc độ chuyển trang thực tế.
 * Hiển thị nội dung trực tiếp ngay lập tức (0ms).
 */
export function RouteSkeleton({ children }) {
  if (!children) return null;
  return <>{children}</>;
}

export default RouteSkeleton;

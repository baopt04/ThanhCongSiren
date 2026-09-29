import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Tự động cuộn lên đầu trang mỗi khi chuyển route / URL
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Cuộn ngay lập tức lên đầu trang
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    // Fallback cho mọi trình duyệt
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search]);

  return null;
}

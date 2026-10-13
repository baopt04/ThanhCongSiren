import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { startFaviconSpinner } from "../../utils/faviconSpinner";

/**
 * Tự động cuộn lên đầu trang khi người dùng click điều hướng trang mới (PUSH).
 * Kích hoạt hiệu ứng logo xoay tròn trên tab trình duyệt vài trăm ms khi chuyển trang/tab.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation();
  const navType = useNavigationType();
  const isFirstMountRef = useRef(true);

  // Đặt manual scroll restoration toàn cục ngay từ khi app khởi động
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    // Kích hoạt logo xoay tròn trên tab trình duyệt (delay ngắn 350ms)
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
    } else {
      startFaviconSpinner(350);
    }

    // Chỉ cuộn lên đầu nếu là thao tác điều hướng trang mới (PUSH)
    // Nếu là POP (Quay lại trang trước), bảo lưu vị trí cuộn cũ
    if (navType === "POP") {
      return;
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search, navType]);

  return null;
}

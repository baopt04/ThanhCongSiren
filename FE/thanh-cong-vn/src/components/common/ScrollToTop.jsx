import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Tự động cuộn lên đầu trang khi người dùng click điều hướng trang mới (PUSH).
 * Khi người dùng bấm nút Quay lại (Back - POP) hoặc Tiến tới (Forward),
 * giữ nguyên vị trí cuộn cũ để mang lại trải nghiệm mượt mà chuẩn thương mại điện tử.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation();
  const navType = useNavigationType();

  // Đặt manual scroll restoration toàn cục ngay từ khi app khởi động
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
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

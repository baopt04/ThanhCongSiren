import { useLayoutEffect, useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Hook quản lý và khôi phục vị trí cuộn trang (Scroll Restoration) chuẩn xác:
 * 1. Chuyển sang manual scroll restoration của trình duyệt.
 * 2. Lưu vị trí theo cả location.key (lịch sử duyệt web) và pathname + search (fallback).
 * 3. Chống ghi đè vị trí cuộn bằng 0 khi trang mới mount hoặc đang trong quá trình khôi phục.
 * 4. Cơ chế retry thông minh qua requestAnimationFrame: Liên tục căn chỉnh scroll cho đến khi
 *    chiều cao DOM đủ đáp ứng (loại bỏ triệt để lỗi scroll clamping do hình ảnh/layout chưa reflow kịp).
 *
 * @param {boolean} isReady - Trạng thái sẵn sàng của DOM (dữ liệu đã render xong từ cache hoặc API)
 */
export function useScrollRestoration(isReady = true) {
  const location = useLocation();
  const navType = useNavigationType();
  const restoredRef = useRef(false);
  const isRestoringRef = useRef(false);
  const currentKeyRef = useRef("");
  const rafIdRef = useRef(null);

  // Key chính theo location.key và key dự phòng theo path
  const keyStorageKey = location.key ? `tc_scroll_key_${location.key}` : null;
  const pathStorageKey = `tc_scroll_path_${location.pathname}${location.search}`;

  if (currentKeyRef.current !== (keyStorageKey || pathStorageKey)) {
    currentKeyRef.current = keyStorageKey || pathStorageKey;
    restoredRef.current = false;
    isRestoringRef.current = false;
  }

  // 1. Tắt manual scroll restoration của trình duyệt
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // 2. Lắng nghe cuộn và lưu vị trí vào sessionStorage
  useEffect(() => {
    const saveScroll = () => {
      // Nếu đang trong quá trình khôi phục scroll khi vừa POP, không ghi đè vị trí 0
      if (isRestoringRef.current) return;

      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      // Không ghi đè 0 nếu vừa mount POP mà chưa restore xong
      if (navType === "POP" && !restoredRef.current && scrollY === 0) return;

      try {
        if (keyStorageKey) sessionStorage.setItem(keyStorageKey, String(scrollY));
        sessionStorage.setItem(pathStorageKey, String(scrollY));
      } catch {
        // Quota storage fallback
      }
    };

    const handleScroll = () => {
      if (rafIdRef.current) return;
      rafIdRef.current = requestAnimationFrame(() => {
        saveScroll();
        rafIdRef.current = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", saveScroll);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      saveScroll(); // Lưu trước khi unmount
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", saveScroll);
    };
  }, [keyStorageKey, pathStorageKey, navType]);

  // 3. Khôi phục scroll khi navigationType === "POP" và isReady === true
  useLayoutEffect(() => {
    if (navType !== "POP" || !isReady || restoredRef.current) {
      return;
    }

    // Đọc từ keyStorageKey trước, fallback sang pathStorageKey
    let savedPos = keyStorageKey ? sessionStorage.getItem(keyStorageKey) : null;
    if (savedPos === null) {
      savedPos = sessionStorage.getItem(pathStorageKey);
    }

    if (savedPos !== null) {
      const targetY = parseInt(savedPos, 10);
      if (!isNaN(targetY) && targetY > 0) {
        isRestoringRef.current = true;

        let attempts = 0;
        const maxAttempts = 30; // Thử lại liên tục qua rAF trong ~500ms

        const performScroll = () => {
          window.scrollTo({
            top: targetY,
            left: 0,
            behavior: "instant",
          });

          const currentY = window.scrollY || document.documentElement.scrollTop || 0;
          // Nếu đã cuộn sát targetY (sai số dưới 15px) hoặc đã hết số lần thử
          if (Math.abs(currentY - targetY) <= 15 || attempts >= maxAttempts) {
            restoredRef.current = true;
            // Cho phép lắng nghe saveScroll trở lại sau khi layout ổn định
            setTimeout(() => {
              isRestoringRef.current = false;
            }, 120);
            return;
          }

          attempts++;
          requestAnimationFrame(performScroll);
        };

        // Kích hoạt ngay lập tức
        performScroll();
        return;
      }
    }

    restoredRef.current = true;
  }, [navType, isReady, keyStorageKey, pathStorageKey]);
}

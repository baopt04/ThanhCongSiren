import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  prefetchCustomerProductsPage,
  prefetchCustomerPosts,
} from "./queries/customerQueries";
import { preloadRouteChunks } from "../utils/preloadChunks";

// Cờ phiên duy nhất: đảm bảo chỉ prefetch 1 lần trong suốt phiên tải trang
let hasPrefetchedInSession = false;

/**
 * Kiểm tra xem người dùng có bật chế độ tiết kiệm dữ liệu (Save-Data)
 * hoặc đường truyền mạng quá chậm (2G / slow-2G) hay không.
 */
function shouldSkipPrefetch() {
  if (typeof navigator === "undefined") return false;
  const conn =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  if (!conn) return false;
  if (conn.saveData === true) return true;
  if (conn.effectiveType === "slow-2g" || conn.effectiveType === "2g") return true;
  return false;
}

/**
 * Hook prefetch dữ liệu các trang tiếp theo (Sản phẩm trang 1 & Tin tức)
 * sau khi trang chủ đã tải xong toàn bộ (window.load + 2000ms idle).
 * Tuyệt đối không tranh chấp băng thông với Hero banner, ảnh hay JS chính.
 */
export function usePrefetchNextPages() {
  const location = useLocation();
  const hasRunRef = useRef(false);

  useEffect(() => {
    // 1. Chỉ chạy khi đang ở trang chủ ("/")
    if (location.pathname !== "/") return;

    // 2. Chỉ chạy 1 lần trong phiên tải trang (không lặp khi re-render)
    if (hasRunRef.current || hasPrefetchedInSession) return;

    // 3. Bỏ qua hoàn toàn nếu Save-Data hoặc mạng 2G/slow-2G
    if (shouldSkipPrefetch()) return;

    let timerId = null;
    let idleId = null;
    let isCleanedUp = false;

    const executePrefetch = () => {
      if (isCleanedUp || hasPrefetchedInSession) return;
      if (shouldSkipPrefetch()) return;

      hasRunRef.current = true;
      hasPrefetchedInSession = true;

      try {
        // Tải trước dynamic chunks JS của route đích
        preloadRouteChunks.siren?.();
        preloadRouteChunks.news?.();

        // Prefetch TanStack Query data vào RAM cache
        // (a) Trang 1 danh sách sản phẩm (page: 0, size: 12)
        prefetchCustomerProductsPage(0, 12)?.catch(() => {});
        // (b) Danh sách tin tức
        prefetchCustomerPosts()?.catch(() => {});
      } catch {
        // Nuốt lỗi im lặng, không throw hoặc toast
      }
    };

    const scheduleWithIdle = () => {
      if (isCleanedUp) return;
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(executePrefetch, { timeout: 4000 });
      } else {
        timerId = setTimeout(executePrefetch, 50);
      }
    };

    const startTimerAfterLoad = () => {
      if (isCleanedUp) return;
      // Chờ thêm 2000ms sau khi window load hoàn tất
      timerId = setTimeout(scheduleWithIdle, 2000);
    };

    if (typeof document !== "undefined" && document.readyState === "complete") {
      startTimerAfterLoad();
    } else if (typeof window !== "undefined") {
      window.addEventListener("load", startTimerAfterLoad, { once: true });
    }

    return () => {
      isCleanedUp = true;
      if (typeof window !== "undefined") {
        window.removeEventListener("load", startTimerAfterLoad);
        if (idleId !== null && "cancelIdleCallback" in window) {
          window.cancelIdleCallback(idleId);
        }
      }
      if (timerId !== null) {
        clearTimeout(timerId);
      }
    };
  }, [location.pathname]);
}

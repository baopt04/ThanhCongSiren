import { QueryClient } from "@tanstack/react-query";

/**
 * Cấu hình tập trung cho TanStack Query v5:
 * - staleTime: 3 phút (dữ liệu trong cache vẫn fresh, Back/chuyển trang lấy ngay lập tức 0ms)
 * - gcTime: 10 phút (giữ trong RAM trước khi garbage collected)
 * - refetchOnWindowFocus: false (tránh gọi lại API liên tục khi user chuyển tab)
 * - retry: 1 (chỉ thử lại 1 lần nếu mạng lỗi, tránh nghẽn server)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

/**
 * Utility hỗ trợ preload các dynamic import chunks của route khi hover/focus thẻ Link.
 */
export const preloadRouteChunks = {
  siren: () => import("../pages/customer/SirenPage"),
  productDetail: () =>
    import("../components/common/customer/ProductDetail/ProductDetail"),
  news: () => import("../pages/customer/NewsPage"),
  newsDetail: () => import("../pages/customer/NewsDetailPage"),
};

export const GHN_CONFIG = {
  TOKEN: import.meta.env.VITE_GHN_TOKEN || "",
  SHOP_ID: import.meta.env.VITE_GHN_SHOP_ID || "",
  URL: {
    PROVINCE:
      import.meta.env.VITE_GHN_URL_PROVINCE ||
      "https://online-gateway.ghn.vn/shiip/public-api/master-data/province",
    DISTRICT:
      import.meta.env.VITE_GHN_URL_DISTRICT ||
      "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
    WARD:
      import.meta.env.VITE_GHN_URL_WARD ||
      "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
  },
  SHOP: {
    FROM_DISTRICT_ID: Number(import.meta.env.VITE_GHN_FROM_DISTRICT_ID) || 1492,
    FROM_WARD_CODE: import.meta.env.VITE_GHN_FROM_WARD_CODE || "1A0501",
    SERVICE_TYPE_ID: Number(import.meta.env.VITE_GHN_SERVICE_TYPE_ID) || 2,
  },
};

/**
 * Auth Utility — Centralized authentication management for Admin & Customer.
 *
 * Rules:
 * - Khi Customer đăng nhập: Xóa sạch phiên đăng nhập của Admin và lưu phiên Customer.
 * - Khi Admin đăng nhập: Xóa sạch phiên đăng nhập của Customer và lưu phiên Admin.
 */

const STORAGE_KEYS = {
  // Admin keys
  ADMIN_ACCESS_TOKEN: "adminAccessToken",
  ADMIN_REFRESH_TOKEN: "adminRefreshToken",
  ADMIN_USER: "adminUser",
  ADMIN_TOKEN_EXPIRY: "adminTokenExpiry",

  // Customer keys
  CUSTOMER_ACCESS_TOKEN: "customerAccessToken",
  CUSTOMER_REFRESH_TOKEN: "customerRefreshToken",
  CUSTOMER_USER: "customerUser",
  CUSTOMER_TOKEN_EXPIRY: "customerTokenExpiry",
};

// Fallback token lifetime (15 minutes)
const TOKEN_LIFETIME = 900_000;
const REFRESH_BUFFER = 60_000;

function decodeJwt(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function calculateExpiry(token) {
  const payload = decodeJwt(token);
  if (payload?.exp && typeof payload.exp === "number") {
    return payload.exp * 1000;
  }
  return Date.now() + TOKEN_LIFETIME;
}

// ─── ADMIN AUTH MANAGEMENT ──────────────────────────────────

export function clearAdminAuth() {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN_EXPIRY);
  sessionStorage.removeItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
  sessionStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN_EXPIRY);
}

export function saveAdminAuth(data) {
  if (!data) return;

  // Xóa sạch phiên của customer khi admin đăng nhập
  clearCustomerAuth();

  if (data.accessToken) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN, data.accessToken);
    const expiry = calculateExpiry(data.accessToken);
    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN_EXPIRY, String(expiry));
  }

  if (data.refreshToken && typeof data.refreshToken === "string" && data.refreshToken.trim() !== "") {
    localStorage.setItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN, data.refreshToken.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
  }

  localStorage.setItem(
    STORAGE_KEYS.ADMIN_USER,
    JSON.stringify({
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role || "ADMIN",
    })
  );

  window.dispatchEvent(new Event("customer-auth-changed"));
}

export function getAdminAccessToken() {
  return (
    localStorage.getItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN) ||
    null
  );
}

export function getAdminRefreshToken() {
  return (
    localStorage.getItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN) ||
    ""
  );
}

export function getAdminUser() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEYS.ADMIN_USER) ||
      sessionStorage.getItem(STORAGE_KEYS.ADMIN_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isRefreshTokenExpired() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return true;

  const payload = decodeJwt(refreshToken);
  if (payload?.exp && typeof payload.exp === "number") {
    return Date.now() >= payload.exp * 1000;
  }
  return false;
}

export function isAdminAuthenticated() {
  const hasToken = !!getAdminAccessToken() || (!!getAdminRefreshToken() && !isRefreshTokenExpired());
  return hasToken && getAdminUser()?.role === "ADMIN";
}

// ─── CUSTOMER AUTH MANAGEMENT ───────────────────────────────

export function clearCustomerAuth() {
  localStorage.removeItem(STORAGE_KEYS.CUSTOMER_ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.CUSTOMER_REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.CUSTOMER_USER);
  localStorage.removeItem(STORAGE_KEYS.CUSTOMER_TOKEN_EXPIRY);
  sessionStorage.removeItem(STORAGE_KEYS.CUSTOMER_ACCESS_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.CUSTOMER_REFRESH_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.CUSTOMER_USER);
  sessionStorage.removeItem(STORAGE_KEYS.CUSTOMER_TOKEN_EXPIRY);

  window.dispatchEvent(new Event("customer-auth-changed"));
}

export function saveCustomerAuth(data) {
  if (!data) return;

  // Xóa sạch phiên của admin khi customer đăng nhập
  clearAdminAuth();

  if (data.accessToken) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_ACCESS_TOKEN, data.accessToken);
    const expiry = calculateExpiry(data.accessToken);
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_TOKEN_EXPIRY, String(expiry));
  }

  if (data.refreshToken && typeof data.refreshToken === "string" && data.refreshToken.trim() !== "") {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_REFRESH_TOKEN, data.refreshToken.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_REFRESH_TOKEN);
  }

  localStorage.setItem(
    STORAGE_KEYS.CUSTOMER_USER,
    JSON.stringify({
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role || "USER",
    })
  );

  window.dispatchEvent(new Event("customer-auth-changed"));
}

export function getCustomerAccessToken() {
  return (
    localStorage.getItem(STORAGE_KEYS.CUSTOMER_ACCESS_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.CUSTOMER_ACCESS_TOKEN) ||
    null
  );
}

export function getCustomerRefreshToken() {
  return (
    localStorage.getItem(STORAGE_KEYS.CUSTOMER_REFRESH_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.CUSTOMER_REFRESH_TOKEN) ||
    ""
  );
}

export function getCustomerUser() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEYS.CUSTOMER_USER) ||
      sessionStorage.getItem(STORAGE_KEYS.CUSTOMER_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isCustomerAuthenticated() {
  return !!getCustomerAccessToken() || (!!getCustomerRefreshToken() && !isRefreshTokenExpired());
}

// ─── GENERAL COMPATIBILITY EXPORTS ──────────────────────────

/**
 * Universal saveAuth: Tự động phân loại lưu admin hoặc customer theo role
 */
export function saveAuth(data) {
  if (!data) return;
  if (data.role === "ADMIN") {
    saveAdminAuth(data);
  } else {
    saveCustomerAuth(data);
  }
}

/**
 * Lấy AccessToken hiện tại (ưu tiên admin nếu có, sau đó đến customer)
 */
export function getAccessToken() {
  return getAdminAccessToken() || getCustomerAccessToken();
}

/**
 * Lấy RefreshToken hiện tại
 */
export function getRefreshToken() {
  return getAdminRefreshToken() || getCustomerRefreshToken();
}

/**
 * Kiểm tra xem token hiện tại đã hết hạn hay chưa
 */
export function isTokenExpired() {
  const token = getAccessToken();
  if (!token) return true;

  let expiry = null;
  const rawExpiry =
    localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN_EXPIRY) ||
    localStorage.getItem(STORAGE_KEYS.CUSTOMER_TOKEN_EXPIRY);

  if (rawExpiry && !isNaN(Number(rawExpiry))) {
    expiry = Number(rawExpiry);
  } else {
    const payload = decodeJwt(token);
    if (payload?.exp && typeof payload.exp === "number") {
      expiry = payload.exp * 1000;
    }
  }

  if (!expiry) return false;

  return Date.now() >= expiry - REFRESH_BUFFER;
}

/**
 * Cập nhật token mới sau khi làm mới
 */
export function updateTokens(accessToken, refreshToken) {
  const jwtRole = decodeJwt(accessToken)?.role;
  const isAdmin =
    jwtRole === "ADMIN" ||
    getAdminUser()?.role === "ADMIN" ||
    !!getAdminRefreshToken();

  if (isAdmin) {
    if (accessToken) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN, accessToken);
      const expiry = calculateExpiry(accessToken);
      localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN_EXPIRY, String(expiry));
    }
    if (refreshToken && typeof refreshToken === "string" && refreshToken.trim() !== "") {
      localStorage.setItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN, refreshToken.trim());
    }
  } else {
    if (accessToken) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_ACCESS_TOKEN, accessToken);
      const expiry = calculateExpiry(accessToken);
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_TOKEN_EXPIRY, String(expiry));
    }
    if (refreshToken && typeof refreshToken === "string" && refreshToken.trim() !== "") {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_REFRESH_TOKEN, refreshToken.trim());
    }
  }
  window.dispatchEvent(new Event("customer-auth-changed"));
}

export function isAuthenticated() {
  return !!getAccessToken() || (!!getRefreshToken() && !isRefreshTokenExpired());
}

export function clearAuth() {
  clearAdminAuth();
  clearCustomerAuth();
}

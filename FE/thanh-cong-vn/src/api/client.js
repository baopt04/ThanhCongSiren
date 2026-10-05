import axios from "axios";
import { API_BASE_URL } from "./config";
import {
  getAccessToken,
  getRefreshToken,
  updateTokens,
  clearAuth,
  isTokenExpired,
} from "../utils/auth";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Track refresh state to avoid concurrent refresh calls ───
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken, null));
  refreshSubscribers = [];
}

function onRefreshFailed(error) {
  refreshSubscribers.forEach((callback) => callback(null, error));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

/**
 * Calls the refresh token API.
 * Uses withCredentials: true so that the browser automatically attaches
 * the HttpOnly refreshToken cookie (if supported by environment).
 * Also sends refreshToken in body for seamless compatibility.
 */
export async function callRefreshTokenApi() {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error("Không có refresh token để làm mới phiên đăng nhập");
  }

  const body = {
    refreshToken: refreshTokenValue,
    token: refreshTokenValue,
  };

  let response;
  try {
    response = await axios.post(
      `${API_BASE_URL}/auth/refresh-token`,
      body,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
  } catch (err) {
    // Fallback nếu endpoint đặt là /auth/refresh
    if (err.response?.status === 404) {
      response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        body,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
    } else {
      throw err;
    }
  }

  const resData = response.data?.data || response.data;
  const newAccessToken = resData?.accessToken;
  const newRefreshToken = resData?.refreshToken || refreshTokenValue;

  if (!newAccessToken) {
    throw new Error("Không nhận được accessToken mới từ API refresh token");
  }

  updateTokens(newAccessToken, newRefreshToken);
  return newAccessToken;
}

// ─── Request interceptor: attach Bearer token & proactive refresh ──
apiClient.interceptors.request.use(
  async (config) => {
    // Skip auth header for login & refresh-token endpoints
    const isAuthEndpoint =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register") ||
      config.url?.includes("/auth/refresh-token") ||
      config.url?.includes("/auth/refresh");

    if (isAuthEndpoint) return config;

    // 1. Proactive Refresh: Nếu access token đã hết hạn (15 phút) và có refresh token (7 ngày),
    // chủ động làm mới token TRƯỚC KHI request gửi đi
    if (isTokenExpired() && getRefreshToken()) {
      try {
        console.log("[apiClient] Access token đã hết hạn, chủ động làm mới bằng refreshToken...");
        const newToken = await callRefreshTokenApi();
        if (typeof config.headers?.set === "function") {
          config.headers.set("Authorization", `Bearer ${newToken}`);
        } else {
          config.headers.Authorization = `Bearer ${newToken}`;
        }
        return config;
      } catch (refreshErr) {
        console.warn("[apiClient] Chủ động làm mới token thất bại, thử tiếp tục với token hiện tại:", refreshErr);
      }
    }

    const token = getAccessToken();

    // Attach Bearer token
    if (token) {
      if (typeof config.headers?.set === "function") {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else if (config.url?.startsWith("/admin") || config.url?.includes("/admin/")) {
      console.warn(`[apiClient] Gọi API admin ${config.url} nhưng chưa có accessToken trong storage!`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 and refresh token ──────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const is401 = error.response?.status === 401;

    // Không kích hoạt refresh token hoặc clearAuth đối với các endpoint xác thực/đổi mật khẩu
    // hoặc lỗi sai thông tin chứng thực (INVALID_CREDENTIALS / sai mật khẩu)
    const isAuthOrCredentialEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh-token") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/change-password");

    const isCredentialError =
      error.response?.data?.code === "INVALID_CREDENTIALS" ||
      error.response?.data?.code === "BAD_CREDENTIALS" ||
      error.response?.data?.code === "WRONG_PASSWORD";

    // Nếu là endpoint đổi mật khẩu hoặc lỗi sai mật khẩu, trả lỗi trực tiếp về cho form hiển thị
    if (isAuthOrCredentialEndpoint || isCredentialError) {
      return Promise.reject(error);
    }

    // Skip retry for already retried requests
    if (is401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          console.log("[apiClient] Token đã hết hạn (401). Đang tự động làm mới accessToken...");
          const newAccessToken = await callRefreshTokenApi();
          onRefreshed(newAccessToken);

          // Retry the original request with new token
          if (typeof originalRequest.headers?.set === "function") {
            originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
          } else {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshErr) {
          console.error("[apiClient] Làm mới token thất bại. Chuyển về trang đăng nhập.", refreshErr);
          onRefreshFailed(refreshErr);
          clearAuth();
          if (window.location.pathname.startsWith("/admin") && !window.location.pathname.includes("/admin/login")) {
            window.location.href = "/admin/login";
          }
          return Promise.reject(new Error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại."));
        } finally {
          isRefreshing = false;
        }
      }

      // Another request triggered the refresh — queue this request
      return new Promise((resolve, reject) => {
        addRefreshSubscriber((newToken, err) => {
          if (err) {
            reject(err);
          } else {
            if (typeof originalRequest.headers?.set === "function") {
              originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
            } else {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(apiClient(originalRequest));
          }
        });
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;

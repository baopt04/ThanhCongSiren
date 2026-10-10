import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MailOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { login } from "../../services/LoginService";
import { saveAdminAuth } from "../../utils/auth";
import adminLogo from "../../assets/logo.webp";
import "./AdminLoginPage.css";

export function AdminLoginPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }
    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      // API expects { email, password }
      // Response: { success, data: { accessToken, refreshToken, email, fullName, id, role } }
      const response = await login({ email: email.trim(), password });
      console.log("[AdminLogin] Phản hồi từ server:", response);
      const authData = response?.data?.accessToken ? response.data : (response?.accessToken ? response : null);
      if (authData?.accessToken) {
        authData.role = authData.role || "ADMIN";
        // Save accessToken + user info into admin localStorage
        saveAdminAuth(authData);
        // Navigate to admin dashboard
        navigate("/admin", { replace: true });
      } else {
        setError(response?.message || "Đăng nhập không thành công.");
      }
    } catch (err) {
      console.error("[AdminLogin Error]", err);
      let message = "Email hoặc mật khẩu không chính xác.";
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.data?.error) {
        message = err.response.data.error;
      } else if (!err.response && err.message) {
        message = `Không thể kết nối đến máy chủ (${err.message}). Vui lòng kiểm tra backend.`;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        {/* Header */}
        <div className="admin-login-header">
          <div className="admin-login-badge">
            <img src={adminLogo} alt="Thành Công" className="admin-login-logo-img" />
          </div>
          <h1 className="admin-login-title">Đăng nhập quản trị</h1>
          <p className="admin-login-subtitle">Hệ thống quản lý Thành Công Việt Nam</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="admin-login-error" role="alert">
            <ExclamationCircleOutlined className="admin-login-error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="admin-login-form" onSubmit={handleSubmit} autoComplete="on">
          <div className="admin-login-field">
            <label className="admin-login-label" htmlFor="admin-email">
              Email đăng nhập
            </label>
            <div className="admin-login-input-wrapper">
              <MailOutlined className="admin-login-input-icon" />
              <input
                id="admin-email"
                className="admin-login-input"
                type="email"
                placeholder="Nhập địa chỉ email..."
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          <div className="admin-login-field">
            <label className="admin-login-label" htmlFor="admin-password">
              Mật khẩu
            </label>
            <div className="admin-login-input-wrapper">
              <LockOutlined className="admin-login-input-icon" />
              <input
                id="admin-password"
                className="admin-login-input"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu..."
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="admin-login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="admin-login-options">
            <label className="admin-login-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="admin-login-submit"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* Footer */}
        <div className="admin-login-footer">
          <a
            className="admin-login-back"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            <ArrowLeftOutlined /> Quay lại trang chủ
          </a>
          <p className="admin-login-copyright">
            © {new Date().getFullYear()} Thành Công Việt Nam. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}


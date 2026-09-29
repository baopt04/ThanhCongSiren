import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, message } from "antd";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { createAccount } from "../../services/LoginService";
import "./RegisterPage.css";

export function RegisterPage() {
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    // 1. Validate Họ và tên
    if (!fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên.";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự.";
    }

    // 2. Validate Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập địa chỉ email.";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Địa chỉ email không đúng định dạng.";
    }

    // 3. Validate Mật khẩu (tối thiểu 6 ký tự)
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có tối thiểu 6 ký tự.";
    }

    // 4. Validate Xác nhận mật khẩu
    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu để xác nhận.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không trùng khớp.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Click "Đăng ký" -> Validate -> Mở popup xác nhận
  const handlePreSubmit = (e) => {
    e.preventDefault();
    setServerError("");

    if (validateForm()) {
      setIsConfirmModalOpen(true);
    }
  };

  // Xác nhận lần cuối -> Gửi dữ liệu về backend
  const handleConfirmRegister = async () => {
    setIsConfirmModalOpen(false);
    setLoading(true);
    setServerError("");

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        password: password,
      };

      const response = await createAccount(payload);
      console.log("[Register] Phản hồi tạo tài khoản:", response);

      message.success("Đăng ký tài khoản thành công! Đang chuyển hướng sang trang đăng nhập...");

      // Tự động chuyển về trang đăng nhập sau 1.5 giây
      setTimeout(() => {
        navigate("/dang-nhap", { replace: true });
      }, 1500);
    } catch (err) {
      console.error("[Register Error]:", err);
      let errMsg = "Đăng ký tài khoản không thành công. Vui lòng thử lại.";

      if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errMsg = err.response.data.error;
      } else if (typeof err.response?.data === "string") {
        errMsg = err.response.data;
      } else if (!err.response && err.message) {
        errMsg = `Không thể kết nối đến máy chủ (${err.message}). Vui lòng thử lại sau.`;
      }

      setServerError(errMsg);
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="register-breadcrumb">
        <div className="register-breadcrumb-inner">
          <Link to="/">Trang chủ</Link>
          <span>›</span>
          <span>Đăng ký</span>
        </div>
      </div>

      <div className="register-page">
        <div className="register-container">
          {/* Banner bên trái */}
          <div className="register-left">
            <img
              src="https://shopdunk.com/images/uploaded/banner/VNU_M492_08%201.jpeg"
              alt="register-banner"
              className="register-image"
            />
          </div>

          {/* Form bên phải */}
          <div className="register-right">
            <h2>Đăng ký tài khoản</h2>
            <p className="register-subtitle">
              Tạo tài khoản để trải nghiệm mua sắm và theo dõi đơn hàng tiện lợi.
            </p>

            {serverError && (
              <div className="register-alert-error" role="alert">
                <ExclamationCircleOutlined />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handlePreSubmit} noValidate>
              {/* Họ và tên */}
              <div className="register-form-group">
                <label htmlFor="reg-fullname">
                  Họ và tên <span className="register-required">*</span>
                </label>
                <div className="register-input-wrapper">
                  <input
                    id="reg-fullname"
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: "" });
                    }}
                    className={errors.fullName ? "input-error" : ""}
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>
                {errors.fullName && (
                  <span className="register-field-error">{errors.fullName}</span>
                )}
              </div>

              {/* Email */}
              <div className="register-form-group">
                <label htmlFor="reg-email">
                  Địa chỉ Email <span className="register-required">*</span>
                </label>
                <div className="register-input-wrapper">
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="Ví dụ: email@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    className={errors.email ? "input-error" : ""}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <span className="register-field-error">{errors.email}</span>
                )}
              </div>

              {/* Mật khẩu */}
              <div className="register-form-group">
                <label htmlFor="reg-password">
                  Mật khẩu <span className="register-required">*</span>
                </label>
                <div className="register-input-wrapper">
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tối thiểu 6 ký tự..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    className={errors.password ? "input-error" : ""}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                </div>
                {errors.password ? (
                  <span className="register-field-error">{errors.password}</span>
                ) : (
                  <span className="register-hint">Mật khẩu phải chứa ít nhất 6 ký tự.</span>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="register-form-group">
                <label htmlFor="reg-confirm-password">
                  Xác nhận mật khẩu <span className="register-required">*</span>
                </label>
                <div className="register-input-wrapper">
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu..."
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                    }}
                    className={errors.confirmPassword ? "input-error" : ""}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="register-field-error">{errors.confirmPassword}</span>
                )}
              </div>

              {/* Nút gửi */}
              <button
                type="submit"
                className="register-btn"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
              </button>

              {/* Đã có tài khoản */}
              <p className="register-login-link">
                Bạn đã có tài khoản?
                <Link to="/dang-nhap">Đăng nhập ngay</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Modal xác nhận thông tin trước khi gửi về backend */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#1565c0", fontSize: 18 }}>
            <CheckCircleOutlined />
            <span>Xác nhận thông tin đăng ký</span>
          </div>
        }
        open={isConfirmModalOpen}
        onOk={handleConfirmRegister}
        onCancel={() => setIsConfirmModalOpen(false)}
        okText="Xác nhận tạo tài khoản"
        cancelText="Chỉnh sửa lại"
        okButtonProps={{
          style: { background: "#1565c0", borderColor: "#1565c0" },
          loading: loading,
        }}
        centered
      >
        <div style={{ padding: "10px 0", fontSize: 14, color: "#444", lineHeight: "1.8" }}>
          <p style={{ marginBottom: 12 }}>
            Vui lòng kiểm tra lại thông tin trước khi tiến hành gửi đăng ký:
          </p>
          <div
            style={{
              background: "#f8fafc",
              padding: "14px 18px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div>
              <span style={{ color: "#64748b", display: "inline-flex", alignItems: "center", gap: 6, width: 100 }}>
                <UserOutlined /> Họ và tên:
              </span>
              <strong style={{ color: "#0f172a" }}>{fullName.trim()}</strong>
            </div>
            <div>
              <span style={{ color: "#64748b", display: "inline-flex", alignItems: "center", gap: 6, width: 100 }}>
                <MailOutlined /> Email:
              </span>
              <strong style={{ color: "#0f172a" }}>{email.trim()}</strong>
            </div>
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
            * Sau khi đăng ký thành công, bạn có thể đăng nhập ngay bằng email và mật khẩu này.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default RegisterPage;

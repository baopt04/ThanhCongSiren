import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import {
    EyeOutlined,
    EyeInvisibleOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import { login } from "../../../../services/LoginService";
import { saveAdminAuth, saveCustomerAuth } from "../../../../utils/auth";
import "./Login.css";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            setError("Vui lòng nhập địa chỉ email.");
            return;
        }
        if (!password.trim()) {
            setError("Vui lòng nhập mật khẩu.");
            return;
        }

        setLoading(true);
        try {
            const response = await login({ email: email.trim(), password });
            console.log("[CustomerLogin] Phản hồi từ server:", response);

            const authData = response?.data?.accessToken
                ? response.data
                : response?.accessToken
                    ? response
                    : null;

            if (authData?.accessToken) {
                if (authData.role === "ADMIN") {
                    saveAdminAuth(authData);
                    message.success("Đăng nhập thành công với quyền Quản trị viên!");
                    navigate("/admin", { replace: true });
                } else {
                    saveCustomerAuth(authData);
                    message.success(`Đăng nhập thành công! Xin chào ${authData.fullName || authData.email}`);
                    navigate("/", { replace: true });
                }
            } else {
                setError(response?.message || "Đăng nhập không thành công.");
            }
        } catch (err) {
            console.error("[CustomerLogin Error]", err);
            let errMsg = "Email hoặc mật khẩu không chính xác.";
            if (err.response?.data?.message) {
                errMsg = err.response.data.message;
            } else if (err.response?.data?.error) {
                errMsg = err.response.data.error;
            } else if (!err.response && err.message) {
                errMsg = `Không thể kết nối đến máy chủ (${err.message}). Vui lòng kiểm tra lại backend.`;
            }
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="register-breadcrumb">
                <div className="register-breadcrumb-inner">
                    <Link to="/">Trang chủ</Link>
                    <span>›</span>
                    <span>Đăng nhập</span>
                </div>
            </div>

            <div className="login-page">
                <div className="login-container">
                    <div className="login-left">
                        <img
                            src="https://shopdunk.com/images/uploaded/banner/VNU_M492_08%201.jpeg"
                            alt="login"
                            className="login-image"
                        />
                    </div>

                    <div className="login-right">
                        <h2>Đăng nhập</h2>
                        <p className="login-subtitle">
                            Đăng nhập tài khoản để quản lý đơn hàng và ưu đãi dành riêng cho bạn.
                        </p>

                        {error && (
                            <div className="login-alert-error" role="alert">
                                <ExclamationCircleOutlined />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
                            <label htmlFor="customer-email">Email đăng nhập:</label>
                            <div className="login-input-wrapper">
                                <input
                                    id="customer-email"
                                    type="email"
                                    placeholder="Nhập địa chỉ email..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    autoComplete="email"
                                    autoFocus
                                />
                            </div>

                            <label htmlFor="customer-password">Mật khẩu:</label>
                            <div className="login-input-wrapper">
                                <input
                                    id="customer-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nhập mật khẩu..."
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                </button>
                            </div>

                            <div className="login-options">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        disabled={loading}
                                    />
                                    Nhớ mật khẩu
                                </label>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        message.info("Vui lòng liên hệ hotline 0865.130.088 để được hỗ trợ cấp lại mật khẩu.");
                                    }}
                                >
                                    Quên mật khẩu?
                                </a>
                            </div>

                            <button type="submit" className="login-btn" disabled={loading}>
                                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </button>

                            <p className="register">
                                Bạn Chưa Có Tài Khoản?{" "}
                                <Link to="/dang-ky">Tạo tài khoản ngay</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
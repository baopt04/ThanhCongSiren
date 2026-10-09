import { memo, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  SafetyCertificateOutlined,
  PhoneOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  LockOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";

const Dropdown = lazy(() => import("antd").then((m) => ({ default: m.Dropdown })));

export const HeaderTopBar = memo(function HeaderTopBar({ customerUser, onLogout }) {
  const menuItems = useMemo(() => {
    if (!customerUser) return [];

    return [
      {
        key: "user-info",
        label: (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 2px" }}>
            {customerUser.avatar ? (
              <img
                src={customerUser.avatar}
                alt="Avatar"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #e2e8f0",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#fee2e2",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 15,
                  flexShrink: 0,
                }}
              >
                {(customerUser.fullName || customerUser.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  color: "#0f172a",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 160,
                }}
              >
                {customerUser.fullName || "Khách hàng"}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 160,
                }}
              >
                {customerUser.email}
              </div>
            </div>
          </div>
        ),
        disabled: true,
      },
      { type: "divider" },
      {
        key: "my-profile",
        icon: <UserOutlined />,
        label: <Link to="/tai-khoan?tab=profile">Tài khoản của tôi</Link>,
      },
      {
        key: "my-address",
        icon: <EnvironmentOutlined />,
        label: <Link to="/tai-khoan?tab=address">Địa chỉ nhận hàng</Link>,
      },
      {
        key: "my-orders",
        icon: <ShoppingOutlined />,
        label: <Link to="/tai-khoan?tab=orders">Đơn mua</Link>,
      },
      {
        key: "change-password",
        icon: <LockOutlined />,
        label: <Link to="/tai-khoan?tab=password">Đổi mật khẩu</Link>,
      },
      { type: "divider" },
      ...(customerUser.role === "ADMIN"
        ? [
            {
              key: "admin-panel",
              icon: <SafetyCertificateOutlined />,
              label: <Link to="/admin">Trang quản trị Admin</Link>,
            },
            { type: "divider" },
          ]
        : []),
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
        danger: true,
        onClick: onLogout,
      },
    ];
  }, [customerUser, onLogout]);

  return (
    <div className="tc-header-top">
      <div className="tc-header-top-inner">
        <div className="tc-header-top-info">
          <span className="tc-hotline-item">
            Hotline tư vấn: <strong>0865 130 088</strong>
          </span>
        </div>
        <div className="tc-header-top-right">
          <Link to="/tin-tuc">Dự án đã thi công</Link>
          <span className="tc-top-divider">|</span>
          <Link to="/gio-hang">Kiểm tra đơn hàng</Link>
          <span className="tc-top-divider">|</span>
          {customerUser ? (
            <Suspense
              fallback={
                <span className="tc-top-user-btn">
                  <UserOutlined />
                  <span className="tc-user-name">
                    {customerUser.fullName || customerUser.email}
                  </span>
                </span>
              }
            >
              <Dropdown
                menu={{ items: menuItems }}
                placement="bottomRight"
                trigger={["click", "hover"]}
              >
                <span className="tc-top-user-btn">
                  {customerUser.avatar ? (
                    <img
                      src={customerUser.avatar}
                      alt="Avatar"
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginRight: 2,
                        display: "inline-block",
                        verticalAlign: "middle",
                      }}
                    />
                  ) : (
                    <UserOutlined />
                  )}
                  <span className="tc-user-name">
                    {customerUser.fullName || customerUser.email}
                  </span>
                  <DownOutlined style={{ fontSize: 10 }} />
                </span>
              </Dropdown>
            </Suspense>
          ) : (
            <Link to="/dang-nhap" className="tc-top-login-clean">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </div>
  );
});

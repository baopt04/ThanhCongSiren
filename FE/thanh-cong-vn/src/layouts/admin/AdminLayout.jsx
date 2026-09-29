import { useState, useEffect, useCallback } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, ConfigProvider, Breadcrumb, Dropdown } from "antd";
import {
  AppstoreOutlined,
  TagsOutlined,
  ShoppingOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  FolderOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ExportOutlined,
  HomeOutlined,
  LogoutOutlined,
  FileDoneOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { clearAuth, getAdminUser } from "../../utils/auth";
import { RouteSkeleton } from "../../components/common/RouteSkeleton";
import adminLogo from "../../assets/logo.webp";
import "./AdminLayout.css";

const { Sider, Header, Content } = Layout;

/** ≤768: drawer (phone / iPad dọc). >768: sidebar cố định */
const MOBILE_MQ = "(max-width: 768px)";

const routeNames = {
  "/admin": "Tổng quan",
  "/admin/bills": "Quản lý hóa đơn",
  "/admin/brands": "Thương hiệu",
  "/admin/categories": "Danh mục sản phẩm",
  "/admin/products": "Quản lý sản phẩm",
  "/admin/product-specs": "Thông số sản phẩm",
  "/admin/news-categories": "Danh mục tin tức",
  "/admin/posts": "Quản lý bài viết",
  "/admin/users": "Quản lý người dùng",
};

const menuItems = [
  {
    key: "grp-overview",
    label: "TỔNG QUAN",
    type: "group",
    children: [
      { key: "/admin", icon: <AppstoreOutlined />, label: "Bảng điều khiển" },
    ],
  },
  {
    key: "grp-commerce",
    label: "QUẢN LÝ BÁN HÀNG",
    type: "group",
    children: [
      { key: "/admin/bills", icon: <FileDoneOutlined />, label: "Hóa đơn / Đơn hàng" },
      { key: "/admin/products", icon: <ShoppingOutlined />, label: "Sản phẩm" },
      { key: "/admin/product-specs", icon: <UnorderedListOutlined />, label: "Thông số SP" },
      { key: "/admin/categories", icon: <FolderOutlined />, label: "Danh mục SP" },
      { key: "/admin/brands", icon: <TagsOutlined />, label: "Thương hiệu" },
    ],
  },
  {
    key: "grp-content",
    label: "BÀI VIẾT & TIN TỨC",
    type: "group",
    children: [
      { key: "/admin/posts", icon: <FileTextOutlined />, label: "Bài viết" },
      { key: "/admin/news-categories", icon: <FolderOutlined />, label: "Danh mục tin" },
    ],
  },
  {
    key: "grp-system",
    label: "HỆ THỐNG",
    type: "group",
    children: [
      { key: "/admin/users", icon: <UserOutlined />, label: "Người dùng" },
    ],
  },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_MQ).matches : false
  );
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname.replace(/\/$/, "") || "/admin";
  const currentTitle = routeNames[currentPath] || "Trang quản trị";
  const adminUser = getAdminUser();

  const closeMobileMenu = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname, closeMobileMenu]);

  useEffect(() => {
    if (!isMobile) {
      document.body.classList.remove("admin-scroll-lock");
      return;
    }
    document.body.classList.toggle("admin-scroll-lock", mobileOpen);
    return () => document.body.classList.remove("admin-scroll-lock");
  }, [isMobile, mobileOpen]);

  const handleLogout = () => {
    clearAuth();
    navigate("/admin/login", { replace: true });
  };

  const handleTriggerClick = () => {
    if (isMobile) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  };

  const siderCollapsed = isMobile ? false : collapsed;
  const siderCollapsedWidth = isMobile ? 0 : 80;
  const desktopSiderWidth = collapsed ? 80 : 240;
  const mainMarginLeft = isMobile ? 0 : desktopSiderWidth;
  const showLogoText = isMobile || !collapsed;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#2563eb",
          colorInfo: "#2563eb",
          colorSuccess: "#10b981",
          colorWarning: "#f59e0b",
          colorError: "#ef4444",
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
      }}
    >
      <Layout
        className={`admin-layout ${isMobile ? "is-mobile" : "is-desktop"} ${mobileOpen ? "is-sider-open" : ""}`}
      >
        {isMobile && (
          <div
            className={`admin-sider-backdrop ${mobileOpen ? "is-open" : ""}`}
            onClick={closeMobileMenu}
            aria-hidden={!mobileOpen}
          />
        )}

        <Sider
          trigger={null}
          collapsible
          collapsed={siderCollapsed}
          width={isMobile ? 280 : 240}
          collapsedWidth={siderCollapsedWidth}
          className={`admin-sider ${isMobile ? "admin-sider--mobile" : ""} ${mobileOpen ? "is-open" : ""}`}
        >
          <div className="admin-logo-wrapper">
            <div className="admin-logo-icon">
              <img src={adminLogo} alt="Thành Công" className="admin-logo-img" />
            </div>
            {showLogoText && (
              <div className="admin-logo-text">
                <span className="admin-logo-brand">THÀNH CÔNG</span>
                <span className="admin-logo-badge">Hệ Thống Quản Trị</span>
              </div>
            )}
            {isMobile && (
              <button
                type="button"
                className="admin-sider-close"
                onClick={closeMobileMenu}
                aria-label="Đóng menu"
              >
                <CloseOutlined />
              </button>
            )}
          </div>

          <Menu
            theme="dark"
            mode="inline"
            className="admin-menu"
            selectedKeys={[currentPath]}
            inlineCollapsed={isMobile ? false : collapsed}
            items={menuItems}
            onClick={({ key }) => {
              if (key && !key.startsWith("grp-")) {
                navigate(key);
                if (isMobile) closeMobileMenu();
              }
            }}
          />
        </Sider>

        <Layout
          className="admin-main"
          style={
            isMobile
              ? { marginLeft: 0, width: "100%" }
              : {
                  marginLeft: mainMarginLeft,
                  width: `calc(100% - ${desktopSiderWidth}px)`,
                }
          }
        >
          <Header className="admin-header">
            <div className="admin-header-left">
              <button
                type="button"
                className="admin-trigger"
                onClick={handleTriggerClick}
                title={
                  isMobile
                    ? mobileOpen
                      ? "Đóng menu"
                      : "Mở menu"
                    : collapsed
                      ? "Mở rộng thanh menu"
                      : "Thu gọn thanh menu"
                }
                aria-label="Toggle menu"
              >
                {isMobile ? (
                  mobileOpen ? <CloseOutlined /> : <MenuUnfoldOutlined />
                ) : collapsed ? (
                  <MenuUnfoldOutlined />
                ) : (
                  <MenuFoldOutlined />
                )}
              </button>

              <Breadcrumb
                className="admin-breadcrumb"
                items={[
                  {
                    title: (
                      <span className="admin-breadcrumb-root">
                        <HomeOutlined /> Admin
                      </span>
                    ),
                  },
                  {
                    title: <span className="admin-breadcrumb-current">{currentTitle}</span>,
                  },
                ]}
              />

              <h1 className="admin-mobile-page-title">{currentTitle}</h1>
            </div>

            <div className="admin-header-right">
              {!isMobile && (
                <NavLink to="/" target="_blank" className="admin-view-site-btn" title="Xem Website">
                  <span className="admin-view-site-label">Xem Website</span>
                  <ExportOutlined style={{ fontSize: 12 }} />
                </NavLink>
              )}

              <Dropdown
                menu={{
                  items: [
                    {
                      key: "logout",
                      icon: <LogoutOutlined />,
                      label: "Đăng xuất",
                      danger: true,
                      onClick: handleLogout,
                    },
                  ],
                }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <div className="admin-user-badge" style={{ cursor: "pointer" }}>
                  <div className="admin-user-avatar">
                    <UserOutlined />
                  </div>
                  {!isMobile && (
                    <div className="admin-user-info">
                      <span className="admin-user-name">{adminUser?.fullName || "Quản Trị Viên"}</span>
                      <span className="admin-user-role">● Trực tuyến</span>
                    </div>
                  )}
                </div>
              </Dropdown>
            </div>
          </Header>

          <Content className="admin-content">
            <RouteSkeleton layout="admin" duration={0}>
              <Outlet />
            </RouteSkeleton>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

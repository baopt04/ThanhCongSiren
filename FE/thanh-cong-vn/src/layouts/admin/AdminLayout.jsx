import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
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
  LogoutOutlined,
} from "@ant-design/icons";
import "./AdminLayout.css";

const { Sider, Header, Content } = Layout;

const menuItems = [
  { key: "/admin", icon: <AppstoreOutlined />, label: "Tổng quan" },
  { key: "/admin/brands", icon: <TagsOutlined />, label: "Thương hiệu" },
  { key: "/admin/categories", icon: <FolderOutlined />, label: "Danh mục" },
  { key: "/admin/products", icon: <ShoppingOutlined />, label: "Sản phẩm" },
  { key: "/admin/product-specs", icon: <UnorderedListOutlined />, label: "Thông số SP" },
  { key: "/admin/news-categories", icon: <FolderOutlined />, label: "Danh mục tin tức" },
  { key: "/admin/posts", icon: <FileTextOutlined />, label: "Bài viết" },
  { key: "/admin/users", icon: <UserOutlined />, label: "Người dùng" },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout className="admin-layout">
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark" className="admin-sider">
        <div className="admin-logo">
          {!collapsed && <span>Admin Panel</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname.replace(/\/$/, "") || "/admin"]}
          items={menuItems.map((item) => ({
            ...item,
            onClick: () => navigate(item.key),
          }))}
        />
      </Sider>
      <Layout className="admin-main" style={{ marginLeft: collapsed ? 80 : 200 }}>
        <Header className="admin-header">
          <div className="admin-header-left">
            {collapsed ? (
              <MenuUnfoldOutlined className="admin-trigger" onClick={() => setCollapsed(false)} />
            ) : (
              <MenuFoldOutlined className="admin-trigger" onClick={() => setCollapsed(true)} />
            )}
            <span className="admin-title">Quản lý bán hàng</span>
          </div>
          <div className="admin-header-right">
            <NavLink to="/" className="admin-back">
              <LogoutOutlined /> Về trang chủ
            </NavLink>
          </div>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

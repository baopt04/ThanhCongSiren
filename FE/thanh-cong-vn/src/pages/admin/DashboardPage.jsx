import { useState, useEffect } from "react";
import { Card, Row, Col, Button, Tag, Table, Spin, Space, Tooltip } from "antd";
import {
  ShoppingOutlined,
  TagsOutlined,
  FileTextOutlined,
  UserOutlined,
  PlusOutlined,
  ReloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../../services/ProductService";
import { getAllBrands } from "../../services/BrandsService";
import { getAllCategories } from "../../services/CategoryService";
import { getAllPosts } from "../../services/PostsService";
import { getAllUser } from "../../services/UserService";
import adminLogo from "../../assets/logo.webp";

export function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: [],
    totalBrands: 0,
    totalCategories: 0,
    totalPosts: 0,
    publishedPosts: 0,
    totalUsers: 0,
    recentPosts: [],
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [prodRes, brandRes, catRes, postRes, userRes] = await Promise.allSettled([
        getAllProducts(),
        getAllBrands(),
        getAllCategories(),
        getAllPosts(),
        getAllUser(),
      ]);

      const products = prodRes.status === "fulfilled" ? prodRes.value?.data || [] : [];
      const brands = brandRes.status === "fulfilled" ? brandRes.value?.data || [] : [];
      const categories = catRes.status === "fulfilled" ? catRes.value?.data || [] : [];
      const posts = postRes.status === "fulfilled" ? postRes.value?.data || [] : [];
      const users = userRes.status === "fulfilled" ? userRes.value?.data || [] : [];

      const activeProducts = products.filter((p) => p.isActive === 1 || p.isActive === true).length;
      const lowStockProducts = products
        .filter((p) => (Number(p.stockQuantity) || 0) <= 10)
        .slice(0, 6);

      const publishedPosts = posts.filter((p) => p.status === "PUBLISHED").length;
      const recentPosts = [...posts].slice(0, 5);

      setStats({
        totalProducts: products.length,
        activeProducts,
        lowStockProducts,
        totalBrands: brands.length,
        totalCategories: categories.length,
        totalPosts: posts.length,
        publishedPosts,
        totalUsers: users.length,
        recentPosts,
      });
    } catch (err) {
      console.error("Lỗi nạp dữ liệu dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const lowStockColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <span style={{ fontWeight: 600, color: "#1e293b" }}>{text}</span>
          {record.sku && (
            <div style={{ fontSize: 11, color: "#64748b" }}>SKU: {record.sku}</div>
          )}
        </div>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      width: 110,
      render: (val) => {
        const qty = Number(val) || 0;
        return qty === 0 ? (
          <span className="admin-badge-stock-out">Hết hàng (0)</span>
        ) : (
          <span className="admin-badge-stock-low">Còn {qty} chiếc</span>
        );
      },
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (val) => `${Number(val || 0).toLocaleString("vi-VN")} ₫`,
    },
  ];

  const recentPostsColumns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text) => (
        <span style={{ fontWeight: 500, color: "#1e293b" }}>{text}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        if (status === "PUBLISHED") return <Tag color="green">Đã xuất bản</Tag>;
        if (status === "DRAFT") return <Tag color="orange">Bản nháp</Tag>;
        return <Tag color="default">Đã ẩn</Tag>;
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Welcome Banner */}
      <div
        className="admin-dashboard-welcome"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
          borderRadius: 14,
          padding: "24px 28px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)",
        }}
      >
        <div className="admin-dashboard-welcome-main">
          <div className="admin-dashboard-logo">
            <img src={adminLogo} alt="Thành Công" />
          </div>
          <div>
            <h2 style={{ color: "#ffffff", fontSize: 24, fontWeight: 700, margin: 0 }}>
              Xin chào, Quản trị viên! 👋
            </h2>
            <p style={{ color: "#bfdbfe", fontSize: 14, margin: "6px 0 0" }}>
              Chào mừng bạn quay trở lại hệ thống quản trị Thành Công Siren. Dưới đây là tổng quan hoạt động hôm nay.
            </p>
          </div>
        </div>

        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={fetchDashboardData}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(4px)",
              borderRadius: 8,
            }}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/products")}
            style={{
              background: "#ffffff",
              color: "#1e3a8a",
              fontWeight: 600,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            Thêm sản phẩm
          </Button>
        </Space>
      </div>

      {/* 4 Stat Cards */}
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <div
            className="admin-card"
            style={{
              padding: "20px 22px",
              cursor: "pointer",
              borderLeft: "4px solid #2563eb",
            }}
            onClick={() => navigate("/admin/products")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>TỔNG SẢN PHẨM</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                  {loading ? <Spin size="small" /> : stats.totalProducts}
                </div>
                <div style={{ fontSize: 12, color: "#10b981", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <CheckCircleOutlined /> <span>{stats.activeProducts} đang mở bán</span>
                </div>
              </div>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: "#eff6ff",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                <ShoppingOutlined />
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div
            className="admin-card"
            style={{
              padding: "20px 22px",
              cursor: "pointer",
              borderLeft: "4px solid #10b981",
            }}
            onClick={() => navigate("/admin/categories")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>DANH MỤC & HIỆU</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                  {loading ? <Spin size="small" /> : stats.totalCategories}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                  <span>{stats.totalBrands} Thương hiệu đối tác</span>
                </div>
              </div>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: "#ecfdf5",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                <TagsOutlined />
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div
            className="admin-card"
            style={{
              padding: "20px 22px",
              cursor: "pointer",
              borderLeft: "4px solid #f59e0b",
            }}
            onClick={() => navigate("/admin/posts")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>BÀI VIẾT & TIN TỨC</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                  {loading ? <Spin size="small" /> : stats.totalPosts}
                </div>
                <div style={{ fontSize: 12, color: "#f59e0b", marginTop: 6 }}>
                  <span>{stats.publishedPosts} bài đã xuất bản</span>
                </div>
              </div>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: "#fffbeb",
                  color: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                <FileTextOutlined />
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div
            className="admin-card"
            style={{
              padding: "20px 22px",
              cursor: "pointer",
              borderLeft: "4px solid #8b5cf6",
            }}
            onClick={() => navigate("/admin/users")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>NGƯỜI DÙNG</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                  {loading ? <Spin size="small" /> : stats.totalUsers}
                </div>
                <div style={{ fontSize: 12, color: "#8b5cf6", marginTop: 6 }}>
                  <span>Tài khoản hệ thống</span>
                </div>
              </div>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: "#f5f3ff",
                  color: "#8b5cf6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                <UserOutlined />
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Quick Actions Shortcuts */}
      <div
        className="admin-card"
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 600, color: "#475569", fontSize: 13.5 }}>
          Lối tắt nhanh:
        </span>
        <Space wrap>
          <Button
            icon={<ShoppingOutlined />}
            onClick={() => navigate("/admin/products")}
            style={{ borderRadius: 8 }}
          >
            Quản lý sản phẩm
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => navigate("/admin/posts")}
            style={{ borderRadius: 8 }}
          >
            Đăng bài viết mới
          </Button>
          <Button
            icon={<AppstoreOutlined />}
            onClick={() => navigate("/admin/categories")}
            style={{ borderRadius: 8 }}
          >
            Danh mục sản phẩm
          </Button>
          <Button
            icon={<UserOutlined />}
            onClick={() => navigate("/admin/users")}
            style={{ borderRadius: 8 }}
          >
            Phân quyền người dùng
          </Button>
        </Space>
      </div>

      {/* 2 Analytical Tables */}
      <Row gutter={[20, 20]}>
        {/* Low Stock Alert */}
        <Col xs={24} lg={13}>
          <div className="admin-card" style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <WarningOutlined style={{ color: "#ef4444", fontSize: 18 }} />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                  Cảnh báo tồn kho thấp (≤ 10 chiếc)
                </h3>
              </div>
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/admin/products")}
                style={{ padding: 0 }}
              >
                Xem tất cả <ArrowRightOutlined />
              </Button>
            </div>

            <Table
              dataSource={stats.lowStockProducts}
              columns={lowStockColumns}
              rowKey="id"
              pagination={false}
              size="small"
              loading={loading}
              scroll={{ x: 560 }}
              locale={{
                emptyText: "Không có sản phẩm nào sắp hết hàng. Kho hàng dồi dào!",
              }}
            />
          </div>
        </Col>

        {/* Recent Posts */}
        <Col xs={24} lg={11}>
          <div className="admin-card" style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileTextOutlined style={{ color: "#2563eb", fontSize: 18 }} />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                  Bài viết gần đây
                </h3>
              </div>
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/admin/posts")}
                style={{ padding: 0 }}
              >
                Xem tất cả <ArrowRightOutlined />
              </Button>
            </div>

            <Table
              dataSource={stats.recentPosts}
              columns={recentPostsColumns}
              rowKey="id"
              pagination={false}
              size="small"
              loading={loading}
              scroll={{ x: 480 }}
              locale={{ emptyText: "Chưa có bài viết nào" }}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}


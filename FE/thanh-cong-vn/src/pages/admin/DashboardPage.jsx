import { Card, Row, Col } from "antd";
import { ShoppingOutlined, TagsOutlined, FileTextOutlined, UserOutlined } from "@ant-design/icons";

export function DashboardPage() {
  const stats = [
    { title: "Sản phẩm", value: "-", icon: <ShoppingOutlined />, color: "#1890ff" },
    { title: "Thương hiệu", value: "-", icon: <TagsOutlined />, color: "#52c41a" },
    { title: "Bài viết", value: "-", icon: <FileTextOutlined />, color: "#faad14" },
    { title: "Người dùng", value: "-", icon: <UserOutlined />, color: "#722ed1" },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Tổng quan</h2>
      <Row gutter={[16, 16]}>
        {stats.map((s, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 32, color: s.color }}>{s.icon}</div>
                <div>
                  <div style={{ color: "#999", fontSize: 14 }}>{s.title}</div>
                  <div style={{ fontSize: 24, fontWeight: 600 }}>{s.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

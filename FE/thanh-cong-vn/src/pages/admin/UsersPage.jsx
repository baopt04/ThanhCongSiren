import { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Tag,
  Tooltip,
  Popconfirm,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
  getAllUser,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/UserService";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Quản trị viên (ADMIN)" },
  { value: "USER", label: "Người dùng (USER)" },
];

export function UsersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // Filters
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterRole, setFilterRole] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllUser();
      setData(res.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi tải dữ liệu người dùng");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(kw);
        const matchEmail = item.email?.toLowerCase().includes(kw);
        const matchPhone = item.phone?.toLowerCase().includes(kw);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }
      if (filterRole !== null && item.role !== filterRole) {
        return false;
      }
      if (filterStatus !== null) {
        const isActive = item.status === 1 || item.status === true;
        if (filterStatus === 1 && !isActive) return false;
        if (filterStatus === 0 && isActive) return false;
      }
      return true;
    });
  }, [data, searchKeyword, filterRole, filterStatus]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role,
      };
      if (values.password) payload.password = values.password;

      if (editingId) {
        await updateUser(editingId, payload);
        message.success("Cập nhật thông tin người dùng thành công");
      } else {
        await createUser(payload);
        message.success("Thêm người dùng mới thành công");
      }

      setModalOpen(false);
      form.resetFields();
      setEditingId(null);
      fetchData();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || "Lỗi xử lý người dùng");
    }
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      phone: record.phone,
      role: record.role,
    });
    setEditingId(record.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      message.success("Đã xóa tài khoản");
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi khi xóa tài khoản");
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <span style={{ color: "#64748b" }}>{index + 1}</span>
      ),
    },
    {
      title: "Họ và Tên",
      key: "name",
      render: (_, record) => {
        const initial = record.name ? record.name.charAt(0).toUpperCase() : "U";
        const isAdmin = record.role === "ADMIN";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar
              style={{
                backgroundColor: isAdmin ? "#7c3aed" : "#2563eb",
                fontWeight: 600,
              }}
            >
              {initial}
            </Avatar>
            <div>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>{record.name}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>ID: #{record.id}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <span style={{ color: "#334155", fontWeight: 500 }}>{email}</span>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone || <span style={{ color: "#94a3b8" }}>Chưa cập nhật</span>,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 140,
      render: (role) => {
        if (role === "ADMIN") {
          return (
            <Tag color="purple" icon={<CrownOutlined />} style={{ padding: "2px 8px" }}>
              Quản trị viên
            </Tag>
          );
        }
        return (
          <Tag color="blue" icon={<UserOutlined />} style={{ padding: "2px 8px" }}>
            Người dùng
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => {
        const isActive = status === 1 || status === true;
        return isActive ? (
          <Tag color="green" style={{ padding: "2px 8px" }}>
            ● Hoạt động
          </Tag>
        ) : (
          <Tag color="red" style={{ padding: "2px 8px" }}>
            ● Bị khóa
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space size={8}>
          <Tooltip title="Chỉnh sửa tài khoản">
            <button
              className="admin-btn-action admin-btn-edit"
              onClick={() => handleEdit(record)}
            >
              <EditOutlined />
            </button>
          </Tooltip>

          <Popconfirm
            title="Xác nhận xóa tài khoản"
            description={`Bạn có chắc muốn xóa tài khoản "${record.name}"?`}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa tài khoản">
              <button className="admin-btn-action admin-btn-delete">
                <DeleteOutlined />
              </button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h2>Quản lý người dùng</h2>
          <p>Quản lý danh sách thành viên, phân quyền quản trị viên và trạng thái tài khoản</p>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Tải lại
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setEditingId(null);
              setModalOpen(true);
            }}
            style={{ borderRadius: 8 }}
          >
            Thêm tài khoản mới
          </Button>
        </Space>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <Input
            placeholder="Tìm theo tên, email, SĐT..."
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 260, borderRadius: 8 }}
            allowClear
          />

          <Select
            placeholder="Tất cả vai trò"
            value={filterRole}
            onChange={setFilterRole}
            style={{ width: 180 }}
            allowClear
            options={[
              { value: "ADMIN", label: "Quản trị viên (ADMIN)" },
              { value: "USER", label: "Người dùng (USER)" },
            ]}
          />

          <Select
            placeholder="Tất cả trạng thái"
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 160 }}
            allowClear
            options={[
              { value: 1, label: "Đang hoạt động" },
              { value: 0, label: "Bị khóa" },
            ]}
          />

          {(searchKeyword || filterRole !== null || filterStatus !== null) && (
            <Button
              type="dashed"
              onClick={() => {
                setSearchKeyword("");
                setFilterRole(null);
                setFilterStatus(null);
              }}
            >
              Đặt lại
            </Button>
          )}
        </div>

        <div className="admin-toolbar-right">
          <span style={{ fontSize: 13, color: "#64748b" }}>
            Hiển thị <strong>{filteredData.length}</strong> / {data.length} tài khoản
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="admin-table">
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Tổng cộng ${total} tài khoản`,
          }}
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
            {editingId ? "✏️ Cập nhật thông tin tài khoản" : "✨ Thêm tài khoản mới"}
          </div>
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setEditingId(null);
        }}
        okText={editingId ? "Cập nhật" : "Tạo tài khoản"}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn An" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Địa chỉ Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="admin@thanhcong.vn" />
          </Form.Item>

          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="0987654321" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={editingId ? [] : [{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            tooltip={editingId ? "Để trống nếu không muốn thay đổi mật khẩu hiện tại" : undefined}
          >
            <Input.Password placeholder={editingId ? "Để trống nếu giữ nguyên" : "••••••••"} />
          </Form.Item>

          <Form.Item
            name="role"
            label="Phân quyền vai trò"
            initialValue="USER"
            rules={[{ required: true }]}
          >
            <Select options={ROLE_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


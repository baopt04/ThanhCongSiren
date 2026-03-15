import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import apiClient from "../../api/client";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "Người dùng" },
];

export function UsersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/users");
      setData(res.data?.data ?? res.data ?? []);
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi tải dữ liệu");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
        await apiClient.put(`/users/${editingId}`, payload);
        message.success("Cập nhật thành công");
      } else {
        payload.password = values.password;
        await apiClient.post("/users", payload);
        message.success("Thêm thành công");
      }
      setModalOpen(false);
      form.resetFields();
      setEditingId(null);
      fetchData();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || "Lỗi");
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
    if (!confirm("Xóa người dùng này?")) return;
    try {
      await apiClient.delete(`/users/${id}`);
      message.success("Đã xóa");
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi xóa");
    }
  };

  const columns = [
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    { title: "Vai trò", dataIndex: "role", key: "role" },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Người dùng</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditingId(null); setModalOpen(true); }}>
          Thêm
        </Button>
      </div>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />
      <Modal
        title={editingId ? "Sửa người dùng" : "Thêm người dùng"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditingId(null); }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}><Input placeholder="user21" /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}><Input placeholder="mail1@gmail.com" /></Form.Item>
          <Form.Item name="phone" label="Số điện thoại"><Input placeholder="0987654321" /></Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={editingId ? [] : [{ required: true }]}>
            <Input.Password placeholder={editingId ? "Để trống nếu không đổi" : "1234"} />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" initialValue="USER" rules={[{ required: true }]}>
            <Select options={ROLE_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

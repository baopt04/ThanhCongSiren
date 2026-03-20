import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, message, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

import apiClient from "../../api/client";
import { getAllBrands, createBrand, updateBrand } from "../../services/BrandsService";
const STATUS_OPTIONS = [
  { value: 1, label: "Hoạt động" },
  { value: 0, label: "Ngưng hoạt động" },
];

export function BrandsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllBrands();
      setData(res.data ?? []);
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
      const payload = { name: values.name, description: values.description, status: values.status };
      if (editingId) {
        Modal.confirm({
          title: "Xác nhận sửa thương hiệu",
          content: "Bạn có chắc muốn sửa thương hiệu?",
          okText: "Xác nhận",
          cancelText: "Hủy",
          onOk: async () => {
            try {
              await updateBrand(editingId, payload);
              message.success("Sửa thành công");
              fetchData();
            } catch (err) {
              message.error(err.response?.data?.message || "Lỗi sửa thương hiệu");
            }
          }
        });
      } else {
        Modal.confirm({
          title: "Xác nhận thêm thương hiệu",
          content: "Bạn có chắc muốn thêm thương hiệu?",
          okText: "Xác nhận",
          cancelText: "Hủy",
          onOk: async () => {
            try {
              await createBrand(payload);
              message.success("Thêm thành công");
              fetchData();
            } catch (err) {
              message.error(err.response?.data?.message || "Lỗi thêm thương hiệu");
            }
          }
        });
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
    form.setFieldsValue({ name: record.name, description: record.description, status: record.status });
    setEditingId(record.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa thương hiệu này?")) return;
    try {
      await apiClient.delete(`/brands/${id}`);
      message.success("Đã xóa");
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi xóa");
    }
  };

  const columns = [
    {
      title: "STT", dataIndex: "stt", key: "stt", width: 80,
      render: (_, __, index) => index + 1
    },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v) => (
        v === 1
          ? <Tag color="green">Hoạt động</Tag>
          : <Tag color="red">Ngưng hoạt động</Tag>
      ),
    },
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
        <h2 style={{ margin: 0 }}>Thương hiệu</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditingId(null); setModalOpen(true); }}>
          Thêm
        </Button>
      </div>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />
      <Modal
        title={editingId ? "Sửa thương hiệu" : "Thêm thương hiệu"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditingId(null); }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên thương hiệu" rules={[{ required: true }]}>
            <Input placeholder="Nhập tên thương hiệu" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Mô tả" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue={1} rules={[{ required: true }]}>
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

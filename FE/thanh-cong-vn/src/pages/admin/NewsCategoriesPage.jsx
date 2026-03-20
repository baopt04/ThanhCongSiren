import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, message, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import apiClient from "../../api/client";
import { getAllCategoriesNew, createCategoryNew, deleteCategoryNews, updateCategoryNew, findById } from "../../services/CategoryNewService";
const STATUS_OPTIONS = [
  { value: 1, label: "Hoạt động" },
  { value: 0, label: "Ẩn" },
  { value: 2, label: "Khác" },
];

export function NewsCategoriesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllCategoriesNew();
      setData(res.data);
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
      const payload = { name: values.name, slug: values.slug, description: values.description, status: values.status };
      if (editingId) {
        Modal.confirm({
          title: "Xác nhận sửa danh mục tin tức",
          content: "Bạn có chắc muốn sửa danh mục tin tức?",
          okText: "Xác nhận",
          cancelText: "Hủy",
          onOk: async () => {
            try {
              await updateCategoryNew(editingId, payload);
              message.success("Sửa thành công");
              fetchData();
            } catch (err) {
              message.error(err.response?.data?.message || "Lỗi sửa danh mục tin tức");
            }
          }
        });
      } else {
        Modal.confirm({
          title: "Xác nhận thêm danh mục tin tức",
          content: "Bạn có chắc muốn thêm danh mục tin tức?",
          okText: "Xác nhận",
          cancelText: "Hủy",
          onOk: async () => {
            try {
              await createCategoryNew(payload);
              message.success("Thêm thành công");
              fetchData();
            } catch (err) {
              message.error(err.response?.data?.message || "Lỗi tạo danh mục tin tức");
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
    form.setFieldsValue({ name: record.name, slug: record.slug, description: record.description, status: record.status });
    setEditingId(record.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm(({
      title: "Xóa danh mục bài viết",
      content: "Bạn có chắc xóa không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteCategoryNews(id);
          message.success("Xóa danh mục thành công!")
          fetchData();
        } catch (error) {
          message.error(error.response?.data?.message || "Xóa thất bại!")
        }
      }
    }));

  };

  const columns = [
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    { title: "Trạng thái", dataIndex: "status", key: "status", render: (v) => (v === 1 ? <Tag color="green">Hoạt động</Tag> : v === 2 ? <Tag color="blue">Khác</Tag> : <Tag color="gray">Ẩn</Tag>) },
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
        <h2 style={{ margin: 0 }}>Danh mục tin tức</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditingId(null); setModalOpen(true); }}>
          Thêm
        </Button>
      </div>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />
      <Modal title={editingId ? "Sửa danh mục tin tức" : "Thêm danh mục tin tức"} open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); form.resetFields(); setEditingId(null); }}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}><Input placeholder="Hồ chứa nước" /></Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}><Input placeholder="1012-12" /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea placeholder="Hồ chứa nước nậm tha" /></Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue={1} rules={[{ required: true }]}><Select options={STATUS_OPTIONS} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

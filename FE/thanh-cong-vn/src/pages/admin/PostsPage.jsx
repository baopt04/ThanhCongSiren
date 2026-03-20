import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, message, Tag, Switch } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import apiClient from "../../api/client";
import { RichTextEditor } from "../../components/admin/RichTextEditor";
import { getAllCategoriesNew } from "../../services/CategoryNewService";
import { getAllUser } from "../../services/UserService";
import { getAllPosts, createPosts, updatePosts, deletePosts, updateStauts } from "../../services/PostsService";
export function PostsPage() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    try {
      const res = await getAllCategoriesNew();
      setCategories(res.data);
    } catch {
      setCategories([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getAllUser();
      setUsers(res.data);
    } catch (error) {
      console.log(error);
      setUsers([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllPosts();
      setData(res.data);
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi tải dữ liệu");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchUsers();
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title,
        slug: values.slug,
        thumbnaiUrl: values.thumbnaiUrl,
        excerpt: values.excerpt,
        content: values.content || "",
        categoryId: values.categoryId,
        authorId: values.authorId,
      };
      if (editingId) {
        Modal.confirm(({
          title: "Xác nhận sửa bài viết",
          content: "Bạn có chắc muốn sửa bài viết",
          okText: "Xác nhận",
          cancelText: "Hủy",
          onOk: async () => {
            try {
              await updatePosts(editingId, payload);
              message.success("Sửa thành công"
              )
              fetchData();
            } catch (err) {
              message.error(err.response?.data?.message || "Lỗi sửa bài viết tin tức");
            }
          }
        }))
      } else {
        Modal.confirm(({
          title: "Xác nhận thêm bàn viết",
          content: "Bạn có chắc muốn thêm bài viết?",
          okText: "Xác nhận",
          cancelText: "Hủy",
          onOk: async () => {
            try {
              await createPosts(payload);
              message.success("Thêm bài viết thành công")
              fetchData();
            } catch (err) {
              message.error(err.response?.data?.message || "Lỗi tạo bài viết")
            }
          }
        }))
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
      title: record.title,
      slug: record.slug,
      thumbnaiUrl: record.thumbnaiUrl,
      excerpt: record.excerpt,
      content: record.content || "",
      categoryId: record.categoryId,
      authorId: record.authorId,
    });
    setEditingId(record.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm(({
      title: "Xóa bài viết",
      content: "Bạn có chắc muốn xóa bài viết?",
      onOk: "Xác nhận",
      onCancel: "Hủy",
      onOk: async () => {
        try {
          await deletePosts(id);
          message.success("Xóa thành công bài viết");
          fetchData();
        } catch (err) {
          message.error(err.response?.data?.message || "Lỗi xóa");
        }
      }
    }))

  };
  const statusMap = {
    DRAFT: { label: "Bản nháp", color: "default" },
    PUBLISHED: { label: "Đã xuất bản", color: "green" },
    HIDDEN: { label: "Đã ẩn", color: "red" }
  };
  const columns = [
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    { title: "Danh mục", dataIndex: "categoryName", key: "categoryName" },
    { title: "Người viết", dataIndex: "authorName", key: "authorName" },

    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (value, record) => (
        <Select
          value={value}
          style={{ width: 140 }}
          options={Object.keys(statusMap).map((k) => ({
            value: k,
            label: (
              <Tag color={statusMap[k].color}>
                {statusMap[k].label}
              </Tag>
            )
          }))}
          onChange={async (newStatus) => {
            try {
              Modal.confirm(({
                title: "Cập nhật trạng thái",
                content: "Bạn có chắc muốn cập nhật trạng thái",
                onOk: "Xác nhận",
                onCancel: "Hủy",
                onOk: async () => {
                  await updateStauts(record.id, newStatus);
                  message.success("Cập nhật trạng thái thành công");
                  fetchData();
                }
              }))
            } catch {
              message.error("Lỗi cập nhật trạng thái");
            }
          }}
        />

      )
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
        <h2 style={{ margin: 0 }}>Bài viết</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditingId(null); setModalOpen(true); }}>
          Thêm
        </Button>
      </div>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} bordered />
      <Modal
        title={editingId ? "Sửa bài viết" : "Thêm bài viết"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditingId(null); }}
        width={720}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input placeholder="Bài viết thứ 2" /></Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}><Input placeholder="12-12-12" /></Form.Item>
          <Form.Item name="thumbnaiUrl" label="URL ảnh đại diện"><Input placeholder="https://..." /></Form.Item>
          <Form.Item name="excerpt" label="Trích dẫn"><Input.TextArea rows={2} placeholder="HIHI" /></Form.Item>
          <Form.Item name="content" label="Nội dung (HTML xuất ra dạng HTML)">
            <RichTextEditor />
          </Form.Item>
          <Form.Item name="categoryId" label="Danh mục tin tức" rules={[{ required: true }]}>
            <Select placeholder="Chọn danh mục" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="authorId" label="Tác giả" rules={[{ required: true }]}>
            <Select placeholder="Chọn tác giả" options={users.map((u) => ({ value: u.id, label: u.name }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

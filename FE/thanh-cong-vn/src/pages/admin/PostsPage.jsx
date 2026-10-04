import { useState, useEffect, useMemo, useRef, lazy, Suspense, forwardRef } from "react";
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
  Image,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  PictureOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import apiClient from "../../api/client";
const RichTextEditor = lazy(() =>
  import("../../components/admin/RichTextEditor").then((m) => ({ default: m.RichTextEditor }))
);

const RichTextEditorControl = forwardRef(function RichTextEditorControl(
  { value = "", onChange, ...props },
  ref
) {
  return (
    <Suspense fallback={<Spin tip="Đang tải trình soạn thảo..." />}>
      <RichTextEditor
        ref={ref}
        value={value}
        onChange={onChange}
        {...props}
      />
    </Suspense>
  );
});
import { getAllCategoriesNew } from "../../services/CategoryNewService";
import { getAllUser } from "../../services/UserService";
import {
  getAllPosts,
  createPosts,
  updatePosts,
  deletePosts,
  updateStauts,
  updateImagePosts,
  deleteImagePosts,
} from "../../services/PostsService";

function toSlug(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const statusMap = {
  PUBLISHED: { label: "Đã xuất bản", color: "green" },
  DRAFT: { label: "Bản nháp", color: "orange" },
  HIDDEN: { label: "Đã ẩn", color: "default" },
};

export function PostsPage() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Thumbnail upload state
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [deletingThumbnail, setDeletingThumbnail] = useState(false);
  const thumbnailInputRef = useRef(null);

  // Upload thumbnail to Cloudinary
  const handleUploadThumbnail = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadingThumbnail(true);
    message.loading({ content: `Đang tải ảnh "${file.name}" lên...`, key: "upload_thumb" });
    try {
      const res = await updateImagePosts(file);
      const url = res?.data?.url || res?.url;
      if (url) {
        setThumbnailUrl(url);
        form.setFieldsValue({ thumbnailUrl: url });
        message.success({ content: "Tải ảnh đại diện thành công!", key: "upload_thumb" });
      } else {
        throw new Error("Không nhận được URL ảnh");
      }
    } catch (err) {
      message.error({ content: err.response?.data?.message || "Lỗi khi tải ảnh lên", key: "upload_thumb" });
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Delete thumbnail from Cloudinary and clear form field
  const handleDeleteThumbnail = async () => {
    if (!thumbnailUrl) return;
    setDeletingThumbnail(true);
    message.loading({ content: "Đang xóa ảnh đại diện...", key: "delete_thumb" });
    try {
      await deleteImagePosts(thumbnailUrl);
      setThumbnailUrl("");
      form.setFieldsValue({ thumbnailUrl: "" });
      message.success({ content: "Đã xóa ảnh đại diện thành công!", key: "delete_thumb" });
    } catch (err) {
      console.error("Lỗi khi xóa ảnh đại diện:", err);
      message.error({
        content: err.response?.data?.message || "Lỗi khi xóa ảnh đại diện",
        key: "delete_thumb",
      });
    } finally {
      setDeletingThumbnail(false);
    }
  };

  // Upload image for RichTextEditor content (same pattern as ProductsPage)
  const handleUploadPostImage = async (file) => {
    message.loading({ content: `Đang tải ảnh "${file.name}" lên Cloudinary...`, key: "upload_post_img" });
    try {
      const res = await updateImagePosts(file);
      const url = res?.data?.url || res?.url;
      if (url) {
        message.success({ content: "Tải ảnh lên thành công!", key: "upload_post_img" });
        return res;
      }
      throw new Error("Không nhận được URL ảnh từ máy chủ");
    } catch (err) {
      message.error({ content: err.response?.data?.message || "Lỗi khi tải ảnh lên", key: "upload_post_img" });
      throw err;
    }
  };

  // Delete image from post content (Cloudinary)
  const handleDeletePostImage = async (imageUrl) => {
    if (!imageUrl) return;
    message.loading({ content: "Đang xóa ảnh bài viết...", key: "delete_post_img" });
    try {
      await deleteImagePosts(imageUrl);
      message.success({ content: "Đã xóa ảnh khỏi hệ thống thành công!", key: "delete_post_img" });
      return true;
    } catch (err) {
      console.error("Lỗi khi xóa ảnh bài viết:", err);
      message.error({
        content: err.response?.data?.message || "Lỗi khi xóa ảnh bài viết",
        key: "delete_post_img",
      });
      throw err;
    }
  };

  // Filters
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await getAllCategoriesNew();
      setCategories(res.data || []);
    } catch {
      setCategories([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getAllUser();
      setUsers(res.data || []);
    } catch (error) {
      console.log(error);
      setUsers([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllPosts();
      setData(res.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi tải dữ liệu bài viết");
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

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(kw);
        const matchSlug = item.slug?.toLowerCase().includes(kw);
        if (!matchTitle && !matchSlug) return false;
      }
      if (filterCategory !== null && item.categoryId !== filterCategory) {
        return false;
      }
      if (filterStatus !== null && item.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [data, searchKeyword, filterCategory, filterStatus]);

  // Actual API call
  const doSubmit = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title.trim(),
        slug: values.slug ? values.slug.trim() : toSlug(values.title.trim()),
        thumbnailUrl: thumbnailUrl || values.thumbnailUrl || "",
        excerpt: values.excerpt ? values.excerpt.trim() : "",
        content: values.content || "",
        categoryId: values.categoryId,
        authorId: values.authorId,
      };

      if (editingId) {
        await updatePosts(editingId, payload);
        message.success("Cập nhật bài viết thành công!");
      } else {
        await createPosts(payload);
        message.success("Thêm bài viết mới thành công!");
      }

      setModalOpen(false);
      form.resetFields();
      setEditingId(null);
      setThumbnailUrl("");
      fetchData();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || "Lỗi xử lý bài viết");
    } finally {
      setSubmitting(false);
    }
  };

  // Validate then confirm before submit
  const handleSubmit = async () => {
    try {
      await form.validateFields();
    } catch {
      message.warning("Vui lòng kiểm tra lại các trường dữ liệu còn thiếu hoặc không hợp lệ!");
      return;
    }

    Modal.confirm({
      title: editingId ? "Xác nhận cập nhật bài viết" : "Xác nhận đăng bài viết mới",
      icon: <ExclamationCircleOutlined />,
      content: editingId
        ? "Bạn có chắc muốn cập nhật bài viết này không?"
        : "Bạn có chắc muốn đăng bài viết mới không?",
      okText: editingId ? "Cập nhật" : "Đăng bài",
      cancelText: "Hủy",
      onOk: doSubmit,
    });
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      title: record.title,
      slug: record.slug,
      thumbnailUrl: record.thumbnailUrl,
      excerpt: record.excerpt,
      content: record.content || "",
      categoryId: record.categoryId,
      authorId: record.authorId,
    });
    setThumbnailUrl(record.thumbnailUrl || "");
    setEditingId(record.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletePosts(id);
      message.success("Xóa bài viết thành công!");
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi khi xóa bài viết");
    }
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    if (!editingId) {
      form.setFieldsValue({ slug: toSlug(val) });
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
      title: "Ảnh",
      dataIndex: "thumbnailUrl",
      key: "thumbnailUrl",
      width: 80,
      align: "center",
      render: (url) =>
        url ? (
          <Image
            src={url}
            width={54}
            height={38}
            style={{ objectFit: "cover", borderRadius: 6, border: "1px solid #e2e8f0" }}
          />
        ) : (
          <div
            style={{
              width: 54,
              height: 38,
              borderRadius: 6,
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              margin: "0 auto",
            }}
          >
            <PictureOutlined />
          </div>
        ),
    },
    {
      title: "Thông tin bài viết",
      key: "title",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>
            {record.title}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
            {record.categoryName && (
              <Tag color="cyan" style={{ margin: 0, fontSize: 11 }}>
                📁 {record.categoryName}
              </Tag>
            )}
            {record.slug && (
              <span style={{ color: "#94a3b8", fontSize: 12 }}>/{record.slug}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Tác giả",
      dataIndex: "authorName",
      key: "authorName",
      width: 140,
      render: (author) => (
        <span style={{ color: "#475569", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 }}>
          <UserOutlined style={{ color: "#2563eb" }} /> {author || "Quản trị viên"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (value, record) => (
        <Select
          value={value || "DRAFT"}
          style={{ width: 140 }}
          size="small"
          options={Object.keys(statusMap).map((k) => ({
            value: k,
            label: <Tag color={statusMap[k].color}>{statusMap[k].label}</Tag>,
          }))}
          onChange={async (newStatus) => {
            try {
              await updateStauts(record.id, newStatus);
              message.success("Cập nhật trạng thái bài viết thành công");
              fetchData();
            } catch {
              message.error("Lỗi cập nhật trạng thái");
            }
          }}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space size={8}>
          <Tooltip title="Chỉnh sửa bài viết">
            <button
              className="admin-btn-action admin-btn-edit"
              onClick={() => handleEdit(record)}
            >
              <EditOutlined />
            </button>
          </Tooltip>

          <Popconfirm
            title="Xác nhận xóa bài viết"
            description={`Bạn có chắc muốn xóa "${record.title}"?`}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa bài viết">
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
          <h2>Quản lý bài viết & tin tức</h2>
          <p>Đăng tải các bản tin phòng cháy chữa cháy, kiến thức cứu hộ cứu nạn và còi báo động</p>
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
            Viết bài mới
          </Button>
        </Space>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <Input
            placeholder="Tìm theo tiêu đề hoặc slug..."
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 260, borderRadius: 8 }}
            allowClear
          />

          <Select
            placeholder="Tất cả danh mục"
            value={filterCategory}
            onChange={setFilterCategory}
            style={{ width: 180 }}
            allowClear
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />

          <Select
            placeholder="Tất cả trạng thái"
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 160 }}
            allowClear
            options={[
              { value: "PUBLISHED", label: "Đã xuất bản" },
              { value: "DRAFT", label: "Bản nháp" },
              { value: "HIDDEN", label: "Đã ẩn" },
            ]}
          />

          {(searchKeyword || filterCategory !== null || filterStatus !== null) && (
            <Button
              type="dashed"
              onClick={() => {
                setSearchKeyword("");
                setFilterCategory(null);
                setFilterStatus(null);
              }}
            >
              Đặt lại
            </Button>
          )}
        </div>

        <div className="admin-toolbar-right">
          <span style={{ fontSize: 13, color: "#64748b" }}>
            Hiển thị <strong>{filteredData.length}</strong> / {data.length} bài viết
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
            showTotal: (total) => `Tổng cộng ${total} bài viết`,
          }}
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
            {editingId ? "✏️ Chỉnh sửa bài viết" : "✨ Viết bài mới"}
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setEditingId(null);
          setThumbnailUrl("");
        }}
        width={820}
        destroyOnClose
        footer={
          <Space>
            <Button
              onClick={() => {
                setModalOpen(false);
                form.resetFields();
                setEditingId(null);
                setThumbnailUrl("");
              }}
            >
              Hủy
            </Button>
            <Button type="primary" onClick={handleSubmit} loading={submitting}>
              {editingId ? "Cập nhật bài viết" : "Đăng bài viết"}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="Tiêu đề bài viết"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề" },
              { min: 5, message: "Tiêu đề tối thiểu 5 ký tự" },
              { max: 200, message: "Tiêu đề tối đa 200 ký tự" },
              {
                whitespace: true,
                message: "Tiêu đề không được chỉ chứa khoảng trắng",
              },
            ]}
          >
            <Input
              placeholder="Nhập tiêu đề hấp dẫn..."
              onChange={handleTitleChange}
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Đường dẫn thân thiện (Slug)"
            rules={[
              { required: true, message: "Vui lòng nhập slug" },
              {
                pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
                message: "Slug chỉ gồm chữ thường, số và dấu gạch ngang (vd: bai-viet-moi)",
              },
            ]}
          >
            <Input placeholder="tieu-de-bai-viet" />
          </Form.Item>

          {/* Thumbnail upload - chọn ảnh thay vì nhập URL */}
          <Form.Item name="thumbnailUrl" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="Hình ảnh đại diện bài viết">
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                padding: 16,
                border: "1px dashed #d9d9d9",
                borderRadius: 10,
                background: "#fafbfc",
              }}
            >
              {/* Preview */}
              <div
                style={{
                  width: 140,
                  height: 90,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  background: "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                {uploadingThumbnail ? (
                  <Spin size="small" tip="Đang tải..." />
                ) : thumbnailUrl ? (
                  <>
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <Popconfirm
                      title="Xác nhận xóa ảnh đại diện"
                      description="Bạn có chắc chắn muốn xóa ảnh đại diện này khỏi hệ thống không?"
                      okText="Xóa ảnh"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true, loading: deletingThumbnail }}
                      onConfirm={handleDeleteThumbnail}
                    >
                      <button
                        type="button"
                        disabled={deletingThumbnail}
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          background: "rgba(220, 38, 38, 0.85)",
                          border: "none",
                          borderRadius: "50%",
                          width: 22,
                          height: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#fff",
                          fontSize: 12,
                          padding: 0,
                          transition: "all 0.2s",
                        }}
                        title="Xóa ảnh đại diện"
                      >
                        <DeleteOutlined />
                      </button>
                    </Popconfirm>
                  </>
                ) : (
                  <div style={{ textAlign: "center", color: "#94a3b8" }}>
                    <PictureOutlined style={{ fontSize: 24 }} />
                    <div style={{ fontSize: 11, marginTop: 4 }}>Chưa có ảnh</div>
                  </div>
                )}
              </div>

              {/* Upload & Delete buttons */}
              <div style={{ flex: 1 }}>
                <Space wrap>
                  <Button
                    icon={<UploadOutlined />}
                    onClick={() => thumbnailInputRef.current?.click()}
                    loading={uploadingThumbnail}
                    style={{ borderRadius: 8 }}
                  >
                    {uploadingThumbnail ? "Đang tải ảnh lên..." : "Chọn ảnh từ máy tính"}
                  </Button>
                  {thumbnailUrl && (
                    <Popconfirm
                      title="Xác nhận xóa ảnh đại diện"
                      description="Bạn có chắc chắn muốn xóa ảnh đại diện này khỏi hệ thống không?"
                      okText="Xóa ảnh"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true, loading: deletingThumbnail }}
                      onConfirm={handleDeleteThumbnail}
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        loading={deletingThumbnail}
                        style={{ borderRadius: 8 }}
                      >
                        Xóa ảnh
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
                <input
                  type="file"
                  ref={thumbnailInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleUploadThumbnail}
                />
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                  Ảnh sẽ được tải lên Cloudinary. Hỗ trợ JPG, PNG, WEBP (tối đa 5MB)
                </div>
                {thumbnailUrl && (
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, wordBreak: "break-all" }}>
                    🔗 {thumbnailUrl}
                  </div>
                )}
              </div>
            </div>
          </Form.Item>

          <Space orientation="horizontal" style={{ width: "100%" }} size={16}>
            <Form.Item
              name="categoryId"
              label="Danh mục tin tức"
              rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              style={{ flex: 1 }}
            >
              <Select
                placeholder="Chọn danh mục"
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>

            <Form.Item
              name="authorId"
              label="Tác giả bài viết"
              rules={[{ required: true, message: "Vui lòng chọn tác giả" }]}
              style={{ flex: 1 }}
            >
              <Select
                placeholder="Chọn tác giả"
                options={users.map((u) => ({ value: u.id, label: u.name }))}
              />
            </Form.Item>
          </Space>

          <Form.Item
            name="excerpt"
            label="Đoạn trích tóm tắt ngắn (Excerpt)"
            rules={[
              { max: 500, message: "Đoạn trích tối đa 500 ký tự" },
            ]}
          >
            <Input.TextArea
              rows={2}
              placeholder="Tóm tắt ngắn gọn nội dung bài viết hiển thị ở danh sách tin tức..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item name="content" label="Nội dung chi tiết bài viết">
            <RichTextEditorControl
              onUploadImage={handleUploadPostImage}
              onDeleteImage={handleDeletePostImage}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


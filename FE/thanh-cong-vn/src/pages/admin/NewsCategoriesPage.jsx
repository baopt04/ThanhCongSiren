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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import apiClient from "../../api/client";
import {
  getAllCategoriesNew,
  createCategoryNew,
  deleteCategoryNews,
  updateCategoryNew,
} from "../../services/CategoryNewService";

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

  // Filters
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllCategoriesNew();
      setData(res.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi tải danh mục tin tức");
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
        const matchSlug = item.slug?.toLowerCase().includes(kw);
        const matchDesc = item.description?.toLowerCase().includes(kw);
        if (!matchName && !matchSlug && !matchDesc) return false;
      }
      if (filterStatus !== null && item.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [data, searchKeyword, filterStatus]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        status: values.status,
      };

      if (editingId) {
        await updateCategoryNew(editingId, payload);
        message.success("Cập nhật danh mục tin tức thành công!");
      } else {
        await createCategoryNew(payload);
        message.success("Thêm danh mục tin tức mới thành công!");
      }

      setModalOpen(false);
      form.resetFields();
      setEditingId(null);
      fetchData();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || "Lỗi xử lý danh mục tin tức");
    }
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
      description: record.description,
      status: record.status,
    });
    setEditingId(record.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategoryNews(id);
      message.success("Đã xóa danh mục tin tức");
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || "Xóa thất bại!");
    }
  };

  const handleNameChange = (e) => {
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
      title: "Tên danh mục tin",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <span style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>
          <FolderOpenOutlined style={{ color: "#0284c7", marginRight: 8 }} />
          {name}
        </span>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (slug) => (
        <span style={{ color: "#64748b", fontSize: 13 }}>/{slug}</span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (desc) => (
        <span style={{ color: "#475569", fontSize: 13 }}>{desc || "—"}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (v) => {
        if (v === 1) return <Tag color="green" style={{ padding: "2px 8px" }}>● Hoạt động</Tag>;
        if (v === 2) return <Tag color="blue" style={{ padding: "2px 8px" }}>● Khác</Tag>;
        return <Tag color="default" style={{ padding: "2px 8px" }}>● Ẩn</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space size={8}>
          <Tooltip title="Chỉnh sửa danh mục">
            <button
              className="admin-btn-action admin-btn-edit"
              onClick={() => handleEdit(record)}
            >
              <EditOutlined />
            </button>
          </Tooltip>

          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc muốn xóa danh mục "${record.name}"?`}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa danh mục">
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
          <h2>Danh mục tin tức & bài viết</h2>
          <p>Phân loại chủ đề các bài viết như Cẩm nang PCCC, Sự kiện, Hướng dẫn sử dụng</p>
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
            Thêm danh mục tin
          </Button>
        </Space>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <Input
            placeholder="Tìm theo tên hoặc slug..."
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 260, borderRadius: 8 }}
            allowClear
          />

          <Select
            placeholder="Tất cả trạng thái"
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 180 }}
            allowClear
            options={STATUS_OPTIONS}
          />

          {(searchKeyword || filterStatus !== null) && (
            <Button
              type="dashed"
              onClick={() => {
                setSearchKeyword("");
                setFilterStatus(null);
              }}
            >
              Đặt lại
            </Button>
          )}
        </div>

        <div className="admin-toolbar-right">
          <span style={{ fontSize: 13, color: "#64748b" }}>
            Hiển thị <strong>{filteredData.length}</strong> / {data.length} danh mục
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
          scroll={{ x: 700 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Tổng cộng ${total} danh mục tin tức`,
          }}
        />
      </div>

      {/* Modal Add / Edit */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
            {editingId ? "✏️ Chỉnh sửa danh mục tin tức" : "✨ Thêm danh mục tin tức mới"}
          </div>
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setEditingId(null);
        }}
        okText={editingId ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Tên danh mục tin tức"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
          >
            <Input
              placeholder="Ví dụ: Tin tức phòng cháy chữa cháy"
              onChange={handleNameChange}
            />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Đường dẫn thân thiện (Slug)"
            rules={[{ required: true, message: "Vui lòng nhập slug" }]}
          >
            <Input placeholder="tin-tuc-pccc" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            initialValue={1}
            rules={[{ required: true }]}
          >
            <Select options={STATUS_OPTIONS} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả danh mục">
            <Input.TextArea
              rows={3}
              placeholder="Mô tả các chủ đề thuộc danh mục tin này..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


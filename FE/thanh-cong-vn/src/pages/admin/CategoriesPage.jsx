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
  TreeSelect,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  RightOutlined,
  SearchOutlined,
  ReloadOutlined,
  FolderOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import apiClient from "../../api/client";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  categoryTree,
} from "../../services/CategoryService";

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
  { value: 0, label: "Ngưng hoạt động" },
];

export function CategoriesPage() {
  const [data, setData] = useState([]);
  const [parents, setParents] = useState([]);
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
      const tree = await categoryTree();
      setData(tree ?? []);
      setParents(tree ?? []);
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi tải danh mục");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const convertTree = (nodes) =>
    nodes.map((n) => ({
      title: n.name,
      value: n.id,
      key: n.id,
      children: n.children ? convertTree(n.children) : [],
    }));


  const filterTree = (nodes, kw, status) => {
    return nodes
      .map((node) => {
        const matchesKw =
          !kw ||
          node.name?.toLowerCase().includes(kw) ||
          node.slug?.toLowerCase().includes(kw);
        const matchesStatus = status === null || node.status === status;

        const filteredChildren = node.children
          ? filterTree(node.children, kw, status)
          : [];

        if (matchesKw && matchesStatus) {
          return { ...node, children: filteredChildren };
        }

        if (filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }

        return null;
      })
      .filter(Boolean);
  };

  const filteredData = useMemo(() => {
    if (!searchKeyword && filterStatus === null) return data;
    return filterTree(data, searchKeyword.toLowerCase(), filterStatus);
  }, [data, searchKeyword, filterStatus]);

  const doSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        description: values.description?.trim() || null,
        status: values.status,
        parentId: values.parentId || null,
      };

      if (editingId) {
        await updateCategory(editingId, payload);
        message.success("Cập nhật danh mục thành công!");
      } else {
        await createCategory(payload);
        message.success("Thêm danh mục mới thành công!");
      }

      setModalOpen(false);
      form.resetFields();
      setEditingId(null);
      fetchData();
    } catch (err) {
      if (err.errorFields) return;
      message.error("Lỗi lưu dữ liệu danh mục");
    }
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    Modal.confirm({
      title: editingId
        ? "Xác nhận cập nhật danh mục"
        : "Xác nhận thêm danh mục mới",
      icon: <ExclamationCircleOutlined />,
      content: editingId
        ? `Bạn có chắc muốn cập nhật danh mục không?`
        : `Bạn có chắc muốn thêm danh mục mới không?`,
      okText: editingId ? "Cập nhật" : "Tạo mới",
      cancelText: "Hủy",
      onOk: doSubmit,
    });
  };
  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      message.success("Bạn đã xóa danh mục thành công!");
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi khi xóa danh mục");
    }
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
      description: record.description,
      status: record.status,
      parentId: record.parentId || undefined,
    });
    setEditingId(record.id);
    setModalOpen(true);
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
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <span style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>
          <FolderOutlined style={{ color: "#2563eb", marginRight: 8 }} />
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
      render: (v) =>
        v === 1 ? (
          <Tag color="green" style={{ padding: "2px 8px" }}>
            ● Hoạt động
          </Tag>
        ) : (
          <Tag color="red" style={{ padding: "2px 8px" }}>
            ● Ngưng hoạt động
          </Tag>
        ),
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
            title="Xác nhận xóa danh mục"
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
          <h2>Quản lý danh mục sản phẩm</h2>
          <p>Cấu trúc cây danh mục hiển thị trên thanh menu và bộ lọc của gian hàng</p>
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
            Thêm danh mục
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
            Hiển thị <strong>{filteredData.length}</strong> danh mục gốc
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
          pagination={false}
          scroll={{ x: 800 }}
          expandable={{
            expandIcon: ({ expanded, onExpand, record }) =>
              record.children && record.children.length > 0 ? (
                <span
                  onClick={(e) => onExpand(record, e)}
                  style={{
                    marginRight: 8,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: "#f1f5f9",
                  }}
                >
                  {expanded ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
                </span>
              ) : (
                <span style={{ display: "inline-block", width: 26 }} />
              ),
          }}
        />
      </div>

      {/* Modal Add / Edit */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
            {editingId ? "✏️ Chỉnh sửa danh mục" : "✨ Thêm danh mục mới"}
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
            label="Tên danh mục"
            rules={[
              { required: true, message: "Vui lòng nhập tên danh mục" },
              { min: 2, message: "Tên danh mục phải có ít nhất 2 ký tự" },
              { max: 100, message: "Tên danh mục không được vượt quá 100 ký tự" },
              {
                validator: (_, value) =>
                  value && value.trim() !== value
                    ? Promise.reject("Tên danh mục không được có khoảng trắng đầu/cuối")
                    : Promise.resolve(),
              },
            ]}
          >
            <Input
              placeholder="Ví dụ: Còi Hú Báo Động"
              onChange={handleNameChange}
              maxLength={100}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Đường dẫn thân thiện (Slug)"
            rules={[
              { required: true, message: "Vui lòng nhập slug" },
              { min: 2, message: "Slug phải có ít nhất 2 ký tự" },
              { max: 100, message: "Slug không được vượt quá 100 ký tự" },
              {
                pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
                message: "Slug chỉ chứa chữ thường, số và dấu gạch ngang (ví dụ: coi-bao-dong)",
              },
            ]}
          >
            <Input placeholder="coi-hu-bao-dong" maxLength={100} showCount />
          </Form.Item>

          <Form.Item name="parentId" label="Danh mục cha">
            <TreeSelect
              allowClear
              treeData={convertTree(parents)}
              placeholder="Không có (Danh mục gốc cấp 1)"
              treeDefaultExpandAll
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái hoạt động"
            initialValue={1}
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select options={STATUS_OPTIONS} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả danh mục"
            rules={[
              { max: 500, message: "Mô tả không được vượt quá 500 ký tự" },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Mô tả ngắn về danh mục này..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

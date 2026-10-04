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
  FolderOpenOutlined,
  ExclamationCircleOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  categoryTree,
} from "../../services/CategoryService";
import "./CategoriesPage.css";

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

/**
 * Hàm đệ quy bổ sung metadata hiển thị cây danh mục:
 * - displayStt: Số thứ tự dạng phân cấp: 1, 1.1, 1.2, 2, 2.1...
 * - level: Cấp độ danh mục (0: gốc, 1: con...)
 * - parentName: Tên danh mục cha để hiển thị rõ ngữ cảnh
 * - isLastChild: Đánh dấu phần tử con cuối cùng để vẽ nhánh cây và đường phân cách
 */
const enrichTree = (nodes, parentStt = "", level = 0, parentName = "") => {
  if (!Array.isArray(nodes)) return [];
  const count = nodes.length;
  return nodes.map((node, index) => {
    const currentStt = parentStt ? `${parentStt}.${index + 1}` : `${index + 1}`;
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const isLastChild = index === count - 1;
    const children = hasChildren
      ? enrichTree(node.children, currentStt, level + 1, node.name)
      : undefined;

    return {
      ...node,
      displayStt: currentStt,
      level,
      parentName,
      isLastChild,
      childrenCount: hasChildren ? node.children.length : 0,
      children: children && children.length > 0 ? children : undefined,
    };
  });
};

export function CategoriesPage() {
  const [data, setData] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [form] = Form.useForm();

  // Filters
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);

  // Expanded row keys
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

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

  const convertTree = (nodes, currentEditingId) =>
    nodes.map((n) => ({
      title: n.name,
      value: n.id,
      key: n.id,
      disabled: n.id === currentEditingId,
      children: n.children ? convertTree(n.children, currentEditingId) : [],
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
    let result = data;
    if (searchKeyword || filterStatus !== null) {
      result = filterTree(data, searchKeyword.toLowerCase(), filterStatus);
    }
    return enrichTree(result);
  }, [data, searchKeyword, filterStatus]);

  // Danh sách toàn bộ id các nhóm có phần tử con
  const allParentKeys = useMemo(() => {
    const keys = [];
    const collectKeys = (nodes) => {
      nodes.forEach((n) => {
        if (n.children && n.children.length > 0) {
          keys.push(n.id);
          collectKeys(n.children);
        }
      });
    };
    collectKeys(filteredData);
    return keys;
  }, [filteredData]);

  // Thống kê tổng số lượng danh mục gốc và danh mục con
  const stats = useMemo(() => {
    const rootCount = filteredData.length;
    let childCount = 0;
    const countSub = (nodes) => {
      nodes.forEach((n) => {
        if (n.children && n.children.length > 0) {
          childCount += n.children.length;
          countSub(n.children);
        }
      });
    };
    countSub(filteredData);
    return { rootCount, childCount, total: rootCount + childCount };
  }, [filteredData]);

  // Khi tìm kiếm, tự động bung tất cả các nhóm để người dùng thấy ngay kết quả con
  useEffect(() => {
    if (searchKeyword.trim() && allParentKeys.length > 0) {
      setExpandedRowKeys(allParentKeys);
    }
  }, [searchKeyword, allParentKeys]);

  const handleAddRoot = () => {
    form.resetFields();
    form.setFieldsValue({ status: 1 });
    setEditingId(null);
    setSelectedParent(null);
    setModalOpen(true);
  };

  const handleAddSub = (parentRecord) => {
    form.resetFields();
    form.setFieldsValue({
      parentId: parentRecord.id,
      status: 1,
    });
    setEditingId(null);
    setSelectedParent(parentRecord);
    setModalOpen(true);
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
    setSelectedParent(
      record.parentId
        ? { id: record.parentId, name: record.parentName || "Danh mục cha" }
        : null
    );
    setModalOpen(true);
  };

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
      setSelectedParent(null);
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
        : selectedParent
        ? `Xác nhận thêm danh mục con vào "${selectedParent.name}"`
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
      width: 75,
      align: "center",
      render: (_, record) => {
        if (record.level === 0) {
          return <span className="cat-stt-parent">{record.displayStt}</span>;
        }
        return (
          <span className="cat-stt-child" title={`Mục con thứ ${record.displayStt}`}>
            <span className="cat-stt-arrow">↳</span>
            {record.displayStt}
          </span>
        );
      },
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (name, record) => {
        const isParent = record.level === 0;
        const isExpanded = expandedRowKeys.includes(record.id);
        const hasChildren = record.childrenCount > 0;

        if (isParent) {
          return (
            <div className="cat-name-cell">
              <span className="cat-name-parent">
                {hasChildren ? (
                  isExpanded ? (
                    <FolderOpenOutlined className="cat-icon-parent" />
                  ) : (
                    <FolderOutlined className="cat-icon-parent" />
                  )
                ) : (
                  <FolderOutlined className="cat-icon-parent" style={{ color: "#3b82f6" }} />
                )}
                <span className="cat-title-parent">{name}</span>
              </span>
              {hasChildren && (
                <Tag className="cat-badge-children">
                  {record.childrenCount} nhóm con
                </Tag>
              )}
            </div>
          );
        }

        return (
          <div className="cat-name-cell">
            <span className="cat-name-child">
              <span className="cat-branch-connector">
                {record.isLastChild ? "└──" : "├──"}
              </span>
              <FolderOutlined className="cat-icon-child" />
              <span className="cat-title-child">{name}</span>
            </span>
            {record.parentName && (
              <Tag className="cat-parent-tag">
                Thuộc: <strong>{record.parentName}</strong>
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (slug, record) => (
        <span className={record.level === 0 ? "cat-slug-parent" : "cat-slug-child"}>
          /{slug}
        </span>
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
          <Tag color="green" style={{ padding: "2px 8px", borderRadius: 4 }}>
            ● Hoạt động
          </Tag>
        ) : (
          <Tag color="red" style={{ padding: "2px 8px", borderRadius: 4 }}>
            ● Ngưng hoạt động
          </Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 130,
      align: "center",
      render: (_, record) => {
        const isParent = record.level === 0;
        return (
          <Space size={6}>
            {isParent && (
              <Tooltip title="Thêm danh mục con vào nhóm này">
                <button
                  className="admin-btn-action admin-btn-add-sub"
                  onClick={() => handleAddSub(record)}
                >
                  <PlusOutlined style={{ fontSize: 12 }} />
                </button>
              </Tooltip>
            )}

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
              description={`Bạn có chắc muốn xóa danh mục "${record.name}"?${
                record.childrenCount ? " Các danh mục con cũng có thể bị ảnh hưởng!" : ""
              }`}
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
        );
      },
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h2>Quản lý danh mục sản phẩm</h2>
          <p>Phân cấp danh mục đa tầng hiển thị trên thanh menu và bộ lọc của gian hàng</p>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Tải lại
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddRoot}
            style={{ borderRadius: 8 }}
          >
            Thêm danh mục gốc
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
            style={{ width: 170 }}
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

          {/* Expand / Collapse All */}
          <div className="cat-expand-toggle-group">
            <Button
              size="small"
              onClick={() => setExpandedRowKeys(allParentKeys)}
              disabled={allParentKeys.length === 0 || expandedRowKeys.length === allParentKeys.length}
            >
              Mở rộng tất cả
            </Button>
            <Button
              size="small"
              onClick={() => setExpandedRowKeys([])}
              disabled={expandedRowKeys.length === 0}
            >
              Thu gọn tất cả
            </Button>
          </div>
        </div>

        <div className="admin-toolbar-right">
          <div className="cat-toolbar-stats">
            <span>Gốc: <strong className="cat-stats-number">{stats.rootCount}</strong></span>
            <span>•</span>
            <span>Con: <strong className="cat-stats-sub">{stats.childCount}</strong></span>
            <span>•</span>
            <span>Tổng: <strong className="cat-stats-number">{stats.total}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="categories-table-wrapper">
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 850 }}
          rowClassName={(record) => {
            if (record.level === 0) {
              const isExpanded = expandedRowKeys.includes(record.id);
              return isExpanded
                ? "category-row-parent category-row-expanded"
                : "category-row-parent";
            }
            return `category-row-child ${record.isLastChild ? "is-last-child" : ""}`;
          }}
          expandable={{
            expandIconColumnIndex: 1,
            indentSize: 22,
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
            expandIcon: ({ expanded, onExpand, record }) => {
              if (!record.children || record.children.length === 0) {
                return <span className="cat-expand-spacer" />;
              }
              return (
                <button
                  type="button"
                  className={`cat-expand-btn ${expanded ? "is-expanded" : ""}`}
                  onClick={(e) => onExpand(record, e)}
                  title={expanded ? "Thu gọn danh mục" : "Mở rộng danh mục con"}
                >
                  {expanded ? (
                    <DownOutlined style={{ fontSize: 10 }} />
                  ) : (
                    <RightOutlined style={{ fontSize: 10 }} />
                  )}
                </button>
              );
            },
          }}
        />
      </div>

      {/* Modal Add / Edit */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
            {editingId
              ? "✏️ Chỉnh sửa danh mục"
              : selectedParent
              ? `✨ Thêm danh mục con (${selectedParent.name})`
              : "✨ Thêm danh mục gốc mới"}
          </div>
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setEditingId(null);
          setSelectedParent(null);
        }}
        okText={editingId ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        destroyOnClose
      >
        {selectedParent && !editingId && (
          <div className="cat-modal-parent-hint">
            <ApartmentOutlined style={{ fontSize: 16 }} />
            <span>
              Đang tạo danh mục con thuộc: <strong>{selectedParent.name}</strong>
            </span>
          </div>
        )}

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
              placeholder="Ví dụ: Còi Báo Động Công Suất Nhỏ"
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
            <Input placeholder="coi-bao-dong-cong-suat-nho" maxLength={100} showCount />
          </Form.Item>

          <Form.Item name="parentId" label="Danh mục cha">
            <TreeSelect
              allowClear
              treeData={convertTree(parents, editingId)}
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

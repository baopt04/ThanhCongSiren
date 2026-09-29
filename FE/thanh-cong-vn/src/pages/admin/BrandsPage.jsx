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
  TagsOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
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

  // Filters
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllBrands();
      setData(res.data ?? []);
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi tải danh mục thương hiệu");
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
        const matchDesc = item.description?.toLowerCase().includes(kw);
        if (!matchName && !matchDesc) return false;
      }
      if (filterStatus !== null && item.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [data, searchKeyword, filterStatus]);

  const doSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || null,
        status: values.status,
      };

      if (editingId) {
        await updateBrand(editingId, payload);
        message.success("Cập nhật thương hiệu thành công!");
      } else {
        await createBrand(payload);
        message.success("Thêm thương hiệu mới thành công!");
      }

      setModalOpen(false);
      form.resetFields();
      setEditingId(null);
      fetchData();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || "Lỗi lưu thương hiệu");
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
        ? "Xác nhận cập nhật thương hiệu"
        : "Xác nhận thêm thương hiệu mới",
      icon: <ExclamationCircleOutlined />,
      content: editingId
        ? "Bạn có chắc muốn cập nhật thương hiệu không?"
        : "Bạn có chắc muốn thêm thương hiệu mới không?",
      okText: editingId ? "Cập nhật" : "Tạo mới",
      cancelText: "Hủy",
      onOk: doSubmit,
    });
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      status: record.status,
    });
    setEditingId(record.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/brands/${id}`);
      message.success("Đã xóa thương hiệu");
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi khi xóa thương hiệu");
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
      title: "Tên thương hiệu",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <span style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>
          <TagsOutlined style={{ color: "#2563eb", marginRight: 8 }} />
          {name}
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
          <Tooltip title="Chỉnh sửa thương hiệu">
            <button
              className="admin-btn-action admin-btn-edit"
              onClick={() => handleEdit(record)}
            >
              <EditOutlined />
            </button>
          </Tooltip>

          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc muốn xóa thương hiệu "${record.name}"?`}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa thương hiệu">
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
          <h2>Quản lý thương hiệu</h2>
          <p>Danh sách các đối tác, thương hiệu và nhà sản xuất thiết bị</p>
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
            Thêm thương hiệu
          </Button>
        </Space>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <Input
            placeholder="Tìm theo tên hoặc mô tả..."
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
            Hiển thị <strong>{filteredData.length}</strong> / {data.length} thương hiệu
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
            showTotal: (total) => `Tổng cộng ${total} thương hiệu`,
          }}
        />
      </div>

      {/* Modal Add / Edit */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
            {editingId ? "✏️ Chỉnh sửa thương hiệu" : "✨ Thêm thương hiệu mới"}
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
            label="Tên thương hiệu"
            rules={[
              { required: true, message: "Vui lòng nhập tên thương hiệu" },
              { min: 2, message: "Tên thương hiệu phải có ít nhất 2 ký tự" },
              { max: 100, message: "Tên thương hiệu không được vượt quá 100 ký tự" },
              {
                validator: (_, value) =>
                  value && value.trim() !== value
                    ? Promise.reject("Tên thương hiệu không được có khoảng trắng đầu/cuối")
                    : Promise.resolve(),
              },
            ]}
          >
            <Input
              placeholder="Ví dụ: Lion King, Sanghai Siren, Bosch..."
              maxLength={100}
              showCount
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
            label="Mô tả thương hiệu"
            rules={[
              { max: 500, message: "Mô tả không được vượt quá 500 ký tự" },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Giới thiệu xuất xứ, tiêu chuẩn chất lượng..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


import { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  message,
  Typography,
  Tag,
  Tooltip,
  Popconfirm,
  AutoComplete,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import {
  getAllProductSpecs,
  createProductSpec,
  updateProductSpec,
  deleteSpecs,
} from "../../services/ProductSpecs";
import { getAllProducts } from "../../services/ProductService";

const { Text } = Typography;

// Suggested common spec names for quick typing
const COMMON_SPECS = [
  { value: "Cường độ âm thanh" },
  { value: "Công suất động cơ" },
  { value: "Điện áp hoạt động" },
  { value: "Tầm xa hiệu quả" },
  { value: "Tần số âm thanh" },
  { value: "Tiêu chuẩn chống nước" },
  { value: "Khối lượng" },
  { value: "Kích thước (D x R x C)" },
  { value: "Chất liệu vỏ" },
  { value: "Thời gian hoạt động liên tục" },
  { value: "Bảo hành" },
  { value: "Xuất xứ" },
];

const FILTER_STATUS_OPTIONS = [
  { value: "has_specs", label: "Đã có thông số" },
  { value: "all", label: "Tất cả sản phẩm" },
  { value: "no_specs", label: "Chưa có thông số" },
];

export function ProductSpecsPage() {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // Filters & UI state
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterMode, setFilterMode] = useState("has_specs");
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await getAllProducts();
      setProducts(res.data || []);
    } catch {
      setProducts([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllProductSpecs();
      const sortedData = [...(res || [])].sort((a, b) => {
        if (a.productId !== b.productId) return a.productId - b.productId;
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
      setData(sortedData);
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi tải dữ liệu thông số");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchData();
  }, []);

  // Auto-expand products having specs on initial load
  useEffect(() => {
    if (data.length > 0) {
      const productIdsWithSpecs = [...new Set(data.map((s) => s.productId))];
      setExpandedRowKeys(productIdsWithSpecs);
    }
  }, [data]);

  // Group raw specs by product
  const groupedProducts = useMemo(() => {
    const map = new Map();

    // Initialize map with all products
    products.forEach((p) => {
      map.set(p.id, {
        id: p.id,
        name: p.name,
        product: p,
        specs: [],
      });
    });

    // Attach specs to products
    data.forEach((spec) => {
      if (!map.has(spec.productId)) {
        map.set(spec.productId, {
          id: spec.productId,
          name: `Sản phẩm #${spec.productId}`,
          specs: [],
        });
      }
      map.get(spec.productId).specs.push(spec);
    });

    // Sort specs within each product
    map.forEach((item) => {
      item.specs.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    });

    return Array.from(map.values());
  }, [products, data]);

  // Filter grouped data
  const filteredData = useMemo(() => {
    return groupedProducts.filter((item) => {
      // 1. Filter by selected product ID
      if (selectedProductId !== null && item.id !== selectedProductId) {
        return false;
      }

      // 2. Filter by spec presence mode
      if (filterMode === "has_specs" && item.specs.length === 0) {
        return false;
      }
      if (filterMode === "no_specs" && item.specs.length > 0) {
        return false;
      }

      // 3. Search keyword
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        const matchProdName = item.name?.toLowerCase().includes(kw);
        const matchProdId = String(item.id).includes(kw);
        const matchSpecs = item.specs.some(
          (s) =>
            s.specName?.toLowerCase().includes(kw) ||
            s.specValue?.toLowerCase().includes(kw)
        );
        if (!matchProdName && !matchProdId && !matchSpecs) {
          return false;
        }
      }

      return true;
    });
  }, [groupedProducts, selectedProductId, filterMode, searchKeyword]);

  // Expand / collapse all toggle
  const allCurrentKeys = useMemo(
    () => filteredData.map((item) => item.id),
    [filteredData]
  );
  const isAllExpanded =
    allCurrentKeys.length > 0 &&
    allCurrentKeys.every((key) => expandedRowKeys.includes(key));

  const toggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedRowKeys([]);
    } else {
      setExpandedRowKeys(allCurrentKeys);
    }
  };

  // Submit logic with validation and confirmation
  const doSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        productId: values.productId,
        specName: values.specName.trim(),
        specValue: values.specValue.trim(),
        displayOrder: Number(values.displayOrder) || 0,
      };

      if (editingId) {
        await updateProductSpec(editingId, payload);
        message.success("Cập nhật thông số thành công!");
      } else {
        await createProductSpec(payload);
        message.success("Thêm thông số mới thành công!");
      }

      setModalOpen(false);
      form.resetFields();
      setEditingId(null);
      fetchData();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || "Lỗi xử lý thông số");
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
        ? "Xác nhận cập nhật thông số kỹ thuật"
        : "Xác nhận thêm thông số mới",
      icon: <ExclamationCircleOutlined />,
      content: editingId
        ? "Bạn có chắc muốn cập nhật thông số kỹ thuật này không?"
        : "Bạn có chắc muốn thêm thông số kỹ thuật mới không?",
      okText: editingId ? "Cập nhật" : "Tạo mới",
      cancelText: "Hủy",
      onOk: doSubmit,
    });
  };

  const handleAddNew = () => {
    form.resetFields();
    if (selectedProductId) {
      form.setFieldsValue({ productId: selectedProductId });
    }
    setEditingId(null);
    setModalOpen(true);
  };

  const handleAddSpecForProduct = (productId) => {
    form.resetFields();
    form.setFieldsValue({ productId, displayOrder: 0 });
    setEditingId(null);
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      productId: record.productId,
      specName: record.specName,
      specValue: record.specValue,
      displayOrder: record.displayOrder || 0,
    });
    setEditingId(record.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteSpecs(id);
      message.success("Đã xóa thông số");
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi khi xóa");
    }
  };

  // Sub-table rendering specifications for a single product
  const renderSpecsTable = (record) => {
    return (
      <div
        style={{
          margin: "4px 0 12px 28px",
          padding: "16px",
          background: "#f8fafc",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Text strong style={{ color: "#334155", fontSize: 13 }}>
            📋 Danh sách thông số ({record.specs.length})
          </Text>
          <Button
            type="dashed"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddSpecForProduct(record.id)}
            style={{ fontSize: 12 }}
          >
            Thêm thông số
          </Button>
        </div>

        {record.specs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "18px 0",
              color: "#94a3b8",
              background: "#ffffff",
              borderRadius: 6,
              border: "1px dashed #cbd5e1",
            }}
          >
            <div>Sản phẩm này chưa có thông số kỹ thuật nào.</div>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleAddSpecForProduct(record.id)}
              style={{ marginTop: 8 }}
            >
              Thêm thông số ngay
            </Button>
          </div>
        ) : (
          <Table
            dataSource={record.specs}
            rowKey="id"
            pagination={false}
            size="small"
            bordered
            columns={[
              {
                title: "STT",
                key: "stt",
                width: 50,
                align: "center",
                render: (_, __, index) => (
                  <span style={{ color: "#64748b", fontSize: 12 }}>
                    {index + 1}
                  </span>
                ),
              },
              {
                title: "Tên thông số",
                dataIndex: "specName",
                key: "specName",
                width: 220,
                render: (val) => (
                  <Tag color="blue" style={{ fontSize: 13, padding: "2px 8px" }}>
                    {val}
                  </Tag>
                ),
              },
              {
                title: "Giá trị kỹ thuật",
                dataIndex: "specValue",
                key: "specValue",
                render: (val) => (
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#0f172a",
                      fontSize: 13.5,
                    }}
                  >
                    {val}
                  </span>
                ),
              },
              {
                title: "Thứ tự",
                dataIndex: "displayOrder",
                key: "displayOrder",
                width: 80,
                align: "center",
                render: (order) => (
                  <span
                    style={{
                      background: "#f1f5f9",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {order || 0}
                  </span>
                ),
              },
              {
                title: "Thao tác",
                key: "actions",
                width: 100,
                align: "center",
                render: (_, spec) => (
                  <Space size={8}>
                    <Tooltip title="Chỉnh sửa thông số">
                      <button
                        className="admin-btn-action admin-btn-edit"
                        onClick={() => handleEdit(spec)}
                      >
                        <EditOutlined />
                      </button>
                    </Tooltip>

                    <Popconfirm
                      title="Xác nhận xóa"
                      description={`Bạn có chắc muốn xóa thông số "${spec.specName}"?`}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => handleDelete(spec.id)}
                    >
                      <Tooltip title="Xóa thông số">
                        <button className="admin-btn-action admin-btn-delete">
                          <DeleteOutlined />
                        </button>
                      </Tooltip>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        )}
      </div>
    );
  };

  // Parent table columns (Products)
  const productColumns = [
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
      title: "Sản phẩm",
      key: "name",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
              fontSize: 18,
            }}
          >
            <AppstoreOutlined />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>
              {record.name}
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Mã ID: <strong>#{record.id}</strong>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Số thông số",
      key: "specsCount",
      width: 160,
      align: "center",
      render: (_, record) => {
        const count = record.specs.length;
        return (
          <Tag
            color={count > 0 ? "blue" : "default"}
            style={{ padding: "3px 10px", fontSize: 12, borderRadius: 12 }}
          >
            ● {count} thông số
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 170,
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          size="small"
          icon={<PlusOutlined />}
          onClick={() => handleAddSpecForProduct(record.id)}
          style={{ borderRadius: 6 }}
        >
          Thêm thông số
        </Button>
      ),
    },
  ];

  const totalSpecsCount = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.specs.length, 0);
  }, [filteredData]);

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h2>Thông số kỹ thuật sản phẩm</h2>
          <p>
            Quản lý và nhóm các thông số kỹ thuật theo từng sản phẩm hiển thị trên trang chi tiết
          </p>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Tải lại
          </Button>
          <Button onClick={toggleExpandAll} style={{ borderRadius: 8 }}>
            {isAllExpanded ? "Thu gọn tất cả" : "Mở rộng tất cả"}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddNew}
            style={{ borderRadius: 8 }}
          >
            Thêm thông số mới
          </Button>
        </Space>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <Select
            placeholder="🔍 Lọc theo sản phẩm..."
            value={selectedProductId}
            onChange={setSelectedProductId}
            style={{ width: 280 }}
            showSearch
            optionFilterProp="label"
            allowClear
            options={products.map((p) => ({
              value: p.id,
              label: p.name,
            }))}
          />

          <Select
            value={filterMode}
            onChange={setFilterMode}
            style={{ width: 170 }}
            options={FILTER_STATUS_OPTIONS}
          />

          <Input
            placeholder="Tìm tên sản phẩm, thông số hoặc giá trị..."
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 280, borderRadius: 8 }}
            allowClear
          />

          {(selectedProductId !== null || searchKeyword || filterMode !== "has_specs") && (
            <Button
              type="dashed"
              onClick={() => {
                setSelectedProductId(null);
                setSearchKeyword("");
                setFilterMode("has_specs");
              }}
            >
              Đặt lại
            </Button>
          )}
        </div>

        <div className="admin-toolbar-right">
          <span style={{ fontSize: 13, color: "#64748b" }}>
            Hiển thị <strong>{filteredData.length}</strong> sản phẩm (
            <strong>{totalSpecsCount}</strong> thông số)
          </span>
        </div>
      </div>

      {/* Grouped Table */}
      <div className="admin-table">
        <Table
          dataSource={filteredData}
          columns={productColumns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 800 }}
          expandable={{
            expandedRowRender: (record) => renderSpecsTable(record),
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Tổng cộng ${total} sản phẩm`,
          }}
        />
      </div>

      {/* Modal Add / Edit */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
            {editingId ? "✏️ Cập nhật thông số kỹ thuật" : "✨ Thêm thông số mới"}
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
            name="productId"
            label="Sản phẩm áp dụng"
            rules={[{ required: true, message: "Vui lòng chọn sản phẩm áp dụng" }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Chọn sản phẩm áp dụng"
              options={products.map((p) => ({
                value: p.id,
                label: p.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="specName"
            label="Tên thông số"
            tooltip="Có thể chọn từ gợi ý hoặc nhập tự do"
            rules={[
              { required: true, message: "Vui lòng nhập tên thông số" },
              { min: 2, message: "Tên thông số phải có ít nhất 2 ký tự" },
              { max: 100, message: "Tên thông số không được vượt quá 100 ký tự" },
              {
                validator: (_, value) =>
                  value && value.trim() !== value
                    ? Promise.reject("Tên thông số không được có khoảng trắng đầu/cuối")
                    : Promise.resolve(),
              },
            ]}
          >
            <AutoComplete
              options={COMMON_SPECS}
              placeholder="Ví dụ: Cường độ âm thanh, Công suất..."
              filterOption={(inputValue, option) =>
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
            />
          </Form.Item>

          <Form.Item
            name="specValue"
            label="Giá trị kỹ thuật"
            rules={[
              { required: true, message: "Vui lòng nhập giá trị kỹ thuật" },
              { min: 1, message: "Giá trị kỹ thuật phải có ít nhất 1 ký tự" },
              { max: 200, message: "Giá trị kỹ thuật không được vượt quá 200 ký tự" },
              {
                validator: (_, value) =>
                  value && value.trim() !== value
                    ? Promise.reject("Giá trị kỹ thuật không được có khoảng trắng đầu/cuối")
                    : Promise.resolve(),
              },
            ]}
          >
            <Input
              placeholder="Ví dụ: 123dB, 2.2kW, 220V AC, IP65..."
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="displayOrder"
            label="Thứ tự hiển thị"
            initialValue={0}
            tooltip="Số nhỏ hơn sẽ hiển thị trước (0, 1, 2...)"
            rules={[
              {
                type: "number",
                min: 0,
                max: 9999,
                message: "Thứ tự phải là số từ 0 đến 9999",
              },
            ]}
          >
            <InputNumber min={0} max={9999} style={{ width: 140 }} placeholder="0" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
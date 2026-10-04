import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Space,
  message,
  Tag,
  Tooltip,
  Popconfirm,
  Row,
  Col,
  Input,
  Drawer,
  Descriptions,
  Badge,
  Card,
  Spin,
  Empty,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  FolderOutlined,
  TagsOutlined,
  ApartmentOutlined,
  ShoppingOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { getAllProducts, getProductImages } from "../../services/ProductService";
import { getAllCategories } from "../../services/CategoryService";
import {
  getProductCategories,
  addProductCategories,
  updateProductCategories,
  deleteProductCategories,
} from "../../services/ProductCategoryService";
import "./ProductCategoriesPage.css";

const { Text } = Typography;

export function ProductCategoriesPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productCategoriesMap, setProductCategoriesMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form] = Form.useForm();

  // Drawer detail state
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailCategories, setDetailCategories] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination state for table
  const [tablePagination, setTablePagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Thumbnail cache
  const [thumbnailMap, setThumbnailMap] = useState({});

  // ─── Fetch Categories for a single product ───
  const fetchCategoriesForProduct = useCallback(async (productId) => {
    try {
      const res = await getProductCategories(productId);
      const list = Array.isArray(res) ? res : res?.data || [];
      setProductCategoriesMap((prev) => ({
        ...prev,
        [productId]: list,
      }));
      return list;
    } catch {
      setProductCategoriesMap((prev) => ({
        ...prev,
        [productId]: prev[productId] || [],
      }));
      return [];
    }
  }, []);

  // ─── Fetch Base Products & Categories ───
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        getAllProducts({ page: 0, size: 1000 }),
        getAllCategories({ size: 1000 }),
      ]);

      const prodList = Array.isArray(resProd) ? resProd : resProd?.data || [];
      const catList = Array.isArray(resCat) ? resCat : resCat?.data || [];

      setProducts(prodList);
      setCategories(catList);

      // Pre-load product categories for products in batches of 15
      const initialMap = {};
      const batchSize = 15;
      const initialBatch = prodList.slice(0, batchSize);

      await Promise.all(
        initialBatch.map(async (p) => {
          try {
            const res = await getProductCategories(p.id);
            initialMap[p.id] = Array.isArray(res) ? res : res?.data || [];
          } catch {
            initialMap[p.id] = [];
          }
        })
      );
      setProductCategoriesMap((prev) => ({ ...prev, ...initialMap }));

      // Fetch remaining products' categories asynchronously in background
      if (prodList.length > batchSize) {
        const remaining = prodList.slice(batchSize);
        setTimeout(async () => {
          const restMap = {};
          await Promise.all(
            remaining.map(async (p) => {
              try {
                const res = await getProductCategories(p.id);
                restMap[p.id] = Array.isArray(res) ? res : res?.data || [];
              } catch {
                restMap[p.id] = [];
              }
            })
          );
          setProductCategoriesMap((prev) => ({ ...prev, ...restMap }));
        }, 100);
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi tải dữ liệu sản phẩm và danh mục");
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── Map Category ID to Category Object ───
  const categoryLookup = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // ─── Filtered Data ───
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Keyword filter
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(kw);
        const matchSku = item.sku?.toLowerCase().includes(kw);
        if (!matchName && !matchSku) return false;
      }

      const assigned = productCategoriesMap[item.id] || [];
      const hasCategories = assigned.length > 0;

      // Filter by category assignment
      if (filterCategory) {
        const isInAssigned = assigned.some((c) => c.id === filterCategory);
        const isPrimary = item.categoryId === filterCategory;
        if (!isInAssigned && !isPrimary) return false;
      }

      // Filter by status (multi, single, none)
      if (filterStatus === "multi") {
        if (assigned.length < 2) return false;
      } else if (filterStatus === "single") {
        if (assigned.length !== 1) return false;
      } else if (filterStatus === "none") {
        if (hasCategories) return false;
      }

      return true;
    });
  }, [products, searchKeyword, filterCategory, filterStatus, productCategoriesMap]);

  // ─── Statistics Counters ───
  const stats = useMemo(() => {
    const totalProd = products.length;
    let multiCount = 0;
    let singleCount = 0;
    let noneCount = 0;

    products.forEach((p) => {
      const assigned = productCategoriesMap[p.id] || [];
      if (assigned.length >= 2) multiCount++;
      else if (assigned.length === 1) singleCount++;
      else noneCount++;
    });

    return {
      total: totalProd,
      multi: multiCount,
      single: singleCount,
      none: noneCount,
      totalCats: categories.length,
    };
  }, [products, productCategoriesMap, categories]);

  // ─── Open Modal for Product ───
  const handleOpenEditModal = async (product) => {
    setSelectedProduct(product);
    form.resetFields();
    setModalOpen(true);

    // Fetch fresh assigned categories for this product
    setSubmitting(true);
    try {
      const assigned = await fetchCategoriesForProduct(product.id);
      const assignedIds = assigned.map((c) => c.id);
      form.setFieldsValue({
        productId: product.id,
        categoryIds: assignedIds,
      });
    } catch {
      form.setFieldsValue({
        productId: product.id,
        categoryIds: [],
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Open Modal for New Product (Global Add) ───
  const handleOpenAddModal = () => {
    setSelectedProduct(null);
    form.resetFields();
    setModalOpen(true);
  };

  // ─── When user selects a different product in Modal ───
  const handleModalProductChange = async (prodId) => {
    const prod = products.find((p) => p.id === prodId);
    setSelectedProduct(prod || null);
    if (!prodId) {
      form.setFieldsValue({ categoryIds: [] });
      return;
    }
    try {
      const assigned = await fetchCategoriesForProduct(prodId);
      form.setFieldsValue({ categoryIds: assigned.map((c) => c.id) });
    } catch {
      form.setFieldsValue({ categoryIds: [] });
    }
  };

  // ─── Save Multiple Categories for Product ───
  const handleSaveModal = async () => {
    try {
      const values = await form.validateFields();
      const prodId = values.productId;
      const catIds = values.categoryIds || [];

      setSubmitting(true);

      // Backend API: updateProductCategories(prodId, { categoryIds: catIds })
      await updateProductCategories(prodId, { categoryIds: catIds });

      // Update local state map immediately
      const newAssignedList = catIds
        .map((id) => {
          const found = categoryLookup.get(id);
          return found ? { id: found.id, name: found.name } : { id, name: "Danh mục" };
        })
        .filter(Boolean);

      setProductCategoriesMap((prev) => ({
        ...prev,
        [prodId]: newAssignedList,
      }));

      message.success("Cập nhật danh mục cho sản phẩm thành công!");
      setModalOpen(false);
      form.resetFields();
      setSelectedProduct(null);
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || "Lỗi lưu danh mục cho sản phẩm");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Quick Delete a single Category from Product ───
  const handleDeleteCategory = async (productId, categoryId) => {
    try {
      await deleteProductCategories(productId, categoryId);
      message.success("Đã xóa danh mục khỏi sản phẩm");

      // Update local state immediately
      setProductCategoriesMap((prev) => ({
        ...prev,
        [productId]: (prev[productId] || []).filter((c) => c.id !== categoryId),
      }));

      // If drawer is open, update drawer too
      if (detailProduct?.id === productId) {
        setDetailCategories((prev) => prev.filter((c) => c.id !== categoryId));
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi khi xóa danh mục khỏi sản phẩm");
    }
  };

  // ─── View Product Details Drawer ───
  const handleViewDetail = async (product) => {
    setDetailProduct(product);
    setDetailDrawerOpen(true);
    setDetailLoading(true);
    try {
      const assigned = await fetchCategoriesForProduct(product.id);
      setDetailCategories(assigned || []);
    } catch {
      setDetailCategories([]);
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── Reset Filters ───
  const handleResetFilters = () => {
    setSearchKeyword("");
    setFilterCategory(null);
    setFilterStatus("all");
    setTablePagination((prev) => ({ ...prev, current: 1 }));
  };

  // ─── Table Columns ───
  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 55,
      align: "center",
      render: (_, __, index) => (
        <span style={{ color: "#64748b", fontWeight: 500 }}>
          {(tablePagination.current - 1) * tablePagination.pageSize + index + 1}
        </span>
      ),
    },
    {
      title: "Sản phẩm",
      key: "product",
      width: 280,
      render: (_, record) => {
        return (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563eb",
                fontSize: 18,
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              <ShoppingOutlined />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: "#0f172a",
                  lineHeight: 1.35,
                  marginBottom: 3,
                }}
              >
                {record.name}
              </div>
              <Space size={4}>
                {record.sku && (
                  <Tag color="cyan" style={{ fontSize: 11, padding: "0 5px", margin: 0 }}>
                    SKU: {record.sku}
                  </Tag>
                )}
                {record.price > 0 && (
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    {Number(record.price).toLocaleString("vi-VN")} đ
                  </span>
                )}
              </Space>
            </div>
          </div>
        );
      },
    },
    {
      title: "Danh mục chính",
      key: "primaryCategory",
      width: 170,
      render: (_, record) => {
        const primaryCat = categoryLookup.get(record.categoryId);
        if (!primaryCat) {
          return <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: 12 }}>Chưa đặt</span>;
        }
        return (
          <Tag color="geekblue" style={{ margin: 0, fontWeight: 500, borderRadius: 6 }}>
            <FolderOutlined style={{ marginRight: 4 }} />
            {primaryCat.name}
          </Tag>
        );
      },
    },
    {
      title: "Danh mục áp dụng (Đa danh mục)",
      key: "assignedCategories",
      render: (_, record) => {
        const assigned = productCategoriesMap[record.id] || [];

        if (assigned.length === 0) {
          return (
            <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: 12 }}>
              Chưa gán danh mục phụ
            </span>
          );
        }

        const maxVisible = 3;
        const visibleTags = assigned.slice(0, maxVisible);
        const hiddenCount = assigned.length - maxVisible;

        return (
          <div className="prod-cat-tags-container">
            {visibleTags.map((cat) => (
              <Popconfirm
                key={cat.id}
                title="Hủy liên kết danh mục"
                description={`Bạn có chắc muốn bỏ gán danh mục "${cat.name}" khỏi sản phẩm này?`}
                onConfirm={() => handleDeleteCategory(record.id, cat.id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true, size: "small" }}
              >
                <Tag
                  color="blue"
                  closable
                  onClose={(e) => {
                    e.preventDefault();
                  }}
                  className="prod-cat-item-tag"
                >
                  {cat.name}
                </Tag>
              </Popconfirm>
            ))}

            {hiddenCount > 0 && (
              <Tooltip
                title={
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      Các danh mục còn lại:
                    </div>
                    {assigned.slice(maxVisible).map((c) => (
                      <div key={c.id}>• {c.name}</div>
                    ))}
                  </div>
                }
              >
                <Tag color="default" style={{ cursor: "pointer", borderRadius: 6 }}>
                  +{hiddenCount} danh mục khác
                </Tag>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Số lượng",
      key: "count",
      width: 110,
      align: "center",
      render: (_, record) => {
        const assigned = productCategoriesMap[record.id] || [];
        const count = assigned.length;
        let color = "default";
        if (count >= 2) color = "green";
        else if (count === 1) color = "blue";

        return (
          <Tag color={color} style={{ fontWeight: 600, borderRadius: 12, padding: "1px 8px" }}>
            {count} danh mục
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="Xem chi tiết các danh mục">
            <button
              className="admin-btn-action admin-btn-view"
              onClick={() => handleViewDetail(record)}
            >
              <EyeOutlined />
            </button>
          </Tooltip>

          <Tooltip title="Gán / Chỉnh sửa danh mục">
            <button
              className="admin-btn-action admin-btn-edit"
              onClick={() => handleOpenEditModal(record)}
            >
              <EditOutlined />
            </button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h2>Quản lý đa danh mục sản phẩm</h2>
          <p>
            Cấu hình 1 sản phẩm thuộc nhiều danh mục phân loại để khách hàng dễ dàng tìm thấy trên website
          </p>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Tải lại
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenAddModal}
            style={{ borderRadius: 8 }}
          >
            Gán danh mục cho sản phẩm
          </Button>
        </Space>
      </div>

      {/* ── KPI Overview Cards ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6} md={6}>
          <div className="prod-cat-kpi-card">
            <div
              className="prod-cat-kpi-icon"
              style={{ background: "#eff6ff", color: "#2563eb" }}
            >
              <ShoppingOutlined />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                Tổng sản phẩm
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
                {stats.total}
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <div className="prod-cat-kpi-card">
            <div
              className="prod-cat-kpi-icon"
              style={{ background: "#ecfdf5", color: "#059669" }}
            >
              <ApartmentOutlined />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                Có ≥ 2 danh mục
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#059669" }}>
                {stats.multi}
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <div className="prod-cat-kpi-card">
            <div
              className="prod-cat-kpi-icon"
              style={{ background: "#fefce8", color: "#d97706" }}
            >
              <TagsOutlined />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                Có 1 danh mục
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#d97706" }}>
                {stats.single}
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <div className="prod-cat-kpi-card">
            <div
              className="prod-cat-kpi-icon"
              style={{ background: "#f8fafc", color: "#64748b" }}
            >
              <FolderOutlined />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                Tổng số danh mục
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
                {stats.totalCats}
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* ── Toolbar: Search & Filters ── */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <Input
            placeholder="Tìm theo tên sản phẩm hoặc SKU..."
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setTablePagination((prev) => ({ ...prev, current: 1 }));
            }}
            style={{ width: 280, borderRadius: 8 }}
            allowClear
          />

          <Select
            placeholder="🔍 Lọc theo danh mục..."
            value={filterCategory}
            onChange={(val) => {
              setFilterCategory(val);
              setTablePagination((prev) => ({ ...prev, current: 1 }));
            }}
            style={{ width: 230 }}
            showSearch
            optionFilterProp="label"
            allowClear
            options={categories.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
          />

          <Select
            value={filterStatus}
            onChange={(val) => {
              setFilterStatus(val);
              setTablePagination((prev) => ({ ...prev, current: 1 }));
            }}
            style={{ width: 190 }}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "multi", label: "🟢 Có nhiều danh mục (≥2)" },
              { value: "single", label: "🔵 Có 1 danh mục" },
              { value: "none", label: "⚪ Chưa gán danh mục phụ" },
            ]}
          />

          {(searchKeyword || filterCategory || filterStatus !== "all") && (
            <Button type="dashed" onClick={handleResetFilters}>
              Đặt lại
            </Button>
          )}
        </div>

        <div className="admin-toolbar-right">
          <span style={{ fontSize: 13, color: "#64748b" }}>
            Hiển thị <strong>{filteredProducts.length}</strong> / {products.length} sản phẩm
          </span>
        </div>
      </div>

      {/* ── Main Table ── */}
      <div className="admin-table">
        <Table
          dataSource={filteredProducts}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 980 }}
          pagination={{
            current: tablePagination.current,
            pageSize: tablePagination.pageSize,
            total: filteredProducts.length,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trong tổng số ${total} sản phẩm`,
            onChange: (p, s) => {
              setTablePagination({ current: p, pageSize: s });
            },
          }}
          expandable={{
            expandedRowRender: (record) => {
              const assigned = productCategoriesMap[record.id] || [];
              const primaryCat = categoryLookup.get(record.categoryId);

              return (
                <div className="prod-cat-expanded-box">
                  <div className="prod-cat-expanded-header">
                    <span>
                      Danh sách các danh mục gán cho sản phẩm:{" "}
                      <strong>{record.name}</strong>
                    </span>
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleOpenEditModal(record)}
                    >
                      Chỉnh sửa danh mục
                    </Button>
                  </div>

                  {primaryCat && (
                    <div style={{ marginBottom: 12 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Danh mục chính:
                      </Text>{" "}
                      <Tag color="geekblue">{primaryCat.name}</Tag>
                    </div>
                  )}

                  {assigned.length > 0 ? (
                    <Table
                      size="small"
                      pagination={false}
                      rowKey="id"
                      dataSource={assigned}
                      columns={[
                        {
                          title: "#",
                          width: 40,
                          align: "center",
                          render: (_, __, idx) => idx + 1,
                        },
                        {
                          title: "Tên danh mục",
                          dataIndex: "name",
                          key: "name",
                          render: (name) => (
                            <Space>
                              <FolderOutlined style={{ color: "#2563eb" }} />
                              <strong style={{ color: "#1e293b" }}>{name}</strong>
                            </Space>
                          ),
                        },
                        {
                          title: "Mã định danh (ID)",
                          dataIndex: "id",
                          key: "id",
                          render: (id) => (
                            <Text copyable code style={{ fontSize: 12 }}>
                              {id}
                            </Text>
                          ),
                        },
                        {
                          title: "Hành động",
                          key: "action",
                          width: 100,
                          align: "center",
                          render: (_, cat) => (
                            <Popconfirm
                              title="Xóa danh mục khỏi sản phẩm"
                              description={`Bạn có chắc muốn bỏ gán danh mục "${cat.name}"?`}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true, size: "small" }}
                              onConfirm={() => handleDeleteCategory(record.id, cat.id)}
                            >
                              <Button
                                danger
                                type="text"
                                size="small"
                                icon={<DeleteOutlined />}
                              >
                                Gỡ bỏ
                              </Button>
                            </Popconfirm>
                          ),
                        },
                      ]}
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Sản phẩm này chưa được gán thêm danh mục phụ nào"
                    />
                  )}
                </div>
              );
            },
          }}
        />
      </div>

      {/* ── Modal: Gán / Cập nhật nhiều danh mục cho sản phẩm ── */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              <TagsOutlined />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                {selectedProduct
                  ? `Gán danh mục: ${selectedProduct.name}`
                  : "Gán danh mục cho sản phẩm"}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 400 }}>
                Chọn các danh mục mà sản phẩm này sẽ được hiển thị
              </div>
            </div>
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setSelectedProduct(null);
        }}
        onOk={handleSaveModal}
        confirmLoading={submitting}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={680}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          {/* Product Select */}
          <Form.Item
            name="productId"
            label="Sản phẩm cần gán danh mục"
            rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
          >
            <Select
              showSearch
              placeholder="🔍 Tìm kiếm và chọn sản phẩm..."
              optionFilterProp="label"
              onChange={handleModalProductChange}
              disabled={Boolean(selectedProduct && form.getFieldValue("productId"))}
              options={products.map((p) => ({
                value: p.id,
                label: p.sku ? `${p.name} (SKU: ${p.sku})` : p.name,
              }))}
            />
          </Form.Item>

          {/* Product Info Card (if selected) */}
          {selectedProduct && (
            <div className="prod-cat-modal-summary">
              <div className="prod-cat-modal-summary-title">
                {selectedProduct.name}
              </div>
              <div className="prod-cat-modal-summary-sku">
                {selectedProduct.sku ? `Mã SKU: ${selectedProduct.sku}` : "Chưa có mã SKU"}
                {selectedProduct.categoryId && (
                  <span style={{ marginLeft: 12 }}>
                    Danh mục gốc:{" "}
                    <strong>
                      {categoryLookup.get(selectedProduct.categoryId)?.name || "Chưa xác định"}
                    </strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Categories Multi-Select */}
          <Form.Item
            name="categoryIds"
            label={
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <span>Chọn các danh mục áp dụng</span>
              </div>
            }
            tooltip="Một sản phẩm có thể thuộc một hoặc nhiều danh mục khác nhau để tăng khả năng tiếp cận khách hàng"
            rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 danh mục" }]}
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="Chọn các danh mục sản phẩm..."
              optionFilterProp="label"
              style={{ width: "100%" }}
              options={categories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          {/* Quick select buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: -8 }}>
            <Button
              type="link"
              size="small"
              onClick={() => {
                form.setFieldsValue({
                  categoryIds: categories.map((c) => c.id),
                });
              }}
            >
              Chọn tất cả
            </Button>
            <Button
              type="link"
              size="small"
              danger
              onClick={() => {
                form.setFieldsValue({ categoryIds: [] });
              }}
            >
              Bỏ chọn tất cả
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ── Drawer: Chi tiết sản phẩm & các danh mục ── */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              <InfoCircleOutlined />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                Chi tiết danh mục sản phẩm
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {detailProduct?.name}
              </div>
            </div>
          </div>
        }
        open={detailDrawerOpen}
        onClose={() => {
          setDetailDrawerOpen(false);
          setDetailProduct(null);
          setDetailCategories([]);
        }}
        width={560}
      >
        {detailProduct && (
          <div>
            <Descriptions bordered size="small" column={1} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Tên sản phẩm">
                <strong>{detailProduct.name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Mã SKU">
                <Text code>{detailProduct.sku || "N/A"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục chính">
                {categoryLookup.get(detailProduct.categoryId)?.name ? (
                  <Tag color="geekblue">
                    {categoryLookup.get(detailProduct.categoryId)?.name}
                  </Tag>
                ) : (
                  <span style={{ color: "#94a3b8" }}>Chưa đặt</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Giá bán">
                {Number(detailProduct.price || 0).toLocaleString("vi-VN")} đ
              </Descriptions.Item>
            </Descriptions>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                Danh sách danh mục áp dụng ({detailCategories.length})
              </h4>
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setDetailDrawerOpen(false);
                  handleOpenEditModal(detailProduct);
                }}
              >
                Cập nhật
              </Button>
            </div>

            {detailLoading ? (
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <Spin tip="Đang tải danh mục..." />
              </div>
            ) : detailCategories.length > 0 ? (
              <Table
                size="small"
                pagination={false}
                rowKey="id"
                dataSource={detailCategories}
                columns={[
                  {
                    title: "#",
                    width: 45,
                    align: "center",
                    render: (_, __, idx) => idx + 1,
                  },
                  {
                    title: "Tên danh mục",
                    dataIndex: "name",
                    key: "name",
                    render: (name) => (
                      <Space>
                        <FolderOutlined style={{ color: "#2563eb" }} />
                        <strong>{name}</strong>
                      </Space>
                    ),
                  },
                  {
                    title: "Thao tác",
                    key: "action",
                    width: 90,
                    align: "center",
                    render: (_, cat) => (
                      <Popconfirm
                        title="Xóa danh mục"
                        description={`Gỡ danh mục "${cat.name}" khỏi sản phẩm?`}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true, size: "small" }}
                        onConfirm={() => handleDeleteCategory(detailProduct.id, cat.id)}
                      >
                        <Button danger type="text" size="small" icon={<DeleteOutlined />}>
                          Xóa
                        </Button>
                      </Popconfirm>
                    ),
                  },
                ]}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có danh mục phụ nào được gán cho sản phẩm này"
              />
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}

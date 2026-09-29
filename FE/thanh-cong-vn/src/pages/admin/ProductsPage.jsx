import { lazy, Suspense, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Space,
  message,
  Tag,
  Upload,
  Image,
  Tabs,
  Tooltip,
  Popconfirm,
  Row,
  Col,
  Drawer,
  Descriptions,
  Divider,
  Card,
  Spin,
  Empty,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  StarFilled,
  StarOutlined,
  PictureOutlined,
  ExclamationCircleOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  EyeOutlined,
  UnorderedListOutlined,
  DollarOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import apiClient from "../../api/client";
import { getAllCategories } from "../../services/CategoryService";
import { getAllBrands } from "../../services/BrandsService";
import {
  getAllProducts,
  updateProductStatus,
  createProduct,
  updateProduct,
  uploadProductImages,
  getProductImages,
  deleteProductImage,
  updateProductFeatured,
  updateImageDescription,
  deleteImageDescription,
} from "../../services/ProductService";
import { SpecsForProduct } from "../../services/ProductSpecs";
const RichTextEditor = lazy(() =>
  import("../../components/admin/RichTextEditor").then((m) => ({ default: m.RichTextEditor }))
);
import { embedYoutubeInHtml } from "../../utils/youtubeUtils";

// Helper to convert Vietnamese string to clean slug
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

export function ProductsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [form] = Form.useForm();
  const [images, setImages] = useState([]);

  // Detail Drawer state
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailSpecs, setDetailSpecs] = useState([]);
  const [detailImages, setDetailImages] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Description image upload state
  const [uploadingDescImage, setUploadingDescImage] = useState(false);

  // Upload image to Cloudinary and insert at cursor inside RichTextEditor
  const handleUploadDescImage = async (file) => {
    message.loading({
      content: `Đang tải ảnh "${file.name}" lên Cloudinary...`,
      key: "upload_desc_img",
    });
    try {
      const res = await updateImageDescription(file);
      const url = res?.data?.url || res?.url;
      if (url) {
        message.success({
          content: "Tải ảnh lên Cloudinary thành công!",
          key: "upload_desc_img",
        });
        return res;
      }
      throw new Error("Không nhận được URL ảnh từ máy chủ");
    } catch (err) {
      message.error({
        content: err.response?.data?.message || "Lỗi khi tải ảnh lên Cloudinary",
        key: "upload_desc_img",
      });
      throw err;
    }
  };

  // Delete image from description content (Cloudinary)
  const handleDeleteDescImage = async (imageUrl) => {
    if (!imageUrl) return;
    message.loading({
      content: "Đang xóa ảnh mô tả khỏi Cloudinary...",
      key: "delete_desc_img",
    });
    try {
      await deleteImageDescription(imageUrl);
      message.success({
        content: "Đã xóa ảnh mô tả sản phẩm thành công!",
        key: "delete_desc_img",
      });
      return true;
    } catch (err) {
      console.error("Lỗi khi xóa ảnh mô tả sản phẩm:", err);
      message.error({
        content: err.response?.data?.message || "Lỗi khi xóa ảnh mô tả sản phẩm",
        key: "delete_desc_img",
      });
      throw err;
    }
  };

  // Upload image to Cloudinary and append right below current description content
  const handleInsertImageUnderDescription = async (file) => {
    setUploadingDescImage(true);
    message.loading({
      content: `Đang tải ảnh vui lòng đợi...`,
      key: "upload_desc_img",
    });
    try {
      const res = await updateImageDescription(file);
      const url = res?.data?.url || res?.url;
      if (url) {
        const alt = file.name.replace(/\.[^/.]+$/, "");
        const currentContent = form.getFieldValue("longDescription") || "";
        const imgTag = `<p style="text-align: center;"><img src="${url}" alt="${alt}" data-size="medium" /></p>`;
        const newContent = currentContent ? `${currentContent}\n${imgTag}` : imgTag;
        form.setFieldsValue({ longDescription: newContent });
        message.success({
          content: "Đã tải ảnh lên Cloudinary và chèn vào mô tả!",
          key: "upload_desc_img",
        });
      } else {
        throw new Error("Không nhận được URL ảnh");
      }
    } catch (err) {
      message.error({
        content: err.response?.data?.message || "Lỗi khi tải ảnh lên Cloudinary",
        key: "upload_desc_img",
      });
    } finally {
      setUploadingDescImage(false);
    }
  };

  // Filter states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterBrand, setFilterBrand] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterFeatured, setFilterFeatured] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await getAllCategories();
      setCategories(res.data ?? []);
    } catch {
      setCategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await getAllBrands();
      setBrands(res.data ?? []);
    } catch {
      setBrands([]);
    }
  };

  const fetchProductThumbnail = async (productId) => {
    try {
      const res = await getProductImages(productId);
      if (!res || res.length === 0) return null;
      const primary = res.find((img) => img.isPrimary === 1);
      return primary ? primary.imageUrl : res[0].imageUrl;
    } catch {
      return null;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllProducts();
      const products = res.data ?? [];
      const dataWithImages = await Promise.all(
        products.map(async (p) => {
          const thumbnail = await fetchProductThumbnail(p.id);
          return {
            ...p,
            thumbnail,
          };
        })
      );
      setData(dataWithImages);
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi tải dữ liệu sản phẩm");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const RemoveImages = async (productImageId) => {
    try {
      await deleteProductImage(productImageId);
      message.success("Đã xóa ảnh thành công");
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi xóa ảnh");
    }
  };

  const handleRemoveImage = (file) => {
    return new Promise((resolve) => {
      if (file.url) {
        Modal.confirm({
          title: "Xác nhận xóa ảnh",
          icon: <ExclamationCircleOutlined />,
          content: "Bạn có chắc muốn xóa ảnh này khỏi sản phẩm trên hệ thống không?",
          okText: "Xóa ảnh",
          okButtonProps: { danger: true },
          cancelText: "Hủy",
          onOk: async () => {
            await RemoveImages(file.uid);
            setImages((prev) => prev.filter((f) => f.uid !== file.uid));
            resolve(true);
          },
          onCancel: () => resolve(false),
        });
      } else {
        setImages((prev) => prev.filter((f) => f.uid !== file.uid));
        resolve(true);
      }
    });
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchData();
  }, []);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search keyword (Name or SKU)
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(kw);
        const matchSku = item.sku?.toLowerCase().includes(kw);
        if (!matchName && !matchSku) return false;
      }
      // Category filter
      if (filterCategory !== null && item.categoryId !== filterCategory) {
        return false;
      }
      // Brand filter
      if (filterBrand !== null && item.brandId !== filterBrand) {
        return false;
      }
      // Status filter
      if (filterStatus !== null) {
        const isActive = item.isActive === 1 || item.isActive === true;
        if (filterStatus === 1 && !isActive) return false;
        if (filterStatus === 0 && isActive) return false;
      }
      // Featured filter
      if (filterFeatured !== null) {
        if (Number(item.isFeatured || 0) !== filterFeatured) return false;
      }
      return true;
    });
  }, [data, searchKeyword, filterCategory, filterBrand, filterStatus, filterFeatured]);

  const handleResetFilters = () => {
    setSearchKeyword("");
    setFilterCategory(null);
    setFilterBrand(null);
    setFilterStatus(null);
    setFilterFeatured(null);
  };

  // Open Product Detail Drawer
  const handleViewDetail = async (record) => {
    setDetailProduct(record);
    setDetailDrawerOpen(true);
    setDetailLoading(true);
    try {
      const [specsRes, imagesRes] = await Promise.allSettled([
        SpecsForProduct(record.id),
        getProductImages(record.id),
      ]);

      if (specsRes.status === "fulfilled") {
        setDetailSpecs(specsRes.value || []);
      } else {
        setDetailSpecs([]);
      }

      if (imagesRes.status === "fulfilled") {
        setDetailImages(imagesRes.value || []);
      } else {
        setDetailImages([]);
      }
    } catch {
      setDetailSpecs([]);
      setDetailImages([]);
    } finally {
      setDetailLoading(false);
    }
  };

  // Submit with validation and confirm popup
  const doSubmit = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const payload = {
        categoryId: values.categoryId,
        brandId: values.brandId,
        name: values.name.trim(),
        slug: values.slug ? values.slug.trim() : toSlug(values.name.trim()),
        sku: values.sku ? values.sku.trim() : "",
        description: values.description ? values.description.trim() : "",
        longDescription: values.longDescription ? values.longDescription.trim() : "",
        price: Number(values.price) || 0,
        salePrice: Number(values.salePrice) || 0,
        costPrice: Number(values.costPrice) || 0,
        stockQuantity: Number(values.stockQuantity) || 0,
        weight: Number(values.weight) || 0,
      };

      if (editingId) {
        await updateProduct(editingId, payload);
        const files = images
          .filter((f) => f.originFileObj)
          .map((f) => f.originFileObj);
        if (files.length > 0) {
          await uploadProductImages(editingId, files);
        }
        message.success("Cập nhật sản phẩm thành công!");
      } else {
        const product = await createProduct(payload);
        if (images.length > 0) {
          const files = images.map((f) => f.originFileObj).filter(Boolean);
          if (files.length > 0) {
            await uploadProductImages(product.id, files);
          }
        }
        message.success("Thêm sản phẩm mới thành công!");
      }

      setModalOpen(false);
      setImages([]);
      form.resetFields();
      setEditingId(null);
      fetchData();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || "Lỗi lưu thông tin sản phẩm");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
    } catch {
      message.warning("Vui lòng kiểm tra lại các trường dữ liệu còn thiếu hoặc không hợp lệ!");
      return;
    }

    Modal.confirm({
      title: editingId ? "Xác nhận cập nhật sản phẩm" : "Xác nhận thêm sản phẩm mới",
      icon: <ExclamationCircleOutlined />,
      content: editingId
        ? `Bạn có chắc muốn cập nhật thông tin sản phẩm "${form.getFieldValue("name")}" không?`
        : `Bạn có chắc muốn thêm sản phẩm mới "${form.getFieldValue("name")}" vào hệ thống không?`,
      okText: editingId ? "Cập nhật" : "Tạo mới",
      cancelText: "Hủy",
      onOk: doSubmit,
    });
  };

  const handleEdit = async (record) => {
    form.setFieldsValue({
      ...record,
      salePrice: Number(record.salePrice) || 0,
      costPrice: Number(record.costPrice) || 0,
      stockQuantity: Number(record.stockQuantity) || 0,
      weight: Number(record.weight) || 0,
    });
    try {
      const res = await getProductImages(record.id);
      const fileList = res.map((img, index) => ({
        uid: img.id || index,
        name: `ảnh-${index + 1}`,
        status: "done",
        url: img.imageUrl,
      }));
      setImages(fileList);
    } catch {
      setImages([]);
    }
    setEditingId(record.id);
    setActiveTab("basic");
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      try {
        await apiClient.delete(`/products/${id}`);
      } catch {
        await apiClient.delete(`/product/delete/${id}`);
      }
      message.success("Đã xóa sản phẩm thành công!");
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi khi xóa sản phẩm");
    }
  };

  const handleNameChange = (e) => {
    const nameVal = e.target.value;
    if (!editingId) {
      form.setFieldsValue({ slug: toSlug(nameVal) });
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 55,
      align: "center",
      render: (_, __, index) => (
        <span style={{ color: "#64748b", fontWeight: 500 }}>{index + 1}</span>
      ),
    },
    {
      title: "Ảnh",
      key: "image",
      width: 75,
      align: "center",
      render: (_, record) =>
        record.thumbnail ? (
          <Image
            src={record.thumbnail}
            alt={record.name}
            width={52}
            height={52}
            style={{
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
            }}
            preview={{ mask: <PictureOutlined style={{ fontSize: 16 }} /> }}
          />
        ) : (
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 8,
              background: "#f1f5f9",
              border: "1px dashed #cbd5e1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: 18,
              margin: "0 auto",
            }}
          >
            <PictureOutlined />
          </div>
        ),
    },
    {
      title: "Thông tin sản phẩm",
      key: "name",
      width: 280,
      render: (_, record) => {
        const cat = categories.find((c) => c.id === record.categoryId);
        const br = brands.find((b) => b.id === record.brandId);
        return (
          <div>
            <div
              style={{
                fontWeight: 600,
                color: "#0f172a",
                fontSize: 14,
                lineHeight: 1.35,
                cursor: "pointer",
              }}
              onClick={() => handleViewDetail(record)}
              title="Nhấn để xem chi tiết sản phẩm"
            >
              {record.name}
            </div>
            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 6,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {record.sku && (
                <Tag color="blue" style={{ margin: 0, fontSize: 11, borderRadius: 4 }}>
                  SKU: {record.sku}
                </Tag>
              )}
              {cat && (
                <Tag color="default" style={{ margin: 0, fontSize: 11, borderRadius: 4 }}>
                  📁 {cat.name}
                </Tag>
              )}
              {br && (
                <Tag color="purple" style={{ margin: 0, fontSize: 11, borderRadius: 4 }}>
                  🏷️ {br.name}
                </Tag>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Giá bán",
      key: "price",
      width: 160,
      render: (_, record) => {
        const price = Number(record.price) || 0;
        const salePrice = Number(record.salePrice) || 0;
        const hasSale = salePrice > 0 && salePrice < price;
        const discountPct = hasSale
          ? Math.round(((price - salePrice) / price) * 100)
          : 0;

        return (
          <div>
            {hasSale ? (
              <div>
                <div style={{ color: "#dc2626", fontWeight: 700, fontSize: 14 }}>
                  {salePrice.toLocaleString("vi-VN")} ₫
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 2,
                  }}
                >
                  <span
                    style={{
                      textDecoration: "line-through",
                      color: "#94a3b8",
                      fontSize: 12,
                    }}
                  >
                    {price.toLocaleString("vi-VN")} ₫
                  </span>
                  <Tag
                    color="red"
                    style={{
                      margin: 0,
                      fontSize: 10,
                      padding: "0 4px",
                      lineHeight: "16px",
                      borderRadius: 4,
                    }}
                  >
                    -{discountPct}%
                  </Tag>
                </div>
              </div>
            ) : (
              <div style={{ color: "#0f172a", fontWeight: 600, fontSize: 14 }}>
                {price > 0 ? `${price.toLocaleString("vi-VN")} ₫` : "Liên hệ"}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Tồn kho",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      width: 110,
      render: (value) => {
        const qty = Number(value) || 0;
        if (qty === 0) {
          return <span className="admin-badge-stock-out">● Hết hàng</span>;
        }
        if (qty <= 10) {
          return <span className="admin-badge-stock-low">● Còn {qty} chiếc</span>;
        }
        return <span className="admin-badge-stock-ok">● Còn {qty} chiếc</span>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 130,
      render: (value, record) => {
        const checked = value === 1 || value === true;
        return (
          <Popconfirm
            title="Xác nhận đổi trạng thái"
            description={
              checked
                ? `Tạm ẩn sản phẩm "${record.name}" khỏi gian hàng?`
                : `Mở bán lại sản phẩm "${record.name}" trên gian hàng?`
            }
            okText="Đồng ý"
            cancelText="Hủy"
            onConfirm={async () => {
              try {
                await updateProductStatus(record.id);
                message.success("Cập nhật trạng thái thành công");
                fetchData();
              } catch {
                message.error("Lỗi cập nhật trạng thái");
              }
            }}
          >
            <Space style={{ cursor: "pointer" }}>
              <Switch
                checked={checked}
                size="small"
                style={{ pointerEvents: "none" }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: checked ? "#059669" : "#64748b",
                  fontWeight: 600,
                }}
              >
                {checked ? "Đang bán" : "Tạm ẩn"}
              </span>
            </Space>
          </Popconfirm>
        );
      },
    },
    {
      title: "Nổi bật",
      dataIndex: "isFeatured",
      key: "isFeatured",
      width: 110,
      align: "center",
      render: (value, record) => {
        const isFeat = value === 1;
        return (
          <Popconfirm
            title="Cập nhật độ nổi bật"
            description={
              isFeat
                ? `Bỏ trạng thái nổi bật của sản phẩm "${record.name}"?`
                : `Đặt sản phẩm "${record.name}" làm sản phẩm nổi bật?`
            }
            okText="Đồng ý"
            cancelText="Hủy"
            onConfirm={async () => {
              try {
                await updateProductFeatured(record.id);
                message.success("Đã cập nhật trạng thái nổi bật");
                fetchData();
              } catch {
                message.error("Lỗi cập nhật nổi bật");
              }
            }}
          >
            <Tooltip
              title={
                isFeat
                  ? "Click để bỏ nổi bật"
                  : "Click để đặt làm sản phẩm nổi bật"
              }
            >
              <Button
                size="small"
                type={isFeat ? "primary" : "default"}
                icon={
                  isFeat ? (
                    <StarFilled style={{ color: "#facc15" }} />
                  ) : (
                    <StarOutlined />
                  )
                }
                style={{
                  borderRadius: 20,
                  fontSize: 12,
                  background: isFeat ? "#fef9c3" : "#f8fafc",
                  borderColor: isFeat ? "#facc15" : "#cbd5e1",
                  color: isFeat ? "#854d0e" : "#64748b",
                  fontWeight: 600,
                }}
              >
                {isFeat ? "Nổi bật" : "Thường"}
              </Button>
            </Tooltip>
          </Popconfirm>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 130,
      align: "center",
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="Xem chi tiết sản phẩm">
            <button
              className="admin-btn-action admin-btn-view"
              onClick={() => handleViewDetail(record)}
            >
              <EyeOutlined />
            </button>
          </Tooltip>

          <Tooltip title="Chỉnh sửa sản phẩm">
            <button
              className="admin-btn-action admin-btn-edit"
              onClick={() => handleEdit(record)}
            >
              <EditOutlined />
            </button>
          </Tooltip>

          <Popconfirm
            title="Xác nhận xóa sản phẩm"
            description={`Bạn có chắc muốn xóa sản phẩm "${record.name}" không? Thao tác này không thể hoàn tác.`}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa sản phẩm">
              <button className="admin-btn-action admin-btn-delete">
                <DeleteOutlined />
              </button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Helper info for Detail Drawer
  const detailCat = categories.find((c) => c.id === detailProduct?.categoryId);
  const detailBr = brands.find((b) => b.id === detailProduct?.brandId);
  const detailPrice = Number(detailProduct?.price) || 0;
  const detailSalePrice = Number(detailProduct?.salePrice) || 0;
  const detailCostPrice = Number(detailProduct?.costPrice) || 0;
  const detailHasSale = detailSalePrice > 0 && detailSalePrice < detailPrice;
  const detailEffectivePrice = detailHasSale ? detailSalePrice : detailPrice;
  const detailProfit =
    detailEffectivePrice > 0 && detailCostPrice > 0
      ? detailEffectivePrice - detailCostPrice
      : 0;

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h2>Quản lý sản phẩm</h2>
          <p>
            Quản lý toàn bộ danh mục hàng hóa, định giá, số lượng tồn kho và hình ảnh sản phẩm
          </p>
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
              setImages([]);
              setActiveTab("basic");
              setModalOpen(true);
            }}
            style={{ borderRadius: 8 }}
          >
            Thêm sản phẩm mới
          </Button>
        </Space>
      </div>

      {/* KPI Stats Overview Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6} md={6}>
          <div
            style={{
              background: "#ffffff",
              padding: "16px 20px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              <ShoppingOutlined />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                Tổng sản phẩm
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
                {data.length}
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <div
            style={{
              background: "#ffffff",
              padding: "16px 20px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "#ecfdf5",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              <CheckCircleOutlined />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                Đang kinh doanh
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#059669" }}>
                {data.filter((p) => p.isActive === 1 || p.isActive === true).length}
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <div
            style={{
              background: "#ffffff",
              padding: "16px 20px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "#fef2f2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              <WarningOutlined />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                Hết hàng tồn
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#dc2626" }}>
                {data.filter((p) => (Number(p.stockQuantity) || 0) === 0).length}
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <div
            style={{
              background: "#ffffff",
              padding: "16px 20px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "#fefce8",
                color: "#eab308",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              <StarFilled />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                Sản phẩm nổi bật
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#d97706" }}>
                {data.filter((p) => p.isFeatured === 1).length}
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filter Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <Input
            placeholder="Tìm theo tên hoặc SKU..."
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 230, borderRadius: 8 }}
            allowClear
          />

          <Select
            placeholder="Tất cả danh mục"
            value={filterCategory}
            onChange={setFilterCategory}
            style={{ width: 170 }}
            showSearch
            optionFilterProp="label"
            allowClear
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />

          <Select
            placeholder="Tất cả thương hiệu"
            value={filterBrand}
            onChange={setFilterBrand}
            style={{ width: 170 }}
            showSearch
            optionFilterProp="label"
            allowClear
            options={brands.map((b) => ({ value: b.id, label: b.name }))}
          />

          <Select
            placeholder="Trạng thái bán"
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 140 }}
            allowClear
            options={[
              { value: 1, label: "🟢 Đang bán" },
              { value: 0, label: "⚪ Tạm ẩn" },
            ]}
          />

          <Select
            placeholder="Độ nổi bật"
            value={filterFeatured}
            onChange={setFilterFeatured}
            style={{ width: 130 }}
            allowClear
            options={[
              { value: 1, label: "⭐ Nổi bật" },
              { value: 0, label: "Bình thường" },
            ]}
          />

          {(searchKeyword ||
            filterCategory !== null ||
            filterBrand !== null ||
            filterStatus !== null ||
            filterFeatured !== null) && (
            <Button type="dashed" onClick={handleResetFilters}>
              Đặt lại
            </Button>
          )}
        </div>

        <div className="admin-toolbar-right">
          <span style={{ fontSize: 13, color: "#64748b" }}>
            Hiển thị <strong>{filteredData.length}</strong> / {data.length} sản phẩm
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
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Tổng cộng ${total} sản phẩm`,
          }}
        />
      </div>

      {/* ================================================================ */}
      {/* Product Detail Drawer                                            */}
      {/* ================================================================ */}
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
              <ShoppingOutlined />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                Chi tiết sản phẩm
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Mã hệ thống: <strong>#{detailProduct?.id}</strong> • SKU:{" "}
                <strong>{detailProduct?.sku || "Chưa thiết lập"}</strong>
              </div>
            </div>
          </div>
        }
        placement="right"
        width={720}
        onClose={() => setDetailDrawerOpen(false)}
        open={detailDrawerOpen}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                const prod = detailProduct;
                setDetailDrawerOpen(false);
                handleEdit(prod);
              }}
            >
              Chỉnh sửa sản phẩm
            </Button>
          </Space>
        }
      >
        <Spin spinning={detailLoading}>
          {detailProduct && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Card 1: Tổng quan tên & Trạng thái */}
              <div
                style={{
                  background: "#ffffff",
                  padding: "18px 20px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>
                  {detailProduct.name}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {detailProduct.isActive === 1 || detailProduct.isActive === true ? (
                    <Tag color="green" style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12 }}>
                      ● Đang kinh doanh
                    </Tag>
                  ) : (
                    <Tag color="default" style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12 }}>
                      ● Tạm ẩn khỏi gian hàng
                    </Tag>
                  )}

                  {detailProduct.isFeatured === 1 && (
                    <Tag color="gold" style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12 }}>
                      ⭐ Sản phẩm nổi bật
                    </Tag>
                  )}

                  {detailCat && (
                    <Tag color="blue" style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12 }}>
                      📁 {detailCat.name}
                    </Tag>
                  )}

                  {detailBr && (
                    <Tag color="purple" style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12 }}>
                      🏷️ {detailBr.name}
                    </Tag>
                  )}
                </div>

                <div style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
                  Đường dẫn (slug):{" "}
                  <code
                    style={{
                      background: "#f1f5f9",
                      padding: "2px 6px",
                      borderRadius: 4,
                      color: "#2563eb",
                    }}
                  >
                    /{detailProduct.slug}
                  </code>
                </div>
              </div>

              {/* Card 2: Hình ảnh sản phẩm (Gallery) */}
              <div
                style={{
                  background: "#ffffff",
                  padding: "18px 20px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, marginBottom: 12 }}>
                  🖼️ Thư viện hình ảnh ({detailImages.length})
                </div>

                {detailImages.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px 0",
                      background: "#f8fafc",
                      borderRadius: 8,
                      border: "1px dashed #cbd5e1",
                      color: "#94a3b8",
                    }}
                  >
                    <PictureOutlined style={{ fontSize: 28, marginBottom: 6 }} />
                    <div>Chưa có hình ảnh nào được tải lên cho sản phẩm này.</div>
                  </div>
                ) : (
                  <Image.PreviewGroup>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {detailImages.map((img, idx) => (
                        <div
                          key={img.id || idx}
                          style={{
                            position: "relative",
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                            overflow: "hidden",
                            background: "#f8fafc",
                          }}
                        >
                          <Image
                            src={img.imageUrl}
                            width={110}
                            height={110}
                            style={{ objectFit: "cover" }}
                            alt={`Ảnh ${idx + 1}`}
                          />
                          {img.isPrimary === 1 && (
                            <span
                              style={{
                                position: "absolute",
                                bottom: 4,
                                left: 4,
                                background: "rgba(37,99,235,0.85)",
                                color: "#ffffff",
                                fontSize: 10,
                                padding: "1px 6px",
                                borderRadius: 4,
                                fontWeight: 600,
                              }}
                            >
                              Ảnh chính
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </Image.PreviewGroup>
                )}
              </div>

              {/* Card 3: Giá bán, Biên lợi nhuận & Tồn kho */}
              <div
                style={{
                  background: "#ffffff",
                  padding: "18px 20px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, marginBottom: 14 }}>
                  💰 Giá bán & Tồn kho
                </div>

                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 8 }}>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Giá niêm yết</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
                        {detailPrice > 0 ? `${detailPrice.toLocaleString("vi-VN")} ₫` : "Liên hệ"}
                      </div>
                    </div>
                  </Col>

                  <Col span={8}>
                    <div style={{ background: "#fef2f2", padding: "12px 14px", borderRadius: 8 }}>
                      <div style={{ fontSize: 12, color: "#dc2626" }}>Giá khuyến mãi</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#dc2626", marginTop: 2 }}>
                        {detailHasSale
                          ? `${detailSalePrice.toLocaleString("vi-VN")} ₫`
                          : "Không khuyến mãi"}
                      </div>
                    </div>
                  </Col>

                  <Col span={8}>
                    <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 8 }}>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Giá vốn nhập kho</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#475569", marginTop: 2 }}>
                        {detailCostPrice > 0
                          ? `${detailCostPrice.toLocaleString("vi-VN")} ₫`
                          : "Chưa thiết lập"}
                      </div>
                    </div>
                  </Col>

                  <Col span={8}>
                    <div style={{ background: "#ecfdf5", padding: "12px 14px", borderRadius: 8 }}>
                      <div style={{ fontSize: 12, color: "#059669" }}>Biên lợi nhuận ước tính</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#059669", marginTop: 2 }}>
                        {detailProfit > 0 ? `+${detailProfit.toLocaleString("vi-VN")} ₫` : "—"}
                      </div>
                    </div>
                  </Col>

                  <Col span={8}>
                    <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 8 }}>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Số lượng tồn kho</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
                        {Number(detailProduct.stockQuantity) || 0} chiếc
                      </div>
                    </div>
                  </Col>

                  <Col span={8}>
                    <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 8 }}>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Khối lượng đóng gói</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
                        {detailProduct.weight ? `${detailProduct.weight} kg` : "—"}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Card 4: Thông số kỹ thuật (Specifications) */}
              <div
                style={{
                  background: "#ffffff",
                  padding: "18px 20px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                    📋 Thông số kỹ thuật ({detailSpecs.length})
                  </div>
                  <Button
                    type="link"
                    size="small"
                    icon={<UnorderedListOutlined />}
                    onClick={() => {
                      setDetailDrawerOpen(false);
                      navigate("/admin/product-specs");
                    }}
                  >
                    Quản lý thông số SP
                  </Button>
                </div>

                {detailSpecs.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px 0",
                      background: "#f8fafc",
                      borderRadius: 8,
                      border: "1px dashed #cbd5e1",
                      color: "#94a3b8",
                    }}
                  >
                    <div>Sản phẩm này chưa được cấu hình thông số kỹ thuật nào.</div>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setDetailDrawerOpen(false);
                        navigate("/admin/product-specs");
                      }}
                      style={{ marginTop: 8 }}
                    >
                      Cấu hình thông số ngay
                    </Button>
                  </div>
                ) : (
                  <Table
                    dataSource={detailSpecs}
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
                        render: (_, __, idx) => (
                          <span style={{ color: "#64748b" }}>{idx + 1}</span>
                        ),
                      },
                      {
                        title: "Tên thông số",
                        dataIndex: "specName",
                        key: "specName",
                        width: 200,
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
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>{val}</span>
                        ),
                      },
                      {
                        title: "Thứ tự",
                        dataIndex: "displayOrder",
                        key: "displayOrder",
                        width: 75,
                        align: "center",
                        render: (order) => (
                          <span
                            style={{
                              background: "#f1f5f9",
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontSize: 12,
                            }}
                          >
                            {order || 0}
                          </span>
                        ),
                      },
                    ]}
                  />
                )}
              </div>

              {/* Card 5: Mô tả sản phẩm */}
              <div
                style={{
                  background: "#ffffff",
                  padding: "18px 20px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, marginBottom: 12 }}>
                  📝 Nội dung mô tả sản phẩm
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>
                    Mô tả tóm tắt:
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px 14px",
                      borderRadius: 8,
                      fontSize: 13.5,
                      color: "#334155",
                      lineHeight: 1.6,
                    }}
                  >
                    {detailProduct.description || "Chưa có mô tả tóm tắt."}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                    Mô tả chi tiết (Định dạng HTML):
                  </div>
                  {detailProduct.longDescription ? (
                    <div
                      className="product-detail-html-content"
                      style={{
                        background: "#f8fafc",
                        padding: "16px 18px",
                        borderRadius: 8,
                        maxHeight: 380,
                        overflowY: "auto",
                        border: "1px solid #e2e8f0",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: embedYoutubeInHtml(detailProduct.longDescription),
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        background: "#f8fafc",
                        padding: "14px 16px",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "#94a3b8",
                        fontStyle: "italic",
                      }}
                    >
                      Chưa có mô tả chi tiết.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Spin>
      </Drawer>

      {/* ================================================================ */}
      {/* Add / Edit Product Modal                                         */}
      {/* ================================================================ */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
            {editingId ? "✏️ Chỉnh sửa sản phẩm" : "✨ Thêm sản phẩm mới"}
          </div>
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setEditingId(null);
          setImages([]);
        }}
        okText={editingId ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
        cancelText="Hủy"
        confirmLoading={submitting}
        width={860}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "basic",
                label: "📋 1. Thông tin cơ bản",
                children: (
                  <div>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="categoryId"
                          label="Danh mục sản phẩm"
                          rules={[
                            { required: true, message: "Vui lòng chọn danh mục sản phẩm" },
                          ]}
                        >
                          <Select
                            placeholder="Chọn danh mục"
                            showSearch
                            optionFilterProp="label"
                            options={categories.map((c) => ({
                              value: c.id,
                              label: c.name,
                            }))}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          name="brandId"
                          label="Thương hiệu sản phẩm"
                          rules={[
                            { required: true, message: "Vui lòng chọn thương hiệu" },
                          ]}
                        >
                          <Select
                            placeholder="Chọn thương hiệu"
                            showSearch
                            optionFilterProp="label"
                            options={brands.map((b) => ({
                              value: b.id,
                              label: b.name,
                            }))}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="name"
                      label="Tên sản phẩm"
                      rules={[
                        { required: true, message: "Vui lòng nhập tên sản phẩm" },
                        { min: 3, message: "Tên sản phẩm phải có ít nhất 3 ký tự" },
                        { max: 200, message: "Tên sản phẩm không được vượt quá 200 ký tự" },
                        {
                          validator: (_, value) =>
                            value && value.trim() !== value
                              ? Promise.reject("Tên sản phẩm không được có khoảng trắng đầu/cuối")
                              : Promise.resolve(),
                        },
                      ]}
                    >
                      <Input
                        placeholder="Ví dụ: Còi Hú Báo Động 245PK"
                        onChange={handleNameChange}
                        maxLength={200}
                        showCount
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="slug"
                          label="Đường dẫn thân thiện (Slug)"
                          tooltip="Tự động tạo từ tên sản phẩm hoặc tự nhập"
                          rules={[
                            { required: true, message: "Vui lòng nhập slug" },
                            {
                              pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
                              message: "Slug chỉ chứa chữ thường không dấu, số và gạch ngang (vd: coi-hu-245pk)",
                            },
                          ]}
                        >
                          <Input placeholder="coi-hu-bao-dong-245pk" maxLength={200} />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          name="sku"
                          label="Mã sản phẩm (SKU)"
                          tooltip="Mã định danh duy nhất của sản phẩm"
                          rules={[
                            {
                              pattern: /^[A-Za-z0-9-_]*$/,
                              message: "SKU chỉ được chứa chữ cái, số, gạch ngang (-) hoặc gạch dưới (_)",
                            },
                          ]}
                        >
                          <Input placeholder="TC-245PK" maxLength={50} showCount />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: "pricing",
                label: "💰 2. Giá bán & Kho hàng",
                children: (
                  <div>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          name="price"
                          label="Giá bán niêm yết"
                          rules={[
                            { required: true, message: "Vui lòng nhập giá bán niêm yết" },
                            { type: "number", min: 0, message: "Giá bán không được âm" },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            formatter={(v) =>
                              v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫" : ""
                            }
                            parser={(v) => v.replace(/[^\d]/g, "")}
                            placeholder="1.500.000 ₫"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          name="salePrice"
                          label="Giá khuyến mãi (nếu có)"
                          tooltip="Phải nhỏ hơn giá niêm yết. Nhập 0 nếu không áp dụng"
                          rules={[
                            { type: "number", min: 0, message: "Giá khuyến mãi không được âm" },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const price = Number(getFieldValue("price")) || 0;
                                if (value && Number(value) >= price && price > 0) {
                                  return Promise.reject("Giá khuyến mãi phải nhỏ hơn giá niêm yết!");
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                        >
                          <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            formatter={(v) =>
                              v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫" : ""
                            }
                            parser={(v) => (v ? v.replace(/[^\d]/g, "") : "")}
                            placeholder="1.200.000 ₫"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          name="costPrice"
                          label="Giá vốn nhập kho"
                          tooltip="Giá mua vào để tính lợi nhuận (nội bộ)"
                          rules={[
                            { type: "number", min: 0, message: "Giá vốn không được âm" },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            formatter={(v) =>
                              v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫" : ""
                            }
                            parser={(v) => (v ? v.replace(/[^\d]/g, "") : "")}
                            placeholder="800.000 ₫"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="stockQuantity"
                          label="Số lượng tồn kho"
                          initialValue={0}
                          rules={[
                            { required: true, message: "Vui lòng nhập số lượng tồn kho" },
                            { type: "number", min: 0, message: "Số lượng tồn kho không được âm" },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="50"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          name="weight"
                          label="Khối lượng (kg)"
                          initialValue={0}
                          rules={[
                            { type: "number", min: 0, message: "Khối lượng không được âm" },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            step={0.1}
                            style={{ width: "100%" }}
                            placeholder="1.5"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: "media",
                label: "🖼️ 3. Hình ảnh & Mô tả",
                children: (
                  <div>
                    <Form.Item
                      label="Ảnh sản phẩm"
                      tooltip="Chọn ảnh từ thiết bị để tải lên. Ảnh đầu tiên hoặc ảnh chính sẽ hiển thị làm thumbnail"
                    >
                      <Upload
                        multiple
                        listType="picture-card"
                        fileList={images}
                        beforeUpload={() => false}
                        onChange={({ fileList }) => setImages(fileList)}
                        onRemove={handleRemoveImage}
                      >
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 6, fontSize: 12 }}>Tải ảnh lên</div>
                        </div>
                      </Upload>
                    </Form.Item>

                    <Form.Item
                      name="description"
                      label="Mô tả tóm tắt"
                      rules={[
                        { max: 500, message: "Mô tả tóm tắt tối đa 500 ký tự" },
                      ]}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Mô tả ngắn gọn về đặc điểm nổi bật, ứng dụng của sản phẩm..."
                        maxLength={500}
                        showCount
                      />
                    </Form.Item>

                    <Form.Item
                      name="longDescription"
                      label="Mô tả chi tiết sản phẩm (Hỗ trợ định dạng Rich Text & HTML)"
                      tooltip="Soạn thảo trực quan hoặc dán mã HTML. Bạn có thể nhấn '📁 Tải ảnh từ máy' trên thanh công cụ hoặc bấm nút chọn ảnh bên dưới để tải ảnh lên Cloudinary và chèn vào nội dung."
                    >
                      <Suspense fallback={<Spin tip="Đang tải trình soạn thảo..." />}>
                        <RichTextEditor
                          placeholder="Nhập nội dung mô tả chi tiết sản phẩm, chèn ảnh hoặc dán mã HTML..."
                          onUploadImage={handleUploadDescImage}
                          onDeleteImage={handleDeleteDescImage}
                        />
                      </Suspense>
                    </Form.Item>

                    {/* Quick Image Inserter directly below description */}
                    <div
                      style={{
                        marginTop: -10,
                        marginBottom: 16,
                        padding: "10px 16px",
                        background: "#f0fdf4",
                        borderRadius: 8,
                        border: "1px dashed #86efac",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <PictureOutlined style={{ color: "#16a34a", fontSize: 18 }} />
                        <div>
                          <div style={{ fontWeight: 600, color: "#15803d", fontSize: 13 }}>
                            📷 Chèn thêm ảnh vào mô tả (Cloudinary)
                          </div>
                          <div style={{ fontSize: 12, color: "#475569" }}>
                            Chọn ảnh từ máy tính để tự động tải lên Cloudinary và chèn tiếp vào dưới nội dung mô tả bạn vừa viết.
                          </div>
                        </div>
                      </div>
                      <Upload
                        showUploadList={false}
                        accept="image/*"
                        beforeUpload={async (file) => {
                          await handleInsertImageUnderDescription(file);
                          return false;
                        }}
                      >
                        <Button
                          type="primary"
                          ghost
                          icon={<PlusOutlined />}
                          loading={uploadingDescImage}
                          style={{ borderColor: "#16a34a", color: "#16a34a" }}
                        >
                          Chọn ảnh chèn vào mô tả
                        </Button>
                      </Upload>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </Form>
      </Modal>
    </div>
  );
}

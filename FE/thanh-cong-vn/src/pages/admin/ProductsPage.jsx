import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Select, Space, message, Tag, Upload } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import apiClient from "../../api/client";
import { getAllCategories } from "../../services/CategoryService";
import { getAllBrands } from "../../services/BrandsService";
import {
  getAllProducts, updateProductStatus, createProduct,
  updateProduct, uploadProductImages, getProductImages, deleteProductImage,
  updateProductFeatured, updateProductSalePrice, updateProductStock,
  updateProductPrice
} from "../../services/ProductService";

export function ProductsPage() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [images, setImages] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await getAllCategories();
      setCategories(res ?? []);

    } catch {
      setCategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await getAllBrands();
      setBrands(res ?? []);
      console.log("Check br", res);
    } catch {
      setBrands([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllProducts();
      console.log("Check res", res);

      const products = res.content ?? [];
      const dataWithImages = await Promise.all(
        products.map(async (p) => {
          const thumbnail = await fetchProductThumbnail(p.id);
          return {
            ...p,
            thumbnail
          };
        })
      );


      setData(dataWithImages);

    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi tải dữ liệu");
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchProductThumbnail = async (productId) => {
    try {
      const res = await getProductImages(productId);

      if (!res || res.length === 0) return null;

      const primary = res.find((img) => img.isPrimary === 1);

      return primary ? primary.imageUrl : res[0].imageUrl;
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi tải ảnh sản phẩm");
      return null;
    }
  };

  const RemoveImages = async (productImageId) => {
    try {
      await deleteProductImage(productImageId);
      message.success("Đã xóa ảnh");
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi xóa ảnh");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchData();

  }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        categoryId: values.categoryId,
        brandId: values.brandId,
        name: values.name,
        slug: values.slug,
        sku: values.sku,
        description: values.description,
        longDescription: values.longDescription,
        price: Number(values.price) || 0,
        salePrice: Number(values.salePrice) || 0,
        costPrice: Number(values.costPrice) || 0,
        stockQuantity: Number(values.stockQuantity) || 0,
        weight: Number(values.weight) || 0
      };
      if (editingId) {
        Modal.confirm({
          title: "Xác nhận sửa sản phẩm",
          content: "Bạn có chắc muốn sửa sản phẩm này?",
          okText: "Xác nhận",
          cancelText: "Hủy",
          onOk: async () => {
            try {
              await updateProduct(editingId, payload);
              const files = images
                .filter((f) => f.originFileObj)
                .map((f) => f.originFileObj);
              if (files.length > 0) {
                await uploadProductImages(editingId, files);
              }
              message.success("Sửa thành công");
              fetchData();
            } catch (err) {
              message.error(err.response?.data?.message || "Lỗi sửa sản phẩm");
            }
          }
        });
      } else {
        Modal.confirm({
          title: "Xác nhận thêm sản phẩm",
          content: "Bạn có chắc muốn thêm sản phẩm này?",
          okText: "Xác nhận",
          cancelText: "Hủy",
          onOk: async () => {
            try {
              const product = await createProduct(payload);

              if (images.length > 0) {
                const files = images.map((f) => f.originFileObj);
                await uploadProductImages(product.id, files);
              }

              message.success("Thêm thành công");
              fetchData();
            } catch (err) {
              message.error(err.response?.data?.message || "Lỗi thêm sản phẩm");
            }
          }
        });
      }
      setModalOpen(false);
      setImages([]);
      form.resetFields();
      setEditingId(null);
      fetchData();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || "Lỗi");
    }
  };

  const handleEdit = async (record) => {
    form.setFieldsValue({
      ...record,
      salePrice: Number(record.salePrice) || 0,
      costPrice: Number(record.costPrice) || 0,
    });
    console.log("form values after set:", form.getFieldsValue());
    try {
      const res = await getProductImages(record.id);

      const fileList = res.map((img, index) => ({
        uid: img.id || index,
        name: "product-image",
        status: "done",
        url: img.imageUrl,
      }));

      setImages(fileList);
    } catch {
      setImages([]);
    }
    setEditingId(record.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    try {
      await apiClient.delete(`/products/${id}`);
      message.success("Đã xóa");
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi xóa");
    }
  };

  const columns = [
    {
      title: "Ảnh",
      key: "image",
      render: (_, record) => (
        <img
          src={record.thumbnail}
          alt={record.name}
          style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 6 }}
        />
      ), width: 100
    },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name", width: 200 },
    { title: "SKU", dataIndex: "sku", key: "sku", width: 100 },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (value, record) => (
        <InputNumber
          min={0}
          defaultValue={value}
          style={{ width: 150 }}
          formatter={(v) =>
            `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫"
          }
          parser={(v) => v.replace(/[^\d]/g, "")}
          onPressEnter={async (e) => {
            const rawValue = e.target.value;
            const newPrice = rawValue.replace(/[^\d]/g, "");
            try {
              Modal.confirm({
                title: "Xác nhận cập nhật giá",
                content: `Bạn có chắc muốn cập nhật giá thành ${newPrice}₫?`,
                okText: "Xác nhận",
                cancelText: "Hủy",
                onOk: async () => {
                  try {
                    await updateProductPrice(record.id, newPrice);
                    message.success("Đã cập nhật giá");
                    fetchData();
                  } catch {
                    message.error("Lỗi cập nhật giá");
                  }
                }
              });
            } catch {
              message.error("Lỗi cập nhật giá");
            }
          }}
        />
      )
    },
    {
      title: "Tồn kho",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      render: (value, record) => (
        <InputNumber
          min={0}
          defaultValue={value}
          style={{ width: 100 }}
          onPressEnter={async (e) => {
            const quantity = e.target.value;
            try {
              Modal.confirm({
                title: "Xác nhận cập nhật tồn kho",
                content: `Bạn có chắc muốn cập nhật tồn kho thành ${quantity}?`,
                okText: "Xác nhận",
                cancelText: "Hủy",
                onOk: async () => {
                  try {
                    await updateProductStock(record.id, quantity);
                    message.success("Đã cập nhật tồn kho");
                    fetchData();
                  } catch {
                    message.error("Lỗi cập nhật tồn kho");
                  }
                }
              });
            } catch {
              message.error("Lỗi cập nhật tồn kho");
            }
          }}
        />
      )
    },
    { title: "Danh mục", dataIndex: "categoryId", key: "categoryId", render: (v) => categories.find(c => c.id === v)?.name || "N/A" },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render: (value, record) => (
        <Switch
          checked={value}
          onChange={async () => {
            try {
              await updateProductStatus(record.id);
              message.success("Cập nhật trạng thái thành công");
              fetchData();
            } catch {
              message.error("Lỗi cập nhật trạng thái");
            }
          }}
        />
      )
    },
    {
      title: "Nổi bật",
      dataIndex: "isFeatured",
      key: "isFeatured",
      render: (value, record) => (
        <Select
          value={value}
          style={{ width: 120 }}
          options={[
            { value: 1, label: "Nổi bật" },
            { value: 0, label: "Bình thường" }
          ]}
          onChange={async (newValue) => {
            try {
              Modal.confirm({
                title: "Xác nhận cập nhật nổi bật",
                content: `Bạn có chắc muốn cập nhật sản phẩm này thành ${newValue === 1 ? "nổi bật" : "bình thường"}?`,
                okText: "Xác nhận",
                cancelText: "Hủy",
                onOk: async () => {
                  try {
                    await updateProductFeatured(record.id);
                    message.success("Đã cập nhật nổi bật");
                    fetchData();
                  } catch {
                    message.error("Lỗi cập nhật nổi bật");
                  }
                }
              });
            } catch {
              message.error("Lỗi cập nhật nổi bật");
            }
          }}
        />
      )
    },
    {
      title: "Giá khuyến mãi",
      dataIndex: "salePrice",
      key: "salePrice",
      render: (value, record) => (
        <InputNumber
          min={0}
          defaultValue={value}
          style={{ width: 150 }}
          formatter={(val) => val ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫" : ""}
          parser={(val) => val ? val.replace(/[^\d]/g, "") : ""}
          onPressEnter={async (e) => {
            const salePrice = e.target.value;
            const newPrice = salePrice.replace(/[^\d]/g, "");
            try {
              Modal.confirm({
                title: "Xác nhận cập nhật giá khuyến mãi",
                content: `Bạn có chắc muốn cập nhật giá khuyến mãi thành ${newPrice}₫?`,
                okText: "Xác nhận",
                cancelText: "Hủy",
                onOk: async () => {
                  try {
                    await updateProductSalePrice(record.id, newPrice);
                    message.success("Đã cập nhật giá khuyến mãi");
                    fetchData();
                  } catch {
                    message.error("Lỗi cập nhật giá khuyến mãi");
                  }
                }
              });
            } catch {
              message.error("Lỗi cập nhật nổi bật");
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
        <h2 style={{ margin: 0 }}>Sản phẩm</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditingId(null); setModalOpen(true); }}>
          Thêm
        </Button>
      </div>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} scroll={{ x: 800 }} bordered />
      <Modal
        title={editingId ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditingId(null); setImages([]); }}
        width={640}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
            <Select placeholder="Chọn danh mục" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="brandId" label="Thương hiệu" rules={[{ required: true }]}>
            <Select placeholder="Chọn thương hiệu" options={brands.map((b) => ({ value: b.id, label: b.name }))} />
          </Form.Item>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}><Input placeholder="Còi Hú Báo Động 245PK" /></Form.Item>
          <Form.Item name="slug" label="Slug"><Input placeholder="18712" /></Form.Item>
          <Form.Item name="sku" label="SKU"><Input placeholder="187613" /></Form.Item>
          <Form.Item name="description" label="Mô tả ngắn"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="longDescription" label="Mô tả dài"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="Ảnh sản phẩm">
            <Upload
              multiple
              listType="picture-card"
              fileList={images}
              beforeUpload={() => false}
              onChange={({ fileList }) => setImages(fileList)}
              onRemove={async (file) => {
                if (file.url) {
                  await RemoveImages(file.uid);
                  setImages((prev) => prev.filter((f) => f.uid !== file.uid));
                } else {
                  setImages((prev) => prev.filter((f) => f.uid !== file.uid));
                }
              }}
            >
              <div>
                <PlusOutlined />
                <div>Upload</div>
              </div>
            </Upload>
          </Form.Item>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Form.Item
              name="price"
              label="Giá bán"
              rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
            >
              <InputNumber
                min={0}
                style={{ width: 200 }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫"
                }
                parser={(value) => value.replace(/[^\d]/g, "")}
              />
            </Form.Item>
            <Form.Item name="salePrice" label="Giá khuyến mãi">
              <InputNumber
                min={0}
                style={{ width: 200 }}
                formatter={(value) =>
                  value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫" : ""
                }
                parser={(value) => value ? value.replace(/[^\d]/g, "") : ""}
              />
            </Form.Item>

            <Form.Item name="costPrice" label="Giá vốn">
              <InputNumber
                min={0}
                style={{ width: 200 }}
                formatter={(value) =>
                  value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫" : ""
                }
                parser={(value) => value ? value.replace(/[^\d]/g, "") : ""}
              />
            </Form.Item>
          </Space>
          <Space>
            <Form.Item name="stockQuantity" label="Tồn kho"><InputNumber min={0} style={{ width: 120 }} /></Form.Item>
            <Form.Item name="weight" label="Khối lượng (kg)"><InputNumber min={0} style={{ width: 120 }} /></Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}

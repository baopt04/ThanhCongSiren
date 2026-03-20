import { useState, useEffect, useMemo } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, message, Typography, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import apiClient from "../../api/client";
import { getAllProductSpecs, createProductSpec, updateProductSpec, deleteSpecs } from "../../services/ProductSpecs";
import { getAllProducts } from "../../services/ProductService";

const { Text } = Typography;

export function ProductSpecsPage() {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

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
      const sortedData = [...res].sort((a, b) => {
        if (a.productId !== b.productId) return a.productId - b.productId;
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
      setData(sortedData);
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi tải dữ liệu");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchData();
  }, []);

  const renderContent = (value, row, index, key) => {
    const obj = {
      children: value,
      props: {},
    };

    if (index > 0 && data[index][key] === data[index - 1][key]) {
      obj.props.rowSpan = 0;
    } else {
      let count = 1;
      for (let i = index + 1; i < data.length; i++) {
        if (data[i][key] === data[index][key]) {
          count++;
        } else {
          break;
        }
      }
      obj.props.rowSpan = count;
    }
    return obj;
  };

  const getProductName = (id) => products.find((p) => p.id === id)?.name || `ID: ${id}`;

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "productId",
      key: "productId",
      width: 250,
      render: (value, row, index) => {
        const obj = renderContent(<Text strong color="blue">{getProductName(value)}</Text>, row, index, "productId");
        return obj;
      },
    },
    {
      title: "Nhóm thông số",
      dataIndex: "groupName",
      key: "groupName",
      width: 180,
      render: (value, row, index) => {
        const uniqueKey = `${row.productId}-${value}`;
        const isSameAsPrev = index > 0 && `${data[index - 1].productId}-${data[index - 1].groupName}` === uniqueKey;

        if (isSameAsPrev) return { props: { rowSpan: 0 } };

        let count = 1;
        for (let i = index + 1; i < data.length; i++) {
          if (`${data[i].productId}-${data[i].groupName}` === uniqueKey) count++;
          else break;
        }
        return {
          children: <Tag color="orange">{value || "Chung"}</Tag>,
          props: { rowSpan: count }
        };
      },
    },
    { title: "Tên thông số", dataIndex: "specName", key: "specName" },
    { title: "Giá trị", dataIndex: "specValue", key: "specValue", render: (val) => <Text code>{val}</Text> },
    { title: "Thứ tự", dataIndex: "displayOrder", key: "displayOrder", width: 80, align: 'center' },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, displayOrder: Number(values.displayOrder) || 0 };

      if (editingId) {
        try {
          Modal.confirm({
            title: "Xác nhận cập nhật thông số",
            content: `Bạn có chắc muốn cập nhật thông số "${payload.specName}" cho sản phẩm "${getProductName(payload.productId)}"?`,
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: async () => {
              try {
                await updateProductSpec(editingId, payload);
                message.success("Cập nhật thành công");
                fetchData();
              } catch (err) {
                message.error(err.response?.data?.message || "Lỗi cập nhật thông số");
              }
            }
          });
        } catch (err) {
          if (err.errorFields) return;
          message.error(err.response?.data?.message || "Lỗi thao tác");
        }

      } else {
        try {
          Modal.confirm({
            title: "Xác nhận thêm thông số",
            content: `Bạn có chắc muốn thêm thông số "${payload.specName}" cho sản phẩm "${getProductName(payload.productId)}"?`,
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: async () => {
              try {
                await createProductSpec(payload);
                message.success("Thêm thành công");
                fetchData();
              } catch (err) {
                message.error(err.response?.data?.message || "Lỗi thêm thông số");
              }
            }
          });
        } catch (err) {
          if (err.errorFields) return;
          message.error(err.response?.data?.message || "Lỗi thao tác");
        }
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      if (!err.errorFields) message.error("Lỗi thao tác");
    }
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingId(record.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa thông số này?",
      onOk: async () => {
        try {
          await deleteSpecs(id);
          message.success("Đã xóa thông số sản phẩm");
          fetchData();
        } catch (err) {
          console.error("ERROR:", err);
          message.error("Lỗi khi xóa");
        }
      }
    });
  };

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <Typography.Title level={3}>Quản lý Thông số Sản phẩm</Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { form.resetFields(); setEditingId(null); setModalOpen(true); }}
        >
          Thêm thông số mới
        </Button>
      </div>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered // Bật border để thấy rõ các ô đã gộp
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title={editingId ? "Cập nhật thông số" : "Thêm thông số mới"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="productId" label="Sản phẩm" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Chọn sản phẩm"
              options={products.map((p) => ({ value: p.id, label: p.name }))}
            />
          </Form.Item>
          <Form.Item name="groupName" label="Nhóm thông số (Ví dụ: Màn hình, Pin...)">
            <Input placeholder="Nhập tên nhóm" />
          </Form.Item>
          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item name="specName" label="Tên thông số" rules={[{ required: true }]}>
              <Input placeholder="Ví dụ: Dung lượng" />
            </Form.Item>
            <Form.Item name="specValue" label="Giá trị" rules={[{ required: true }]}>
              <Input placeholder="Ví dụ: 5000mAh" />
            </Form.Item>
          </Space>
          <Form.Item name="displayOrder" label="Thứ tự hiển thị" initialValue={1}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
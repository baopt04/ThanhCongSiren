import { useState, useEffect } from "react";
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
  TreeSelect
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, DownOutlined, RightOutlined } from "@ant-design/icons";

import apiClient from "../../api/client";
import {
  createCategory,
  updateCategory,
  categoryTree
} from "../../services/CategoryService";

const STATUS_OPTIONS = [
  { value: 1, label: "Hoạt động" },
  { value: 0, label: "Ngưng hoạt động" }
];

export function CategoriesPage() {
  const [data, setData] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const tree = await categoryTree();
      setData(tree ?? []);
      setParents(tree ?? []);
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi tải dữ liệu");
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
      children: n.children ? convertTree(n.children) : []
    }));

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        status: values.status,
        parentId: values.parentId || null
      };

      if (editingId) {
        Modal.confirm({
          title: "Xác nhận sửa danh mục",
          content: "Bạn có chắc muốn sửa danh mục?",
          okText: "Xác nhận",
          cancelText: "Hủy",
          onOk: async () => {
            try {
              await updateCategory(editingId, payload);
              message.success("Sửa thành công");
              fetchData();
            } catch (err) {
              message.error(err.response?.data?.message || "Lỗi sửa");
            }
          }
        });
      } else {
        Modal.confirm({
          title: "Xác nhận thêm danh mục",
          content: "Bạn có chắc muốn thêm danh mục?",
          okText: "Xác nhận",
          cancelText: "Hủy",
          onOk: async () => {
            try {
              await createCategory(payload);
              message.success("Thêm thành công");
              fetchData();
            } catch (err) {
              message.error(err.response?.data?.message || "Lỗi thêm");
            }
          }
        });
      }

      setModalOpen(false);
      form.resetFields();
      setEditingId(null);
    } catch (err) {
      if (err.errorFields) return;
      message.error("Lỗi dữ liệu");
    }
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
      description: record.description,
      status: record.status,
      parentId: record.parentId || undefined
    });

    setEditingId(record.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xóa danh mục?",
      content: "Bạn có chắc muốn xóa danh mục này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await apiClient.delete(`/categories/${id}`);
          message.success("Đã xóa");
          fetchData();
        } catch (err) {
          message.error(err.response?.data?.message || "Lỗi xóa");
        }
      }
    });
  };

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug"
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description"
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v) =>
        v === 1 ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngưng hoạt động</Tag>
        )
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      )
    }
  ];

  return (
    <div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16
        }}
      >
        <h2>Quản lý danh mục</h2>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setEditingId(null);
            setModalOpen(true);
          }}
        >
          Thêm danh mục
        </Button>
      </div>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        expandable={{
          expandIcon: ({ expanded, onExpand, record }) =>
            record.children && record.children.length > 0 ? (
              <span
                onClick={(e) => onExpand(record, e)}
                style={{ marginRight: 8, cursor: "pointer" }}
              >
                {expanded ? <DownOutlined /> : <RightOutlined />}
              </span>
            ) : null
        }}
      />

      <Modal
        title={editingId ? "Sửa danh mục" : "Thêm danh mục"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setEditingId(null);
        }}
      >
        <Form form={form} layout="vertical">

          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true }]}
          >
            <Input placeholder="coi-bao-dong" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            initialValue={1}
            rules={[{ required: true }]}
          >
            <Select options={STATUS_OPTIONS} />
          </Form.Item>

          <Form.Item name="parentId" label="Danh mục cha">
            <TreeSelect
              allowClear
              treeData={convertTree(parents)}
              placeholder="Không có"
              treeDefaultExpandAll
            />
          </Form.Item>

        </Form>
      </Modal>

    </div>
  );
}
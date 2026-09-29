import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Select,
  Space,
  message,
  Tag,
  Tooltip,
  Steps,
  Row,
  Col,
  Divider,
  Alert,
  Popconfirm,
  Badge,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  DollarCircleOutlined,
  CopyOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  FileTextOutlined,
  HistoryOutlined,
  CheckOutlined,
  ShoppingOutlined,
  RollbackOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import {
  getAllBills,
  detailBill,
  changeBillStatus,
  changeBillPayment,
} from "../../services/BillService";
import "./BillsPage.css";

// ─── Status Mapping & Styling ───
const BILL_STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "gold",
    badgeStatus: "warning",
    icon: <ClockCircleOutlined />,
    stepIndex: 0,
    nextAction: {
      target: "CONFIRMED",
      label: "Xác nhận đơn hàng",
      buttonType: "primary",
      icon: <CheckCircleOutlined />,
    },
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "cyan",
    badgeStatus: "processing",
    icon: <CheckCircleOutlined />,
    stepIndex: 1,
    nextAction: {
      target: "SHIPPING",
      label: "Bắt đầu giao hàng",
      buttonType: "primary",
      buttonColor: "#7c3aed",
      icon: <CarOutlined />,
    },
  },
  PROCESSING: {
    label: "Đang đóng gói",
    color: "blue",
    badgeStatus: "processing",
    icon: <ThunderboltOutlined />,
    stepIndex: 1,
    nextAction: {
      target: "SHIPPING",
      label: "Bắt đầu giao hàng",
      buttonType: "primary",
      buttonColor: "#7c3aed",
      icon: <CarOutlined />,
    },
  },
  SHIPPING: {
    label: "Đang giao hàng",
    color: "purple",
    badgeStatus: "processing",
    icon: <CarOutlined />,
    stepIndex: 2,
    nextAction: {
      target: "COMPLETED",
      label: "Giao thành công",
      buttonType: "primary",
      buttonColor: "#16a34a",
      icon: <CheckCircleOutlined />,
    },
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "success",
    badgeStatus: "success",
    icon: <CheckCircleOutlined />,
    stepIndex: 3,
    nextAction: null,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "error",
    badgeStatus: "error",
    icon: <CloseCircleOutlined />,
    stepIndex: -1,
    nextAction: null,
  },
};

const PAYMENT_STATUS_CONFIG = {
  UNPAID: {
    label: "Chưa thanh toán",
    color: "warning",
    icon: <ClockCircleOutlined />,
  },
  PAID: {
    label: "Đã thanh toán",
    color: "success",
    icon: <CheckCircleOutlined />,
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    color: "default",
    icon: <RollbackOutlined />,
  },
};

const PAYMENT_METHOD_CONFIG = {
  COD: { label: "Thanh toán khi nhận hàng (COD)", color: "default" },
  BANK_TRANSFER: { label: "Chuyển khoản ngân hàng", color: "blue" },
  VNPAY: { label: "Ví điện tử VNPAY", color: "cyan" },
  MOMO: { label: "Ví MoMo", color: "magenta" },
};

// ─── Format Utilities ───
const formatCurrency = (amount) => {
  if (amount == null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount));
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};


export function BillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
  });

  // Filters
  const [selectedStatusTab, setSelectedStatusTab] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [currentBillDetail, setCurrentBillDetail] = useState(null);

  // Status Change Dialog State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [pendingStatusTarget, setPendingStatusTarget] = useState(null);
  const [statusNote, setStatusNote] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Cancel Dialog State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelUpdating, setCancelUpdating] = useState(false);

  // Payment Status Dialog State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingPaymentStatus, setPendingPaymentStatus] = useState(null);
  const [paymentUpdating, setPaymentUpdating] = useState(false);

  // ─── Fetch Bills List ───
  const fetchBills = useCallback(
    async (currentPage = 1, pageSize = 10) => {
      setLoading(true);
      try {
        const params = {
          page: currentPage - 1, // Spring Boot is 0-indexed
          size: pageSize,
          sort: "createdAt,desc",
        };

        if (selectedStatusTab && selectedStatusTab !== "ALL") {
          params.status = selectedStatusTab;
        }
        if (paymentStatusFilter) {
          params.paymentStatus = paymentStatusFilter;
        }
        if (searchKeyword && searchKeyword.trim()) {
          params.keyword = searchKeyword.trim();
        }

        const res = await getAllBills(params);
        if (res && res.data && Array.isArray(res.data)) {
          setBills(res.data);
          setPagination({
            page: currentPage,
            size: pageSize,
            total: res.pagination?.totalElements ?? res.data.length,
          });
        } else {
          setBills([]);
          setPagination({ page: 1, size: pageSize, total: 0 });
        }
      } catch (err) {
        console.warn("Backend error fetching bills:", err);
        setBills([]);
        setPagination({ page: 1, size: pageSize, total: 0 });
      } finally {
        setLoading(false);
      }
    },
    [selectedStatusTab, paymentStatusFilter, searchKeyword]
  );

  useEffect(() => {
    fetchBills(pagination.page, pagination.size);
  }, [fetchBills]);

  const displayBills = bills;

  // ─── Status Counts for KPI Cards ───
  const statusCounts = useMemo(() => {
    const counts = {
      ALL: bills.length,
      PENDING: 0,
      CONFIRMED: 0,
      SHIPPING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    bills.forEach((b) => {
      if (counts[b.billStatus] !== undefined) {
        counts[b.billStatus] += 1;
      }
    });
    return counts;
  }, [bills]);

  // ─── Open Detail Modal ───
  const handleViewDetail = async (bill) => {
    // Luôn gán trước thông tin hóa đơn có sẵn để Modal hiển thị đầy đủ ngay lập tức
    setCurrentBillDetail(bill);
    setDetailModalOpen(true);
    setDetailLoading(true);

    try {
      const res = await detailBill(bill.id);
      if (res && res.data) {
        // Cập nhật thông tin chi tiết đầy đủ từ backend
        setCurrentBillDetail({ ...bill, ...res.data });
      }
    } catch (err) {
      console.warn("Lỗi khi tải chi tiết hóa đơn từ máy chủ:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── Handle Advance / Change Status ───
  const openStatusConfirmModal = (targetStatus) => {
    setPendingStatusTarget(targetStatus);
    setStatusNote("");
    setStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!currentBillDetail || !pendingStatusTarget) return;
    setStatusUpdating(true);

    try {
      const res = await changeBillStatus(currentBillDetail.id, {
        status: pendingStatusTarget,
        note: statusNote || undefined,
      });
      if (res?.data) {
        setCurrentBillDetail(res.data);
      }
      message.success(
        `Đã chuyển trạng thái sang: ${BILL_STATUS_CONFIG[pendingStatusTarget]?.label}`
      );
      fetchBills(pagination.page, pagination.size);
      setStatusModalOpen(false);
    } catch (err) {
      console.error("Lỗi khi chuyển trạng thái:", err);
      message.error(err.response?.data?.message || "Lỗi khi cập nhật trạng thái đơn hàng");
    } finally {
      setStatusUpdating(false);
    }
  };

  // ─── Handle Cancel Bill ───
  const openCancelModal = () => {
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!currentBillDetail) return;
    setCancelUpdating(true);

    try {
      const res = await changeBillStatus(currentBillDetail.id, {
        status: "CANCELLED",
        note: cancelReason || "Hủy đơn hàng bởi Quản trị viên",
      });
      if (res?.data) {
        setCurrentBillDetail(res.data);
      }
      message.success("Đã hủy đơn hàng thành công và tự động hoàn trả tồn kho!");
      fetchBills(pagination.page, pagination.size);
      setCancelModalOpen(false);
    } catch (err) {
      console.error("Lỗi khi hủy đơn hàng:", err);
      message.error(err.response?.data?.message || "Lỗi khi thực hiện hủy đơn hàng");
    } finally {
      setCancelUpdating(false);
    }
  };

  // ─── Handle Update Payment Status ───
  const openPaymentModal = (status) => {
    setPendingPaymentStatus(status);
    setPaymentModalOpen(true);
  };

  const handleConfirmPaymentChange = async () => {
    if (!currentBillDetail || !pendingPaymentStatus) return;
    setPaymentUpdating(true);

    try {
      const res = await changeBillPayment(currentBillDetail.id, pendingPaymentStatus);
      if (res?.data) {
        setCurrentBillDetail(res.data);
      }
      message.success(
        `Cập nhật thanh toán thành: ${PAYMENT_STATUS_CONFIG[pendingPaymentStatus]?.label}`
      );
      fetchBills(pagination.page, pagination.size);
      setPaymentModalOpen(false);
    } catch (err) {
      console.error("Lỗi khi cập nhật thanh toán:", err);
      message.error(err.response?.data?.message || "Lỗi khi cập nhật trạng thái thanh toán");
    } finally {
      setPaymentUpdating(false);
    }
  };

  // ─── Copy to Clipboard ───
  const copyBillCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    message.success(`Đã sao chép mã đơn: ${code}`);
  };

  // ─── Table Columns ───
  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 65,
      align: "center",
      render: (_, record, index) => {
        const page = pagination?.page || 1;
        const size = pagination?.size || 10;
        const stt = (page - 1) * size + index + 1;
        const isCancelled = record.billStatus === "CANCELLED";
        return (
          <span
            style={{
              fontWeight: 600,
              color: isCancelled ? "#dc2626" : "#64748b",
              fontSize: 13,
            }}
          >
            {stt}
          </span>
        );
      },
    },
    {
      title: "Mã hóa đơn",
      dataIndex: "billCode",
      key: "billCode",
      width: 155,
      render: (code, record) => {
        const isCancelled = record.billStatus === "CANCELLED";
        return (
          <Tooltip title={isCancelled ? "Đơn hàng đã hủy — Nhấp để xem chi tiết" : "Nhấp để xem chi tiết đơn hàng"}>
            <span
              className={`bill-code-badge ${isCancelled ? "cancelled" : ""}`}
              onClick={() => handleViewDetail(record)}
            >
              #{code}
              {isCancelled && (
                <Tag
                  color="red"
                  style={{
                    margin: 0,
                    padding: "0 5px",
                    fontSize: 10,
                    fontWeight: 700,
                    lineHeight: "16px",
                    borderRadius: 4,
                  }}
                >
                  HỦY
                </Tag>
              )}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 180,
      ellipsis: true,
      render: (_, record) => (
        <div className="customer-cell">
          <div
            className="customer-name"
            style={record.billStatus === "CANCELLED" ? { color: "#991b1b" } : {}}
          >
            {record.shippingName || "—"}
          </div>
          <div className="customer-phone">
            <PhoneOutlined style={{ fontSize: 11 }} />
            {record.shippingPhone || "—"}
            {record.registeredCustomer ? (
              <Tag color="blue" style={{ fontSize: 10, padding: "0 4px", marginLeft: 4 }}>
                Thành viên
              </Tag>
            ) : (
              <Tag color="default" style={{ fontSize: 10, padding: "0 4px", marginLeft: 4 }}>
                Vãng lai
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 155,
      render: (date) => (
        <span style={{ fontSize: 13, color: "#475569" }}>{formatDate(date)}</span>
      ),
    },
    {
      title: "Phương thức TT",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 150,
      render: (method) => {
        const conf = PAYMENT_METHOD_CONFIG[method] || { label: method, color: "default" };
        return (
          <Tag color={conf.color} style={{ fontSize: 11.5, padding: "2px 8px", borderRadius: 4 }}>
            {conf.label}
          </Tag>
        );
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 140,
      render: (status) => {
        const conf = PAYMENT_STATUS_CONFIG[status] || { label: status, color: "default" };
        return (
          <Tag
            color={conf.color}
            icon={conf.icon}
            style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4 }}
          >
            {conf.label}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái đơn",
      dataIndex: "billStatus",
      key: "billStatus",
      width: 160,
      render: (status) => {
        const isCancelled = status === "CANCELLED";
        const conf = BILL_STATUS_CONFIG[status] || { label: status, color: "default" };
        if (isCancelled) {
          return (
            <span className="tag-status-cancelled">
              <CloseCircleOutlined /> ĐÃ HỦY
            </span>
          );
        }
        return (
          <Tag
            color={conf.color}
            icon={conf.icon}
            style={{ fontSize: 12, padding: "3px 8px", borderRadius: 4, fontWeight: 500 }}
          >
            {conf.label}
          </Tag>
        );
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      width: 135,
      align: "right",
      render: (amount, record) => {
        const isCancelled = record.billStatus === "CANCELLED";
        return (
          <span
            className="bill-amount-cell"
            style={isCancelled ? { color: "#dc2626", textDecoration: "line-through" } : {}}
          >
            {formatCurrency(amount)}
          </span>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 110,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          size="small"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetail(record);
          }}
          style={{ borderRadius: 6, fontWeight: 500 }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // ─── Calculate Stepper Status for Detail Modal ───
  const getStepperCurrent = (status) => {
    if (status === "CANCELLED") return -1;
    return BILL_STATUS_CONFIG[status]?.stepIndex ?? 0;
  };

  return (
    <div className="bills-page-container">
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h2>Quản lý hóa đơn & đơn hàng</h2>
          <p>
            Theo dõi, xử lý quy trình đơn hàng, xác nhận thanh toán và quản lý hủy đơn
          </p>
        </div>

        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchBills(pagination.page, pagination.size)}
            loading={loading}
          >
            Tải lại
          </Button>
        </Space>
      </div>

      {/* ── KPI Stat Cards ── */}
      <div className="bills-stat-grid">
        <div
          className={`bills-stat-card stat-all ${selectedStatusTab === "ALL" ? "active" : ""}`}
          onClick={() => setSelectedStatusTab("ALL")}
        >
          <div className="bills-stat-icon">
            <FileTextOutlined />
          </div>
          <div className="bills-stat-info">
            <span className="bills-stat-count">{statusCounts.ALL}</span>
            <span className="bills-stat-label">Tất cả đơn hàng</span>
          </div>
        </div>

        <div
          className={`bills-stat-card stat-pending ${selectedStatusTab === "PENDING" ? "active" : ""}`}
          onClick={() => setSelectedStatusTab("PENDING")}
        >
          <div className="bills-stat-icon">
            <ClockCircleOutlined />
          </div>
          <div className="bills-stat-info">
            <span className="bills-stat-count">{statusCounts.PENDING}</span>
            <span className="bills-stat-label">Chờ xác nhận</span>
          </div>
        </div>

        <div
          className={`bills-stat-card stat-confirmed ${selectedStatusTab === "CONFIRMED" ? "active" : ""}`}
          onClick={() => setSelectedStatusTab("CONFIRMED")}
        >
          <div className="bills-stat-icon">
            <CheckCircleOutlined />
          </div>
          <div className="bills-stat-info">
            <span className="bills-stat-count">{statusCounts.CONFIRMED}</span>
            <span className="bills-stat-label">Đã xác nhận</span>
          </div>
        </div>

        <div
          className={`bills-stat-card stat-shipping ${selectedStatusTab === "SHIPPING" ? "active" : ""}`}
          onClick={() => setSelectedStatusTab("SHIPPING")}
        >
          <div className="bills-stat-icon">
            <CarOutlined />
          </div>
          <div className="bills-stat-info">
            <span className="bills-stat-count">{statusCounts.SHIPPING}</span>
            <span className="bills-stat-label">Đang giao hàng</span>
          </div>
        </div>

        <div
          className={`bills-stat-card stat-completed ${selectedStatusTab === "COMPLETED" ? "active" : ""}`}
          onClick={() => setSelectedStatusTab("COMPLETED")}
        >
          <div className="bills-stat-icon">
            <CheckCircleOutlined />
          </div>
          <div className="bills-stat-info">
            <span className="bills-stat-count">{statusCounts.COMPLETED}</span>
            <span className="bills-stat-label">Hoàn thành</span>
          </div>
        </div>

        <div
          className={`bills-stat-card stat-cancelled ${selectedStatusTab === "CANCELLED" ? "active" : ""}`}
          onClick={() => setSelectedStatusTab("CANCELLED")}
        >
          <div className="bills-stat-icon">
            <CloseCircleOutlined />
          </div>
          <div className="bills-stat-info">
            <span className="bills-stat-count">{statusCounts.CANCELLED}</span>
            <span className="bills-stat-label">Đã hủy</span>
          </div>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="bills-toolbar">
        <div className="bills-toolbar-top">
          <div className="bills-search-group">
            <Input
              placeholder="Tìm theo mã đơn (#HD...), tên khách hàng, số điện thoại..."
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: 340, borderRadius: 8 }}
              allowClear
            />

            <Select
              placeholder="Tất cả trạng thái đơn"
              style={{ width: 175 }}
              value={selectedStatusTab === "ALL" ? null : selectedStatusTab}
              onChange={(val) => setSelectedStatusTab(val || "ALL")}
              allowClear
              options={[
                { value: "PENDING", label: "Chờ xác nhận" },
                { value: "CONFIRMED", label: "Đã xác nhận" },
                { value: "PROCESSING", label: "Đang đóng gói" },
                { value: "SHIPPING", label: "Đang giao hàng" },
                { value: "COMPLETED", label: "Hoàn thành" },
                { value: "CANCELLED", label: "Đã hủy" },
              ]}
            />

            <Select
              placeholder="Trạng thái thanh toán"
              style={{ width: 180 }}
              value={paymentStatusFilter}
              onChange={(val) => setPaymentStatusFilter(val)}
              allowClear
              options={[
                { value: "UNPAID", label: "Chưa thanh toán" },
                { value: "PAID", label: "Đã thanh toán" },
                { value: "REFUNDED", label: "Đã hoàn tiền" },
              ]}
            />

            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchBills(pagination.page, pagination.size)}
              loading={loading}
            >
              Làm mới
            </Button>
          </div>

          <div className="bills-filter-actions">
            {(selectedStatusTab !== "ALL" || paymentStatusFilter || searchKeyword) && (
              <Button
                onClick={() => {
                  setSelectedStatusTab("ALL");
                  setPaymentStatusFilter(null);
                  setSearchKeyword("");
                }}
              >
                Đặt lại bộ lọc
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Table Section ── */}
      <div className="admin-table">
        <Table
          dataSource={displayBills}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          onRow={(record) => ({
            onClick: () => handleViewDetail(record),
            style: { cursor: "pointer" },
          })}
          rowClassName={(record) =>
            record.billStatus === "CANCELLED" ? "bill-row-cancelled" : ""
          }
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trong tổng số ${total} đơn hàng`,
            onChange: (p, s) => {
              setPagination((prev) => ({ ...prev, page: p, size: s }));
              fetchBills(p, s);
            },
          }}
          locale={{
            emptyText: (
              <div style={{ padding: "40px 0", color: "#64748b" }}>
                <ShoppingOutlined style={{ fontSize: 36, color: "#94a3b8", marginBottom: 12 }} />
                <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>
                  Không tìm thấy hóa đơn nào phù hợp
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
                  Hãy thử điều chỉnh lại bộ lọc hoặc tạo đơn hàng mới trên website
                </p>
              </div>
            ),
          }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          DETAIL MODAL (XEM CHI TIẾT HÓA ĐƠN)
          ══════════════════════════════════════════════════════════════════ */}
      <Modal
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        width={940}
        className="bill-detail-modal"
        destroyOnClose
        title={
          currentBillDetail ? (
            <div className="detail-header-wrapper">
              <div className="detail-header-left">
                <span className="detail-header-title">
                  Chi tiết hóa đơn #{currentBillDetail.billCode}
                </span>
                <Tooltip title="Sao chép mã đơn">
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyBillCode(currentBillDetail.billCode)}
                  />
                </Tooltip>
                <span className="detail-header-time">
                  ({formatDate(currentBillDetail.createdAt)})
                </span>
              </div>

              <div className="detail-header-tags">
                <Tag
                  color={BILL_STATUS_CONFIG[currentBillDetail.billStatus]?.color}
                  icon={BILL_STATUS_CONFIG[currentBillDetail.billStatus]?.icon}
                  style={{ fontSize: 13, padding: "3px 10px", fontWeight: 600 }}
                >
                  {BILL_STATUS_CONFIG[currentBillDetail.billStatus]?.label}
                </Tag>
                <Tag
                  color={PAYMENT_STATUS_CONFIG[currentBillDetail.paymentStatus]?.color}
                  icon={PAYMENT_STATUS_CONFIG[currentBillDetail.paymentStatus]?.icon}
                  style={{ fontSize: 13, padding: "3px 10px", fontWeight: 500 }}
                >
                  {PAYMENT_STATUS_CONFIG[currentBillDetail.paymentStatus]?.label}
                </Tag>
              </div>
            </div>
          ) : (
            "Chi tiết hóa đơn"
          )
        }
        footer={
          currentBillDetail ? (
            <div className="detail-footer-actions">
              <div className="footer-left-actions">
                {/* ── Nút Hủy hóa đơn (chỉ cho phép khi chưa hoàn thành và chưa hủy) ── */}
                {currentBillDetail.billStatus !== "COMPLETED" &&
                  currentBillDetail.billStatus !== "CANCELLED" && (
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={openCancelModal}
                    >
                      Hủy hóa đơn
                    </Button>
                  )}

                {/* ── Thao tác Thanh toán ── */}
                {currentBillDetail.paymentStatus === "UNPAID" ? (
                  <Button
                    icon={<DollarCircleOutlined />}
                    style={{ borderColor: "#10b981", color: "#047857" }}
                    onClick={() => openPaymentModal("PAID")}
                  >
                    Xác nhận đã thanh toán
                  </Button>
                ) : currentBillDetail.paymentStatus === "PAID" ? (
                  <Space>
                    <Button
                      size="middle"
                      onClick={() => openPaymentModal("UNPAID")}
                    >
                      Đánh dấu chưa thanh toán
                    </Button>
                    <Button
                      size="middle"
                      onClick={() => openPaymentModal("REFUNDED")}
                    >
                      Hoàn tiền
                    </Button>
                  </Space>
                ) : (
                  <Button
                    size="middle"
                    onClick={() => openPaymentModal("PAID")}
                  >
                    Thanh toán lại
                  </Button>
                )}
              </div>

              <div className="footer-right-actions">
                <Button onClick={() => setDetailModalOpen(false)}>Đóng</Button>

                {/* ── Nút Chuyển trạng thái tiếp theo ── */}
                {BILL_STATUS_CONFIG[currentBillDetail.billStatus]?.nextAction && (
                  <Button
                    type="primary"
                    icon={
                      BILL_STATUS_CONFIG[currentBillDetail.billStatus]?.nextAction.icon
                    }
                    style={{
                      backgroundColor:
                        BILL_STATUS_CONFIG[currentBillDetail.billStatus]?.nextAction
                          .buttonColor,
                      borderColor:
                        BILL_STATUS_CONFIG[currentBillDetail.billStatus]?.nextAction
                          .buttonColor,
                    }}
                    onClick={() =>
                      openStatusConfirmModal(
                        BILL_STATUS_CONFIG[currentBillDetail.billStatus]?.nextAction
                          .target
                      )
                    }
                  >
                    {
                      BILL_STATUS_CONFIG[currentBillDetail.billStatus]?.nextAction
                        .label
                    }
                  </Button>
                )}
              </div>
            </div>
          ) : null
        }
      >
        {currentBillDetail && (
          <div>
            {/* ── Quy trình trạng thái (Stepper) ── */}
            <div className="detail-steps-card">
              {currentBillDetail.billStatus === "CANCELLED" ? (
                <Alert
                  type="error"
                  showIcon
                  icon={<CloseCircleOutlined />}
                  message="Đơn hàng này đã bị hủy"
                  description="Các sản phẩm trong đơn đã được tự động hoàn trả lại vào tồn kho hàng hóa."
                  style={{ borderRadius: 8 }}
                />
              ) : (
                <Steps
                  current={getStepperCurrent(currentBillDetail.billStatus)}
                  size="small"
                  items={[
                    {
                      title: "Chờ xác nhận",
                      description: "Đơn hàng mới",
                      icon: <ClockCircleOutlined />,
                    },
                    {
                      title: "Đã xác nhận",
                      description: "Chuẩn bị hàng",
                      icon: <CheckCircleOutlined />,
                    },
                    {
                      title: "Đang giao hàng",
                      description: "Vận chuyển",
                      icon: <CarOutlined />,
                    },
                    {
                      title: "Hoàn thành",
                      description: "Giao thành công",
                      icon: <CheckCircleOutlined />,
                    },
                  ]}
                />
              )}
            </div>

            {/* ── Thao tác nhanh cho đơn hàng (Action Banner) ── */}
            <div
              className={`detail-action-banner ${
                currentBillDetail.billStatus === "CANCELLED" ? "cancelled" : ""
              }`}
            >
              <div className="detail-action-banner-left">
                <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 13.5 }}>
                  Thao tác đơn hàng:
                </span>
              </div>
              <div className="detail-action-banner-right">
                <Space wrap>
                  {/* Chuyển trạng thái */}
                  {BILL_STATUS_CONFIG[currentBillDetail.billStatus]?.nextAction && (
                    <Button
                      type="primary"
                      icon={
                        BILL_STATUS_CONFIG[currentBillDetail.billStatus]?.nextAction.icon
                      }
                      style={{
                        backgroundColor:
                          BILL_STATUS_CONFIG[currentBillDetail.billStatus]?.nextAction
                            .buttonColor,
                        borderColor:
                          BILL_STATUS_CONFIG[currentBillDetail.billStatus]?.nextAction
                            .buttonColor,
                      }}
                      onClick={() =>
                        openStatusConfirmModal(
                          BILL_STATUS_CONFIG[currentBillDetail.billStatus]?.nextAction
                            .target
                        )
                      }
                    >
                      {
                        BILL_STATUS_CONFIG[currentBillDetail.billStatus]?.nextAction
                          .label
                      }
                    </Button>
                  )}

                  {/* Thanh toán */}
                  {currentBillDetail.paymentStatus === "UNPAID" ? (
                    <Button
                      style={{ borderColor: "#10b981", color: "#047857" }}
                      icon={<DollarCircleOutlined />}
                      onClick={() => openPaymentModal("PAID")}
                    >
                      Xác nhận đã thanh toán
                    </Button>
                  ) : currentBillDetail.paymentStatus === "PAID" ? (
                    <Button onClick={() => openPaymentModal("UNPAID")}>
                      Đánh dấu chưa thanh toán
                    </Button>
                  ) : null}

                  {/* Hủy hóa đơn */}
                  {currentBillDetail.billStatus !== "COMPLETED" &&
                    currentBillDetail.billStatus !== "CANCELLED" && (
                      <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={openCancelModal}
                      >
                        Hủy hóa đơn
                      </Button>
                    )}
                </Space>
              </div>
            </div>

            {/* ── Thông tin nhận hàng & Thông tin thanh toán (2 Columns) ── */}
            <div className="detail-grid">
              {/* Card Trái: Thông tin giao nhận */}
              <div className="detail-card">
                <div className="detail-card-title">
                  <UserOutlined />
                  Thông tin người nhận & Vận chuyển
                </div>

                <div className="detail-card-item">
                  <span className="item-label">Họ và tên:</span>
                  <span className="item-value" style={{ fontWeight: 600 }}>
                    {currentBillDetail.shippingName}
                  </span>
                </div>

                <div className="detail-card-item">
                  <span className="item-label">Số điện thoại:</span>
                  <span className="item-value">
                    <a
                      href={`tel:${currentBillDetail.shippingPhone}`}
                      style={{ color: "#2563eb", display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      <PhoneOutlined /> {currentBillDetail.shippingPhone}
                    </a>
                  </span>
                </div>

                <div className="detail-card-item">
                  <span className="item-label">Địa chỉ giao:</span>
                  <span className="item-value" style={{ maxWidth: "65%" }}>
                    <EnvironmentOutlined style={{ color: "#ef4444", marginRight: 4 }} />
                    {currentBillDetail.shippingAddress}
                  </span>
                </div>

                <div className="detail-card-item">
                  <span className="item-label">Khách hàng:</span>
                  <span className="item-value">
                    {currentBillDetail.customerId ? (
                      <Tag color="blue">Tài khoản thành viên</Tag>
                    ) : (
                      <Tag color="default">Khách mua vãng lai</Tag>
                    )}
                  </span>
                </div>

                {currentBillDetail.note && (
                  <div style={{ marginTop: 4 }}>
                    <span className="item-label" style={{ fontSize: 12 }}>
                      Ghi chú từ khách:
                    </span>
                    <div className="order-note-box">"{currentBillDetail.note}"</div>
                  </div>
                )}
              </div>

              {/* Card Phải: Phương thức & Trạng thái thanh toán */}
              <div className="detail-card">
                <div className="detail-card-title">
                  <CreditCardOutlined />
                  Phương thức & Thanh toán
                </div>

                <div className="detail-card-item">
                  <span className="item-label">Hình thức:</span>
                  <span className="item-value">
                    {PAYMENT_METHOD_CONFIG[currentBillDetail.paymentMethod]?.label ||
                      currentBillDetail.paymentMethod}
                  </span>
                </div>

                <div className="detail-card-item">
                  <span className="item-label">Trạng thái:</span>
                  <span className="item-value">
                    <Tag
                      color={PAYMENT_STATUS_CONFIG[currentBillDetail.paymentStatus]?.color}
                      icon={PAYMENT_STATUS_CONFIG[currentBillDetail.paymentStatus]?.icon}
                      style={{ margin: 0, fontWeight: 600 }}
                    >
                      {PAYMENT_STATUS_CONFIG[currentBillDetail.paymentStatus]?.label}
                    </Tag>
                  </span>
                </div>

                <div className="detail-card-item">
                  <span className="item-label">Thời gian tạo:</span>
                  <span className="item-value">
                    {formatDate(currentBillDetail.createdAt)}
                  </span>
                </div>

                <div className="detail-card-item">
                  <span className="item-label">Trạng thái đơn:</span>
                  <span className="item-value">
                    <Tag
                      color={BILL_STATUS_CONFIG[currentBillDetail.billStatus]?.color}
                      style={{ margin: 0, fontWeight: 600 }}
                    >
                      {BILL_STATUS_CONFIG[currentBillDetail.billStatus]?.label}
                    </Tag>
                  </span>
                </div>

                <Divider style={{ margin: "10px 0" }} />

                {/* Quick Payment update buttons */}
                <div>
                  <div style={{ fontSize: 12.5, color: "#64748b", marginBottom: 6 }}>
                    Thay đổi trạng thái thanh toán nhanh:
                  </div>
                  <Space wrap size={6}>
                    <Button
                      size="small"
                      type={currentBillDetail.paymentStatus === "PAID" ? "primary" : "default"}
                      style={
                        currentBillDetail.paymentStatus === "PAID"
                          ? { background: "#10b981", borderColor: "#10b981" }
                          : {}
                      }
                      onClick={() => openPaymentModal("PAID")}
                    >
                      Đã thanh toán
                    </Button>
                    <Button
                      size="small"
                      type={currentBillDetail.paymentStatus === "UNPAID" ? "primary" : "default"}
                      style={
                        currentBillDetail.paymentStatus === "UNPAID"
                          ? { background: "#f59e0b", borderColor: "#f59e0b" }
                          : {}
                      }
                      onClick={() => openPaymentModal("UNPAID")}
                    >
                      Chưa thanh toán
                    </Button>
                    <Button
                      size="small"
                      type={currentBillDetail.paymentStatus === "REFUNDED" ? "primary" : "default"}
                      onClick={() => openPaymentModal("REFUNDED")}
                    >
                      Hoàn tiền
                    </Button>
                  </Space>
                </div>
              </div>
            </div>

            {/* ── Danh sách sản phẩm trong hóa đơn ── */}
            <div className="detail-items-card">
              <div className="detail-card-title">
                <ShoppingOutlined />
                Danh sách sản phẩm trong đơn ({currentBillDetail.billDetails?.length || 0})
              </div>

              <Table
                dataSource={currentBillDetail.billDetails || []}
                rowKey={(item, idx) => item.productId || idx}
                pagination={false}
                size="small"
                className="detail-items-table"
                columns={[
                  {
                    title: "STT",
                    key: "idx",
                    width: 50,
                    align: "center",
                    render: (_, __, index) => index + 1,
                  },
                  {
                    title: "Sản phẩm",
                    key: "product",
                    render: (_, item) => (
                      <div>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>
                          {item.productName}
                        </div>
                        {item.productSku && (
                          <div style={{ fontSize: 11.5, color: "#64748b" }}>
                            SKU: {item.productSku}
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    title: "Đơn giá",
                    dataIndex: "unitPrice",
                    key: "unitPrice",
                    align: "right",
                    width: 140,
                    render: (price) => formatCurrency(price),
                  },
                  {
                    title: "Số lượng",
                    dataIndex: "quantity",
                    key: "quantity",
                    align: "center",
                    width: 90,
                    render: (qty) => (
                      <span style={{ fontWeight: 600, color: "#1e293b" }}>x{qty}</span>
                    ),
                  },
                  {
                    title: "Thành tiền",
                    dataIndex: "subtotal",
                    key: "subtotal",
                    align: "right",
                    width: 150,
                    render: (sub) => (
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>
                        {formatCurrency(sub)}
                      </span>
                    ),
                  },
                ]}
              />

              {/* Bảng tổng kết tiền */}
              <div className="detail-summary-wrapper">
                <div className="detail-summary-box">
                  <div className="detail-summary-row">
                    <span>Tạm tính tiền hàng:</span>
                    <span>
                      {formatCurrency(
                        currentBillDetail.subtotal ??
                          currentBillDetail.billDetails?.reduce(
                            (acc, i) => acc + (Number(i.subtotal) || 0),
                            0
                          )
                      )}
                    </span>
                  </div>

                  {Number(currentBillDetail.shippingFee) > 0 && (
                    <div className="detail-summary-row">
                      <span>Phí vận chuyển:</span>
                      <span>+{formatCurrency(currentBillDetail.shippingFee)}</span>
                    </div>
                  )}

                  {Number(currentBillDetail.discountAmount) > 0 && (
                    <div className="detail-summary-row" style={{ color: "#ef4444" }}>
                      <span>Giảm giá khuyến mãi:</span>
                      <span>-{formatCurrency(currentBillDetail.discountAmount)}</span>
                    </div>
                  )}

                  <div className="detail-summary-row total-row">
                    <span>Tổng tiền thanh toán:</span>
                    <span className="total-amount">
                      {formatCurrency(currentBillDetail.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Lịch sử cập nhật trạng thái đơn hàng (Timeline) ── */}
            {currentBillDetail.histories && currentBillDetail.histories.length > 0 && (
              <div className="detail-histories-card">
                <div className="detail-card-title">
                  <HistoryOutlined />
                  Lịch sử cập nhật trạng thái
                </div>

                <div style={{ marginTop: 14 }}>
                  {currentBillDetail.histories.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 12,
                        paddingBottom: 12,
                        marginBottom: 12,
                        borderBottom:
                          i === currentBillDetail.histories.length - 1
                            ? "none"
                            : "1px dashed #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#2563eb",
                          marginTop: 6,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 13.5 }}>
                            {h.oldStatus ? (
                              <>
                                <Tag color={BILL_STATUS_CONFIG[h.oldStatus]?.color}>
                                  {BILL_STATUS_CONFIG[h.oldStatus]?.label || h.oldStatus}
                                </Tag>
                                →{" "}
                              </>
                            ) : null}
                            <Tag color={BILL_STATUS_CONFIG[h.newStatus]?.color}>
                              {BILL_STATUS_CONFIG[h.newStatus]?.label || h.newStatus}
                            </Tag>
                          </span>
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>
                            {formatDate(h.createdAt)}
                          </span>
                        </div>
                        {h.note && (
                          <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
                            {h.note}
                          </div>
                        )}
                        {h.changedBy && (
                          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>
                            Người thực hiện: {h.changedBy}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════
          STATUS TRANSITION CONFIRMATION MODAL
          ══════════════════════════════════════════════════════════════════ */}
      <Modal
        open={statusModalOpen}
        onCancel={() => setStatusModalOpen(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircleOutlined style={{ color: "#2563eb" }} />
            <span>Xác nhận chuyển trạng thái đơn hàng</span>
          </div>
        }
        okText="Xác nhận chuyển"
        cancelText="Đóng"
        confirmLoading={statusUpdating}
        onOk={handleConfirmStatusChange}
      >
        <div style={{ padding: "10px 0" }}>
          <p style={{ fontSize: 14 }}>
            Bạn đang chuyển trạng thái đơn hàng <strong>#{currentBillDetail?.billCode}</strong>{" "}
            từ{" "}
            <Tag color={BILL_STATUS_CONFIG[currentBillDetail?.billStatus]?.color}>
              {BILL_STATUS_CONFIG[currentBillDetail?.billStatus]?.label}
            </Tag>{" "}
            sang{" "}
            <Tag color={BILL_STATUS_CONFIG[pendingStatusTarget]?.color}>
              {BILL_STATUS_CONFIG[pendingStatusTarget]?.label}
            </Tag>
          </p>

          {pendingStatusTarget === "COMPLETED" &&
            currentBillDetail?.paymentMethod === "COD" && (
              <Alert
                type="info"
                showIcon
                message="Đơn hàng COD giao thành công"
                description="Hệ thống sẽ tự động cập nhật trạng thái thanh toán thành ĐÃ THANH TOÁN."
                style={{ marginBottom: 14 }}
              />
            )}

          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#475569", display: "block", marginBottom: 6 }}>
              Ghi chú chuyển trạng thái (tùy chọn):
            </label>
            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú (VD: Đã đóng gói xong và bàn giao cho bưu tá...)"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════
          CANCEL ORDER CONFIRMATION MODAL
          ══════════════════════════════════════════════════════════════════ */}
      <Modal
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#ef4444" }}>
            <ExclamationCircleOutlined />
            <span>Xác nhận hủy hóa đơn #{currentBillDetail?.billCode}</span>
          </div>
        }
        okText="Xác nhận hủy hóa đơn"
        okButtonProps={{ danger: true }}
        cancelText="Không hủy"
        confirmLoading={cancelUpdating}
        onOk={handleConfirmCancel}
      >
        <div style={{ padding: "10px 0" }}>
          <Alert
            type="warning"
            showIcon
            message="Lưu ý khi hủy hóa đơn"
            description="Thao tác hủy hóa đơn không thể hoàn tác. Toàn bộ số lượng sản phẩm trong đơn sẽ tự động được cộng hoàn trả lại vào tồn kho hàng hóa."
            style={{ marginBottom: 16 }}
          />

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#475569", display: "block", marginBottom: 6 }}>
              Lý do hủy đơn hàng (Ghi chú):
            </label>
            <Input.TextArea
              rows={3}
              placeholder="VD: Khách yêu cầu hủy, không liên lạc được khách, sản phẩm lỗi kỹ thuật..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════
          PAYMENT STATUS CHANGE CONFIRMATION MODAL
          ══════════════════════════════════════════════════════════════════ */}
      <Modal
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <DollarCircleOutlined style={{ color: "#10b981" }} />
            <span>Cập nhật trạng thái thanh toán</span>
          </div>
        }
        okText="Cập nhật"
        cancelText="Đóng"
        confirmLoading={paymentUpdating}
        onOk={handleConfirmPaymentChange}
      >
        <div style={{ padding: "10px 0" }}>
          <p style={{ fontSize: 14 }}>
            Xác nhận chuyển trạng thái thanh toán đơn hàng{" "}
            <strong>#{currentBillDetail?.billCode}</strong> thành:
          </p>

          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <Tag
              color={PAYMENT_STATUS_CONFIG[pendingPaymentStatus]?.color}
              icon={PAYMENT_STATUS_CONFIG[pendingPaymentStatus]?.icon}
              style={{ fontSize: 15, padding: "6px 16px", borderRadius: 6, fontWeight: 600 }}
            >
              {PAYMENT_STATUS_CONFIG[pendingPaymentStatus]?.label}
            </Tag>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export default BillsPage;

import { useState, useEffect } from "react";
import { Modal, message } from "antd";
import {
  SendOutlined,
  LoadingOutlined,
  RedoOutlined,
  CheckOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { notificationTelegramQuote } from "../../../../services/customer/CustomerProductService";
import { getCustomerUser } from "../../../../utils/auth";
import "./QuoteModal.css";

const PROJECT_OPTIONS = [
  { value: "Thủy điện / Hồ chứa nước xả lũ", label: "Thủy điện / Hồ chứa nước xả lũ" },
  { value: "Phòng thủ quân sự / Quốc phòng", label: "Phòng thủ quân sự / Quốc phòng" },
  { value: "Nhà máy / Khu công nghiệp / Mỏ", label: "Nhà máy / Khu công nghiệp / Mỏ khai thác" },
  { value: "PCCC & Cứu hộ cứu nạn", label: "Hệ thống PCCC & Cứu hộ cứu nạn" },
  { value: "Báo giờ nhà xưởng / Trường học", label: "Báo giờ nhà xưởng / Trường học" },
  { value: "custom", label: "✍️ Loại công trình khác (Nhập thủ công...)" },
];

export function QuoteModal({ isOpen, onClose, product, quantity = 1 }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    numberPhone: "",
    note: "",
  });

  const [selectedProject, setSelectedProject] = useState("Thủy điện / Hồ chứa nước xả lũ");
  const [customProject, setCustomProject] = useState("");
  const [errors, setErrors] = useState({});

  // Tự động điền thông tin khách hàng và sản phẩm hiện tại vào form
  useEffect(() => {
    if (isOpen) {
      const customer = getCustomerUser();
      const productInfo = product?.name
        ? `Báo giá sản phẩm: ${product.name}${product.code ? ` (Mã: ${product.code})` : ""} - Số lượng: ${quantity || 1}`
        : "";

      setFormData({
        name: customer?.fullName || customer?.name || "",
        numberPhone: customer?.phoneNumber || customer?.phone || "",
        note: productInfo,
      });
      setSelectedProject("Thủy điện / Hồ chứa nước xả lũ");
      setCustomProject("");
      setErrors({});
      setSubmitted(false);
      setLoading(false);
    }
  }, [isOpen, product, quantity]);

  // Validate form fields
  const validate = () => {
    const newErrors = {};

    // Validate Họ tên / Đơn vị
    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ và tên hoặc tên đơn vị.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Họ tên / Đơn vị quá ngắn (tối thiểu 2 ký tự).";
    }

    // Validate Số điện thoại VN
    const cleanPhone = formData.numberPhone.replace(/[\s.-]/g, "");
    const phoneRegex = /^(0|\+84)[1-9][0-9]{8,9}$/;
    if (!cleanPhone) {
      newErrors.numberPhone = "Vui lòng nhập số điện thoại hoặc Zalo liên hệ.";
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.numberPhone = "Số điện thoại không hợp lệ (VD: 0865130088 hoặc 0364862148).";
    }

    // Validate Loại dự án
    if (selectedProject === "custom") {
      if (!customProject.trim()) {
        newErrors.project = "Vui lòng nhập loại dự án / công trình cụ thể của bạn.";
      }
    } else if (!selectedProject) {
      newErrors.project = "Vui lòng chọn loại dự án / công trình.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      message.warning("Vui lòng kiểm tra và điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    const finalProject = selectedProject === "custom" ? customProject.trim() : selectedProject;
    const cleanPhone = formData.numberPhone.replace(/[\s.-]/g, "");

    const payload = {
      name: formData.name.trim(),
      numberPhone: cleanPhone,
      project: finalProject,
      note: formData.note.trim(),
    };

    Modal.confirm({
      title: "Xác nhận gửi yêu cầu báo giá dự án",
      icon: <ExclamationCircleOutlined style={{ color: "#b91c1c" }} />,
      centered: true,
      okText: "Xác nhận gửi ngay",
      cancelText: "Kiểm tra lại",
      okButtonProps: {
        style: { background: "#b91c1c", borderColor: "#b91c1c" },
      },
      content: (
        <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.8 }}>
          <p style={{ marginBottom: 10, color: "#475569" }}>
            Quý khách vui lòng xác nhận thông tin gửi đến bộ phận kinh doanh & kỹ thuật:
          </p>
          <div
            style={{
              background: "#f8fafc",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
            }}
          >
            <div>
              <strong style={{ color: "#334155" }}>👤 Họ tên / Đơn vị:</strong>{" "}
              <span style={{ color: "#0f172a", fontWeight: 600 }}>{payload.name}</span>
            </div>
            <div>
              <strong style={{ color: "#334155" }}>📞 SĐT / Zalo:</strong>{" "}
              <span style={{ color: "#0f172a", fontWeight: 600 }}>{payload.numberPhone}</span>
            </div>
            <div>
              <strong style={{ color: "#334155" }}>🏗️ Loại công trình:</strong>{" "}
              <span style={{ color: "#b91c1c", fontWeight: 600 }}>{payload.project}</span>
            </div>
            {payload.note && (
              <div>
                <strong style={{ color: "#334155" }}>📝 Yêu cầu báo giá:</strong>{" "}
                <span style={{ color: "#475569" }}>{payload.note}</span>
              </div>
            )}
          </div>
        </div>
      ),
      async onOk() {
        setLoading(true);
        try {
          await notificationTelegramQuote(payload);
          message.success("Đã gửi yêu cầu báo giá thành công! Kỹ thuật viên sẽ liên hệ Quý khách.");
          setSubmitted(true);
        } catch (err) {
          console.error("Lỗi gửi báo giá:", err);
          message.error(
            err.response?.data?.message ||
              "Không thể gửi yêu cầu báo giá lúc này. Quý khách vui lòng thử lại hoặc gọi Hotline 0865.130.088!"
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleReset = () => {
    setSubmitted(false);
    const productInfo = product?.name
      ? `Báo giá sản phẩm: ${product.name}${product.code ? ` (Mã: ${product.code})` : ""} - Số lượng: ${quantity || 1}`
      : "";
    setFormData((prev) => ({ ...prev, note: productInfo }));
  };

  // Lấy ảnh đại diện của sản phẩm
  const productImage =
    product?.images?.find((img) => img.isPrimary === 1 || img.isPrimary === true)?.imageUrl ||
    product?.images?.[0]?.imageUrl ||
    product?.image?.[0]?.imageUrl ||
    "https://cdn0344.cdn4s.com/media/2022/coi%20bao%20dong/jdw245pk/coi-hu-bao-xa-lu-lap-dat-tai-nha-dieu-hanh-thuy-dien-sapa.jpg";

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
      className="tc-quote-modal"
      destroyOnClose
    >
      {/* Header */}
      <div className="tc-qm-header">
        <div className="tc-qm-tag">
          <SafetyCertificateOutlined /> BÁO GIÁ DỰ ÁN TRỰC TIẾP
        </div>
        <h3 className="tc-qm-title">NHẬN BÁO GIÁ DỰ ÁN NHANH</h3>
        <p className="tc-qm-subtitle">
          Cung cấp hồ sơ CO/CQ gốc, bản vẽ đấu nối và chính sách chiết khấu tốt nhất từ Thành Công Việt Nam
        </p>
      </div>

      <div className="tc-qm-body">
        {/* Product Preview Card */}
        {product && (
          <div className="tc-qm-product-box">
            <img src={productImage} alt={product.name} className="tc-qm-product-img" loading="lazy" decoding="async" />
            <div className="tc-qm-product-info">
              <h4 className="tc-qm-product-name" title={product.name}>
                {product.name}
              </h4>
              <div className="tc-qm-product-meta">
                {product.code && <span>Mã: <strong>{product.code}</strong></span>}
                {product.categoryName && <span>Danh mục: {product.categoryName}</span>}
                <span>Số lượng: <strong>{quantity}</strong></span>
              </div>
            </div>
          </div>
        )}

        {submitted ? (
          <div className="tc-qm-success">
            <div className="tc-qm-success-icon">
              <CheckOutlined />
            </div>
            <h4>Đã gửi yêu cầu thành công!</h4>
            <p>
              Chuyên viên kỹ thuật Thành Công Việt Nam sẽ gọi điện tư vấn và gửi báo giá qua Zalo/Email cho Quý khách trong vòng 15 phút.
            </p>
            <div className="tc-qm-success-actions">
              <button type="button" onClick={onClose} className="tc-qm-btn-close">
                Đóng cửa sổ
              </button>
              <button type="button" onClick={handleReset} className="tc-qm-btn-reset">
                <RedoOutlined /> Gửi thêm yêu cầu khác
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="tc-qm-form" noValidate>
            {/* Họ và tên */}
            <div className="tc-qm-group">
              <label>
                Họ và tên / Tên đơn vị <span className="tc-required">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Ban QLDA Thủy Điện Sapa / Công ty CP Xây Dựng..."
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <span className="tc-qm-error">{errors.name}</span>}
            </div>

            {/* Số điện thoại */}
            <div className="tc-qm-group">
              <label>
                Số điện thoại / Zalo <span className="tc-required">*</span>
              </label>
              <input
                type="tel"
                placeholder="VD: 0865 130 088 hoặc 0364 862 148"
                value={formData.numberPhone}
                onChange={(e) => {
                  setFormData({ ...formData, numberPhone: e.target.value });
                  if (errors.numberPhone) setErrors((prev) => ({ ...prev, numberPhone: "" }));
                }}
                className={errors.numberPhone ? "input-error" : ""}
              />
              {errors.numberPhone && <span className="tc-qm-error">{errors.numberPhone}</span>}
            </div>

            {/* Loại dự án */}
            <div className="tc-qm-group">
              <label>
                Loại dự án / Công trình <span className="tc-required">*</span>
              </label>
              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  if (errors.project) setErrors((prev) => ({ ...prev, project: "" }));
                }}
              >
                {PROJECT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nhập loại dự án thủ công nếu chọn "custom" */}
            {selectedProject === "custom" && (
              <div className="tc-qm-group tc-qm-custom-project">
                <label>
                  Nhập loại công trình / dự án cụ thể <span className="tc-required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Bến cảng, Trại giam, Trang trại năng lượng..."
                  value={customProject}
                  onChange={(e) => {
                    setCustomProject(e.target.value);
                    if (errors.project) setErrors((prev) => ({ ...prev, project: "" }));
                  }}
                  className={errors.project ? "input-error" : ""}
                  autoFocus
                />
                {errors.project && <span className="tc-qm-error">{errors.project}</span>}
              </div>
            )}

            {/* Ghi chú yêu cầu */}
            <div className="tc-qm-group">
              <label>Ghi chú yêu cầu báo giá</label>
              <textarea
                rows="3"
                placeholder="VD: Cần kèm 1 tủ GSM điều khiển từ xa, tư vấn lắp đặt tại Lào Cai..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" className="tc-qm-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <LoadingOutlined /> ĐANG GỬI THÔNG TIN...
                </>
              ) : (
                <>
                  <SendOutlined /> GỬI YÊU CẦU BÁO GIÁ
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}

export default QuoteModal;

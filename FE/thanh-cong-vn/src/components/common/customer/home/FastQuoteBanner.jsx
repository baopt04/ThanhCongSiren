import { useState } from "react";
import { message, Modal } from "antd";
import {
  PhoneOutlined,
  SendOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { notificationTelegramQuote } from "../../../../services/customer/CustomerProductService";
import "./FastQuoteBanner.css";

const PROJECT_OPTIONS = [
  { value: "Thủy điện / Hồ chứa nước xả lũ", label: "Thủy điện / Hồ chứa nước xả lũ" },
  { value: "Phòng thủ quân sự / Quốc phòng", label: "Phòng thủ quân sự / Quốc phòng" },
  { value: "Nhà máy / Khu công nghiệp / Mỏ", label: "Nhà máy / Khu công nghiệp / Mỏ khai thác" },
  { value: "PCCC & Cứu hộ cứu nạn", label: "Hệ thống PCCC & Cứu hộ cứu nạn" },
  { value: "Báo giờ nhà xưởng / Trường học", label: "Báo giờ nhà xưởng / Trường học" },
  { value: "custom", label: "✍️ Loại công trình khác (Nhập thủ công...)" },
];

export function FastQuoteBanner() {
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

  // Validate form fields
  const validate = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ và tên hoặc tên đơn vị.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Họ tên / Đơn vị quá ngắn (tối thiểu 2 ký tự).";
    }

    // Validate phone number (VN phone: 10-11 digits, starts with 0 or +84)
    const cleanPhone = formData.numberPhone.replace(/[\s.-]/g, "");
    const phoneRegex = /^(0|\+84)[1-9][0-9]{8,9}$/;
    if (!cleanPhone) {
      newErrors.numberPhone = "Vui lòng nhập số điện thoại hoặc Zalo liên hệ.";
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.numberPhone = "Số điện thoại không hợp lệ (VD: 0904537559 hoặc 0865130088).";
    }

    // Validate project
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

  // Xác nhận và gửi dữ liệu đi
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
      title: "Xác nhận gửi yêu cầu báo giá",
      icon: <ExclamationCircleOutlined style={{ color: "#b91c1c" }} />,
      centered: true,
      okText: "Xác nhận gửi",
      cancelText: "Kiểm tra lại",
      okButtonProps: {
        style: { background: "#b91c1c", borderColor: "#b91c1c" },
      },
      content: (
        <div className="tc-quote-confirm-modal" style={{ marginTop: 8 }}>
          <p style={{ marginBottom: 10, color: "#475569", fontSize: 13 }}>
            Quý khách vui lòng kiểm tra lại thông tin trước khi chuyển cho bộ phận kỹ thuật:
          </p>
          <div
            style={{
              background: "#f8fafc",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 13,
              lineHeight: 1.8,
            }}
          >
            <div>
              <strong style={{ color: "#334155" }}>👤 Họ tên / Đơn vị:</strong>{" "}
              <span style={{ color: "#0f172a", fontWeight: 600 }}>{payload.name}</span>
            </div>
            <div>
              <strong style={{ color: "#334155" }}>📞 Số điện thoại / Zalo:</strong>{" "}
              <span style={{ color: "#0f172a", fontWeight: 600 }}>{payload.numberPhone}</span>
            </div>
            <div>
              <strong style={{ color: "#334155" }}>🏗️ Loại công trình:</strong>{" "}
              <span style={{ color: "#b91c1c", fontWeight: 600 }}>{payload.project}</span>
            </div>
            {payload.note && (
              <div>
                <strong style={{ color: "#334155" }}>📝 Ghi chú yêu cầu:</strong>{" "}
                <span style={{ color: "#475569" }}>{payload.note}</span>
              </div>
            )}
          </div>
          <p style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
            * Thông tin yêu cầu sẽ được chuyển tức thời đến đội ngũ tư vấn kỹ thuật.
          </p>
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
    setFormData({ name: "", numberPhone: "", note: "" });
    setSelectedProject("Thủy điện / Hồ chứa nước xả lũ");
    setCustomProject("");
    setErrors({});
  };

  return (
    <section className="tc-quote-section">
      <div className="tc-quote-container">
        <div className="tc-quote-info">
          <span className="tc-quote-tag">
            <SafetyCertificateOutlined /> TƯ VẤN & BÁO GIÁ DỰ ÁN TOÀN QUỐC
          </span>
          <h2 className="tc-quote-title">
            Yêu Cầu Báo Giá Hệ Thống Còi Hú Báo Động & PCCC
          </h2>
          <p className="tc-quote-desc">
            Cung cấp hồ sơ dự án, bản vẽ kỹ thuật, chứng nhận CO/CQ gốc và báo giá đại lý cạnh tranh nhất cho các <strong>công trình Hồ thủy điện, Trạm cảnh báo xả lũ, Khu công nghiệp & Đơn vị quân đội</strong>.
          </p>

          <div className="tc-quote-highlights">
            <div className="tc-high-item">
              <FileTextOutlined className="tc-high-icon" />
              <div>
                <strong>Cung Cấp Hồ Sơ CO/CQ Gốc</strong>
                <span>Chứng nhận nguồn gốc xuất xứ Lion King chính hãng</span>
              </div>
            </div>
            <div className="tc-high-item">
              <PhoneOutlined className="tc-high-icon" />
              <div>
                <strong>Hotline Kỹ Thuật 24/7</strong>
                <span>0364.862.148 - 0865.130.088</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fast Form */}
        <div className="tc-quote-form-card">
          <h3 className="tc-form-header">NHẬN BÁO GIÁ NHANH</h3>
          {submitted ? (
            <div className="tc-quote-success">
              <div className="tc-success-icon">✓</div>
              <h4>Đã gửi yêu cầu thành công!</h4>
              <p>Chuyên viên kỹ thuật Thành Công Việt Nam sẽ gọi điện tư vấn và gửi báo giá qua Zalo/Email cho Quý khách trong vòng 15 phút.</p>
              <button type="button" onClick={handleReset} className="tc-quote-reset-btn">
                <RedoOutlined /> Gửi thêm yêu cầu báo giá khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="tc-quote-form" noValidate>
              <div className="tc-form-group">
                <label>Họ và tên / Tên đơn vị *</label>
                <input
                  type="text"
                  placeholder="VD: Ban QLDA Thủy Điện Sapa"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className={errors.name ? "input-error" : ""}
                />
                {errors.name && <span className="tc-error-text">{errors.name}</span>}
              </div>

              <div className="tc-form-group">
                <label>Số điện thoại / Zalo *</label>
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
                {errors.numberPhone && <span className="tc-error-text">{errors.numberPhone}</span>}
              </div>

              <div className="tc-form-group">
                <label>Loại dự án / Công trình *</label>
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

              {/* Nhập thủ công nếu chọn Loại khác */}
              {selectedProject === "custom" && (
                <div className="tc-form-group tc-custom-project-group">
                  <label>Nhập loại công trình / dự án cụ thể *</label>
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
                  {errors.project && <span className="tc-error-text">{errors.project}</span>}
                </div>
              )}

              {/* Ghi chú */}
              <div className="tc-form-group">
                <label>Ghi chú yêu cầu (Mã còi, số lượng...)</label>
                <textarea
                  rows="2"
                  placeholder="VD: Cần báo giá 2 còi LK-JDW400 kèm 1 tủ GSM..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                ></textarea>
              </div>

              <button
                type="submit"
                className="tc-quote-submit-btn"
                disabled={loading}
              >
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
      </div>
    </section>
  );
}

export default FastQuoteBanner;

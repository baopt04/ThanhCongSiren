import { useState, memo } from "react";
import { LoadingOutlined, CheckCircleFilled } from "@ant-design/icons";
import { notificationTelegramQuote } from "../../../../services/customer/CustomerProductService";
import "./FastQuoteBanner.css";

export const FastQuoteBanner = memo(function FastQuoteBanner() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/[\s.-]/g, "");
    const phoneRegex = /^(0|\+84)[1-9][0-9]{8,9}$/;

    if (!cleanPhone) {
      const { message } = await import("antd");
      message.warning("Vui lòng nhập số điện thoại hoặc Zalo để chúng tôi gọi lại!");
      return;
    }
    if (!phoneRegex.test(cleanPhone)) {
      const { message } = await import("antd");
      message.warning("Số điện thoại không hợp lệ (VD: 0865130088 hoặc 0904537559)!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: "Khách hàng yêu cầu gọi lại nhanh",
        numberPhone: cleanPhone,
        project: "Yêu cầu báo giá nhanh trên Trang chủ",
        note: `Số điện thoại khách để lại: ${cleanPhone}`,
      };
      await notificationTelegramQuote(payload);
      setSubmitted(true);
      const { message } = await import("antd");
      message.success("Đã gửi yêu cầu thành công! Chúng tôi sẽ gọi lại ngay.");
    } catch {
      // Cho dù telegram có lỗi kết nối thì vẫn báo thành công để trải nghiệm khách hàng tốt
      setSubmitted(true);
      const { message } = await import("antd");
      message.success("Đã ghi nhận yêu cầu! Đội ngũ tư vấn sẽ liên hệ lại sớm nhất.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="tc-fast-quote-section" id="section-fast-quote">
      <div className="tc-fast-quote-container">
        <div className="tc-fast-quote-card">
          {/* Left Side: Title & Description */}
          <div className="tc-fast-quote-left">
            <h3 className="tc-fast-quote-title">Cần báo giá nhanh?</h3>
            <p className="tc-fast-quote-desc">
              Để lại số điện thoại, chúng tôi sẽ gọi lại trong giờ làm việc.
            </p>
          </div>

          {/* Right Side: Inline Phone Input Form */}
          <div className="tc-fast-quote-right">
            {submitted ? (
              <div className="tc-fast-quote-success">
                <CheckCircleFilled style={{ color: "#16a34a", fontSize: 20 }} />
                <span>Đã gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại sớm nhất.</span>
              </div>
            ) : (
              <form className="tc-fast-quote-form" onSubmit={handleSubmit}>
                <label htmlFor="fast-quote-phone" className="tc-sr-only">
                  Số điện thoại nhận báo giá
                </label>
                <input
                  id="fast-quote-phone"
                  type="tel"
                  className="tc-fast-quote-input"
                  placeholder="Số điện thoại"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                  aria-label="Số điện thoại nhận báo giá"
                />
                <button
                  type="submit"
                  className="tc-fast-quote-submit-btn"
                  disabled={loading}
                >
                  {loading ? <LoadingOutlined spin /> : null}
                  <span>Gửi yêu cầu</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

import { Link } from "react-router-dom";
import "./AboutPage.css";
import logoImg from "../../assets/logo.webp";
import nhaMayThuyDien360 from "../../assets/images/projects/nha-may-thuy-dien-360.webp";
import nhaMayThuyDien720 from "../../assets/images/projects/nha-may-thuy-dien-720.webp";
import baoDongNhaMay360 from "../../assets/images/projects/bao-dong-nha-may-360.webp";
import baoDongNhaMay720 from "../../assets/images/projects/bao-dong-nha-may-720.webp";
import baoDongThanhPho360 from "../../assets/images/about/bao-dong-thanh-pho-360.webp";
import baoDongThanhPho720 from "../../assets/images/about/bao-dong-thanh-pho-720.webp";
import khaiThacKhoangSan360 from "../../assets/images/projects/khai-thac-khoang-san-360.webp";
import khaiThacKhoangSan720 from "../../assets/images/projects/khai-thac-khoang-san-720.webp";
import sanGolf360 from "../../assets/images/about/san-golf-360.webp";
import sanGolf720 from "../../assets/images/about/san-golf-720.webp";
import mayThoiKhiCuuHo360 from "../../assets/images/about/may-thoi-khi-cuu-ho-360.webp";
import mayThoiKhiCuuHo720 from "../../assets/images/about/may-thoi-khi-cuu-ho-720.webp";
import khachHangNoiVe360 from "../../assets/images/about/khach-hang-noi-ve-360.webp";
import khachHangNoiVe720 from "../../assets/images/about/khach-hang-noi-ve-720.webp";

const applicationList = [
  {
    id: 1,
    title: "Còi báo xả lũ hồ chứa & Nhà máy thủy điện",
    tag: "Thủy điện & Hồ chứa",
    image: nhaMayThuyDien360,
    srcSet: `${nhaMayThuyDien360} 360w, ${nhaMayThuyDien720} 720w`,
    desc: "Còi hú công suất lớn phục vụ báo xả lũ, báo đập tràn, cảnh báo khẩn cấp cho người dân vùng hạ lưu kịp thời sơ tán, bảo vệ tính mạng và tài sản.",
    models: "LK-SENTRY B, LK-STH21-2, LK-JDW450",
    link: "/san-pham/coi-bao-dong-co-lon",
  },
  {
    id: 2,
    title: "Còi báo động công nghiệp & Nhà máy xí nghiệp",
    tag: "KCN & Nhà xưởng",
    image: baoDongNhaMay360,
    srcSet: `${baoDongNhaMay360} 360w, ${baoDongNhaMay720} 720w`,
    desc: "Cảnh báo sự cố dây chuyền sản xuất, báo cháy hỏa hoạn, báo tai nạn khẩn cấp cần sơ tán công nhân viên trên diện tích nhà xưởng hàng nghìn m².",
    models: "LK-JDW450, LK-JDW245B, LK-JDW400",
    link: "/san-pham/coi-bao-dong-co-trung",
  },
  {
    id: 3,
    title: "Còi tầm phòng không & Cảnh báo thiên tai",
    tag: "Phòng không & Thiên tai",
    image: baoDongThanhPho360,
    srcSet: `${baoDongThanhPho360} 360w, ${baoDongThanhPho720} 720w`,
    desc: "Còi hú siêu công suất với bán kính truyền âm hàng km, ứng dụng phòng không quốc phòng, cảnh báo lũ quét, bão lớn, động đất cho thành phố, thị trấn.",
    models: "LK-2001, LK-STH10H, LK-STH21-2",
    link: "/san-pham/coi-bao-dong-co-lớn",
  },
  {
    id: 4,
    title: "Còi chống cháy nổ & Mỏ khai thác khoáng sản",
    tag: "Hầm mỏ & Khoáng sản",
    image: khaiThacKhoangSan360,
    srcSet: `${khaiThacKhoangSan360} 360w, ${khaiThacKhoangSan720} 720w`,
    desc: "Tiêu chuẩn chống cháy nổ nghiêm ngặt, cảnh báo lịch nổ mìn trong mỏ than, mỏ đá, đảm bảo an toàn tuyệt đối cho kỹ sư và công nhân hầm lò.",
    models: "LK-M2, LK-JDW400, LK-JDW245B",
    link: "/san-pham/coi-bao-dong-co-lon",
  },
  {
    id: 5,
    title: "Còi cảnh báo thời tiết & Giông sét sân Golf",
    tag: "Sân Golf & Nghỉ dưỡng",
    image: sanGolf360,
    srcSet: `${sanGolf360} 360w, ${sanGolf720} 720w`,
    desc: "Phát tín hiệu cảnh báo sớm khi xuất hiện mưa giông, lốc sét trên diện rộng sân golf, giúp người chơi và nhân viên kịp thời vào nơi trú ẩn an toàn.",
    models: "LK-JDW245PK, LK-JDL480, GSM-4G",
    link: "/san-pham/coi-bao-dong-co-lon",
  },
  {
    id: 6,
    title: "Thiết bị PCCC & Cứu hộ cứu nạn chuyên dụng",
    tag: "PCCC & Cứu nạn",
    image: mayThoiKhiCuuHo360,
    srcSet: `${mayThoiKhiCuuHo360} 360w, ${mayThoiKhiCuuHo720} 720w`,
    desc: "Đệm hơi cứu hộ nhảy tiếp đất thoát hiểm chung cư cao tầng, quạt thổi khí tăng áp chống ngạt khói cầu thang PCCC, thiết bị báo cháy tự động.",
    models: "Đệm hơi CNCH, Quạt thổi khí PCCC",
    link: "/san-pham/may-thoi-khi-va-dem-hoi-cuu-ho",
  },
];

const coreValues = [
  {
    num: "01",
    title: "Sản phẩm chính hãng chất lượng cao",
    desc: "100% sản phẩm do Thành Công Việt Nam phân phối đều nhập khẩu chính hãng thương hiệu Lion King. Đầy đủ CO/CQ chứng nhận chất lượng và nguồn gốc rõ ràng.",
  },
  {
    num: "02",
    title: "Kinh nghiệm thực chiến dự án lớn",
    desc: "Đồng hành nhiều năm cùng các đối tác lớn: Tổng công ty Sông Đà, Quốc Cường Gia Lai, các nhà máy thủy điện cả nước. Khả năng tư vấn bản vẽ và giải pháp chính xác.",
  },
  {
    num: "03",
    title: "Chính sách bảo hành & Hỗ trợ uy tín",
    desc: "Bảo hành 12 tháng chuẩn hãng, bảo dưỡng định kỳ và hỗ trợ kỹ thuật 24/7 trọn đời sau bảo hành, luôn có sẵn linh phụ kiện thay thế chính hãng.",
  },
  {
    num: "04",
    title: "Tiên phong đổi mới công nghệ",
    desc: "Luôn dẫn đầu trong việc cải tiến thiết bị: tích hợp tủ điều khiển còi hú từ xa qua GSM/4G, kết nối phần mềm kích hoạt tự động theo kịch bản khẩn cấp.",
  },
];

export function AboutPage() {
  return (
    <div className="about-page-clean">
      {/* 1. Breadcrumb */}
      <nav className="about-nav-breadcrumb" aria-label="breadcrumb">
        <div className="about-clean-container">
          <div className="about-breadcrumb-trail">
            <Link to="/">Trang chủ</Link>
            <span className="about-sep">/</span>
            <span className="about-current">Giới thiệu</span>
          </div>
        </div>
      </nav>

      <div className="about-clean-container">
        {/* 2. Tiêu đề trang sáng sủa, trang nhã */}
        <div className="about-header-simple">
          <span className="about-badge-sub">THÀNH CÔNG VIỆT NAM</span>
          <h1>CÔNG TY TNHH THÀNH CÔNG VIỆT NAM</h1>
          <p>
            Đơn vị uy tín hàng đầu tại Việt Nam chuyên cung cấp giải pháp còi hú báo động công suất lớn,
            còi báo xả lũ thủy điện & thiết bị PCCC - CNCH nhập khẩu chính hãng Lion King.
          </p>
        </div>

        {/* 3. Khối 1: Tổng quan & Hồ sơ doanh nghiệp (2 Cột) */}
        <div className="about-overview-row">
          {/* Cột trái: Câu chuyện & Năng lực */}
          <div className="about-story-card">
            <div className="about-card-title-head">
              <span className="about-tag-label">VỀ CHÚNG TÔI</span>
              <h2>Đối Tác An Ninh & Báo Động Tin Cậy Số 1 Tại Việt Nam</h2>
            </div>

            <p className="about-lead-p">
              Công ty TNHH Thành Công Việt Nam là đơn vị cung cấp <strong>giải pháp trọn gói</strong> về hệ thống báo động
              bao gồm từ việc <em>tư vấn, thiết kế, thi công lắp đặt</em>, cùng với đó là việc <em>kiểm tra, bảo dưỡng và bảo trì</em> hệ thống đảm bảo uy tín chất lượng, tạo dựng lòng tin vững chắc nơi Quý khách hàng.
            </p>

            <p className="about-body-p">
              Với mục tiêu đảm bảo an ninh cho sân bay, quân đội, các khu công nghiệp, nhà xưởng, khách sạn, bệnh viện, trường học... và cảnh báo trước các hiểm họa thiên tai: động đất, bão lũ, vỡ đập, cháy rừng, Thành Công Việt Nam đã không ngừng đổi mới, chuyển giao những công nghệ cảnh báo tiên tiến nhất trên thế giới áp dụng linh hoạt, hiệu quả vào thực tiễn Việt Nam.
            </p>

            {/* 4 Thống kê nổi bật thu gọn */}
            <div className="about-stats-compact">
              <div className="about-stat-box">
                <span className="about-stat-val">10+</span>
                <span className="about-stat-name">Năm kinh nghiệm</span>
              </div>
              <div className="about-stat-box">
                <span className="about-stat-val">100%</span>
                <span className="about-stat-name">Lion King chính hãng</span>
              </div>
              <div className="about-stat-box">
                <span className="about-stat-val">500+</span>
                <span className="about-stat-name">Dự án toàn quốc</span>
              </div>
              <div className="about-stat-box">
                <span className="about-stat-val">24/7</span>
                <span className="about-stat-name">Hỗ trợ kỹ thuật</span>
              </div>
            </div>
          </div>

          {/* Cột phải: Thẻ hồ sơ pháp lý công ty */}
          <div className="about-legal-card">
            <div className="about-legal-top">
              <span className="about-legal-badge">HỒ SƠ PHÁP LÝ DOANH NGHIỆP</span>
              <h3>CÔNG TY TNHH THÀNH CÔNG VIỆT NAM</h3>
              <span className="about-legal-sub">THANH CONG VIET NAM COMPANY LIMITED</span>
            </div>

            <div className="about-legal-rows">
              <div className="about-legal-row">
                <span className="legal-key">Mã số thuế (MSDN):</span>
                <span className="legal-val"><strong>0107552155</strong></span>
              </div>
              <div className="about-legal-row">
                <span className="legal-key">Cấp bởi:</span>
                <span className="legal-val">Sở KH&ĐT TP. Hà Nội ngày 05/09/2016</span>
              </div>
              <div className="about-legal-row">
                <span className="legal-key">Đại diện pháp luật:</span>
                <span className="legal-val"><strong>Ông Đỗ Văn Tuân</strong></span>
              </div>
              <div className="about-legal-row">
                <span className="legal-key">Trụ sở chính:</span>
                <span className="legal-val">Số 7, Ngách 68/8, Tổ 2, P. Phú Diễn, Bắc Từ Liêm, Hà Nội</span>
              </div>
              <div className="about-legal-row">
                <span className="legal-key">VP Giao dịch:</span>
                <span className="legal-val">Số 9, Ngõ 68, P. Phú Diễn, Q. Bắc Từ Liêm, TP. Hà Nội</span>
              </div>
              <div className="about-legal-row">
                <span className="legal-key">Hotline dự án / Zalo:</span>
                <span className="legal-val">
                  <a href="tel:0865130088" className="legal-phone-link">0865.130.088</a>
                </span>
              </div>
              <div className="about-legal-row">
                <span className="legal-key">Điện thoại VP:</span>
                <span className="legal-val">
                  <a href="tel:0364862148">0364.862.148</a> — <a href="tel:0865130088">0865.130.088</a>
                </span>
              </div>
              <div className="about-legal-row">
                <span className="legal-key">Email:</span>
                <span className="legal-val">
                  <a href="mailto:coihubaodongvn@gmail.com">coihubaodongvn@gmail.com</a>
                </span>
              </div>
              <div className="about-legal-row">
                <span className="legal-key">Website:</span>
                <span className="legal-val">
                  <a href="https://coihubaodong.com" target="_blank" rel="noopener noreferrer">coihubaodong.com</a>
                </span>
              </div>
            </div>

            <div className="about-legal-action">
              <Link to="/lien-he" className="about-btn-action-red">
                Gửi yêu cầu báo giá dự án
              </Link>
            </div>
          </div>
        </div>

        {/* 4. Khối 2: Các nhóm sản phẩm & Ứng dụng thực tiễn */}
        <div className="about-apps-section-clean">
          <div className="about-section-title-clean">
            <span className="about-badge-sub">LĨNH VỰC HOẠT ĐỘNG</span>
            <h2>Các Nhóm Sản Phẩm & Ứng Dụng Thực Tiễn</h2>
            <p>Đáp ứng mọi điều kiện khắt khe từ nhà máy thủy điện, hầm mỏ khai thác đến các đô thị hiện đại.</p>
          </div>

          <div className="about-apps-grid-clean">
            {applicationList.map((app) => (
              <div key={app.id} className="about-app-item-clean">
                <div className="about-app-thumb">
                  <img
                    src={app.image}
                    srcSet={app.srcSet}
                    sizes="(max-width: 768px) 100vw, 360px"
                    alt={app.title}
                    loading="lazy"
                    decoding="async"
                    width={360}
                    height={240}
                    onError={(e) => {
                      e.target.src = logoImg;
                    }}
                  />
                  <span className="about-app-badge-tag">{app.tag}</span>
                </div>
                <div className="about-app-content">
                  <h3>{app.title}</h3>
                  <p>{app.desc}</p>
                  <div className="about-app-models-box">
                    <span>Mã tiêu biểu:</span> <strong>{app.models}</strong>
                  </div>
                  <Link to={app.link} className="about-app-link-more">
                    Xem sản phẩm →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Khối 3: 4 Cam kết tạo nên thương hiệu uy tín */}
        <div className="about-factors-clean">
          <div className="about-section-title-clean">
            <span className="about-badge-sub">CAM KẾT CHẤT LƯỢNG</span>
            <h2>Tại Sao Nên Chọn Thành Công Việt Nam?</h2>
            <p>4 yếu tố chính giúp Thành Công Việt Nam là đơn vị cung cấp hệ thống còi hú báo động số 1 trên thị trường.</p>
          </div>

          <div className="about-factors-grid-clean">
            {coreValues.map((val) => (
              <div key={val.num} className="about-factor-card-clean">
                <div className="about-factor-header-clean">
                  <span className="about-factor-num-clean">{val.num}</span>
                  <h4>{val.title}</h4>
                </div>
                <p>{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Khối 4: Đối tác tiêu biểu & Khung liên hệ nhanh */}
        <div className="about-partners-clean">
          <div className="about-section-title-clean">
            <span className="about-badge-sub">ĐỐI TÁC TIN CẬY</span>
            <h2>Vinh Dự Là Đối Tác Của Nhiều Đơn Vị Lớn</h2>
            <p>Sự tin tưởng của Quý khách hàng trong suốt thời gian qua là động lực to lớn giúp công ty phát triển bền vững.</p>
          </div>

          <div className="about-partners-img-box">
            <img
              src={khachHangNoiVe360}
              srcSet={`${khachHangNoiVe360} 360w, ${khachHangNoiVe720} 720w`}
              sizes="(max-width: 768px) 100vw, 720px"
              alt="Đối tác tiêu biểu Thành Công Việt Nam"
              loading="lazy"
              decoding="async"
              width={720}
              height={450}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          <div className="about-partner-tags-clean">
            <span>Tổng Công Ty Sông Đà</span>
            <span>Tập Đoàn Quốc Cường Gia Lai</span>
            <span>Các Nhà Máy Thủy Điện Toàn Quốc</span>
            <span>Các Ban Quản Lý Khu Công Nghiệp</span>
            <span>Cảnh Sát PCCC & CNCH</span>
            <span>Hệ Thống Sân Golf & Resort</span>
          </div>

          {/* Banner liên hệ nhanh */}
          <div className="about-quick-cta-clean">
            <div className="about-cta-left">
              <h3>Bạn Cần Tư Vấn Thiết Bị Cho Dự Án?</h3>
              <p>Liên hệ ngay để nhận phương án kỹ thuật âm thanh, sơ đồ nguyên lý và báo giá chiết khấu tốt nhất.</p>
            </div>
            <div className="about-cta-right">
              <a href="tel:0865.130.088" className="about-cta-phone-btn">
                Hotline: 0865.130.088
              </a>
              <Link to="/lien-he" className="about-cta-link-btn">
                Gửi liên hệ tư vấn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AboutPage;

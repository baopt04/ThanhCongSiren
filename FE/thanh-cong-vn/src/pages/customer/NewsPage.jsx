import News from "../../components/common/customer/News/News";
import { Link } from "react-router-dom";
import { Seo } from "../../components/common/Seo";
import "./NewsPage.css";

export function NewsPage() {
  return (
    <div className="news-page">
      <Seo
        title="Tin tức PCCC & còi hú báo động"
        description="Tin tức, hướng dẫn kỹ thuật và kiến thức PCCC từ Công ty TNHH Thành Công Việt Nam."
        path="/tin-tuc"
      />
      {/* Breadcrumb */}
      <div className="news-page-breadcrumb">
        <div className="news-page-breadcrumb-inner">
          <Link to="/">Trang chủ</Link>
          <span className="news-page-sep">/</span>
          <span>Tin tức</span>
        </div>
      </div>

      <News />
    </div>
  );
}
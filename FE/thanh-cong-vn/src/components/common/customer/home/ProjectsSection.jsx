import { memo, useState } from "react";
import { Link } from "react-router-dom";
import "./ProjectsSection.css";
import { optimizeCloudinary } from "../../../../utils/cloudinary";

import proj1_360 from "../../../../assets/images/projects/sapa-thuy-dien-360.webp";
import proj1_720 from "../../../../assets/images/projects/sapa-thuy-dien-720.webp";
import proj2_360 from "../../../../assets/images/projects/nha-may-thuy-dien-360.webp";
import proj2_720 from "../../../../assets/images/projects/nha-may-thuy-dien-720.webp";
import proj3_360 from "../../../../assets/images/projects/bao-dong-nha-may-360.webp";
import proj3_720 from "../../../../assets/images/projects/bao-dong-nha-may-720.webp";
import proj4_360 from "../../../../assets/images/projects/khai-thac-khoang-san-360.webp";
import proj4_720 from "../../../../assets/images/projects/khai-thac-khoang-san-720.webp";

const PROJECTS_DATA = [
  {
    id: "da-1",
    title: "Công trình Thủy điện Sapa - Hệ thống còi hú xả lũ",
    image: proj1_720,
    srcSet: `${proj1_360} 360w, ${proj1_720} 720w`,
    link: "/tin-tuc",
  },
  {
    id: "da-2",
    title: "Nhà máy thủy điện Sông Hinh - Còi báo động lớn LK-JDW245PK",
    image: proj2_720,
    srcSet: `${proj2_360} 360w, ${proj2_720} 720w`,
    link: "/tin-tuc",
  },
  {
    id: "da-3",
    title: "Khu công nghiệp & Cảng biển - Còi hú báo động phòng thủ dân sự",
    image: proj3_720,
    srcSet: `${proj3_360} 360w, ${proj3_720} 720w`,
    link: "/tin-tuc",
  },
  {
    id: "da-4",
    title: "Đơn vị CNCH mỏ khai khoáng - Máy thổi khí & Đệm hơi",
    image: proj4_720,
    srcSet: `${proj4_360} 360w, ${proj4_720} 720w`,
    link: "/tin-tuc",
  },
];

export const ProjectsSection = memo(function ProjectsSection() {
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      const progress = Math.min(Math.max(scrollLeft / maxScroll, 0), 1);
      setScrollProgress(progress);
    }
  };

  return (
    <section className="tc-home-projects-section" id="section-du-an">
      <div className="tc-projects-container">
        {/* Header matching mockup */}
        <div className="tc-section-header-modern">
          <div className="tc-section-title-wrap">
            <span className="tc-title-indicator" />
            <h2 className="tc-section-title-text">Dự án đã thi công</h2>
          </div>
          <Link to="/tin-tuc" className="tc-section-more-link">
            Xem tất cả
          </Link>
        </div>

        {/* Horizontal scroll list */}
        <div className="tc-projects-scroll-wrapper" onScroll={handleScroll}>
          {PROJECTS_DATA.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="tc-project-card-item"
              title={item.title}
            >
              <div className="tc-project-img-box">
                <img
                  src={optimizeCloudinary(item.image, 640)}
                  srcSet={item.srcSet}
                  sizes="(max-width: 768px) 100vw, 360px"
                  alt={item.title}
                  className="tc-project-img"
                  loading="lazy"
                  decoding="async"
                  width={360}
                  height={240}
                />
                <div className="tc-project-overlay-label">
                  <span>Ảnh công trình</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Thanh chỉ báo cuộn mỏng chuyển động theo cuộn */}
        <div className="tc-mobile-scroll-indicator" aria-hidden="true">
          <span
            className="tc-scroll-bar-thumb"
            style={{
              transform: `translateX(${scrollProgress * 36}px)`,
              transition: "transform 0.05s ease-out",
            }}
          />
        </div>
      </div>
    </section>
  );
});

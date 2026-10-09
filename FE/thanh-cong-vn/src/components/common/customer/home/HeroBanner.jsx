import { memo } from "react";
import "./HeroBanner.css";
import { Carousel } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import banner1 from "../../../../assets/Banner_1.webp";
import banner2 from "../../../../assets/Banner_2.webp";
import banner3 from "../../../../assets/Banner_3.webp";
import banner1Mobile from "../../../../assets/Banner_1_mobile.webp";
import banner2Mobile from "../../../../assets/Banner_2_mobile.webp";
import banner3Mobile from "../../../../assets/Banner_3_mobile.webp";

const banners = [
  {
    src: banner1,
    srcMobile: banner1Mobile,
    alt: "Còi hú báo động Thành Công Việt Nam - Banner 1",
    priority: true,
  },
  {
    src: banner2,
    srcMobile: banner2Mobile,
    alt: "Còi hú báo động Thành Công Việt Nam - Banner 2",
    priority: false,
  },
  {
    src: banner3,
    srcMobile: banner3Mobile,
    alt: "Còi hú báo động Thành Công Việt Nam - Banner 3",
    priority: false,
  },
];

function PrevArrow({ className, style, onClick }) {
  return (
    <button
      type="button"
      className={`tc-hero-arrow tc-hero-arrow-prev ${className || ""}`}
      style={style}
      onClick={onClick}
      aria-label="Banner trước"
    >
      <LeftOutlined />
    </button>
  );
}

function NextArrow({ className, style, onClick }) {
  return (
    <button
      type="button"
      className={`tc-hero-arrow tc-hero-arrow-next ${className || ""}`}
      style={style}
      onClick={onClick}
      aria-label="Banner tiếp"
    >
      <RightOutlined />
    </button>
  );
}

export const HeroBanner = memo(function HeroBanner() {
  return (
    <section className="tc-hero-section" aria-label="Banner chính">
      <div className="tc-hero-slider">
        <Carousel
          autoplay
          autoplaySpeed={4500}
          effect="fade"
          dots
          arrows
          pauseOnHover
          lazyLoad="ondemand"
          prevArrow={<PrevArrow />}
          nextArrow={<NextArrow />}
        >
          {banners.map((banner, index) => (
            <div key={banner.alt} className="tc-slide-item">
              <div className="tc-slide-media">
                <picture className="tc-slide-picture">
                  <source
                    media="(max-width: 768px)"
                    srcSet={banner.srcMobile}
                    width={768}
                    height={280}
                  />
                  <img
                    src={banner.src}
                    alt={banner.alt}
                    className="tc-slide-img"
                    draggable={false}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding={index === 0 ? "sync" : "async"}
                    fetchPriority={index === 0 ? "high" : "low"}
                    width={1920}
                    height={700}
                  />
                </picture>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
});

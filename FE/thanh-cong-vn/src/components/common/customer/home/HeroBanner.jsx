import { useState, useEffect, useCallback, memo } from "react";
import "./HeroBanner.css";
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
  },
  {
    src: banner2,
    srcMobile: banner2Mobile,
    alt: "Còi hú báo động Thành Công Việt Nam - Banner 2",
  },
  {
    src: banner3,
    srcMobile: banner3Mobile,
    alt: "Còi hú báo động Thành Công Việt Nam - Banner 3",
  },
];

export const HeroBanner = memo(function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <section className="tc-hero-section" aria-label="Banner chính">
      <div
        className="tc-hero-slider"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="tc-hero-slides-wrapper">
          {banners.map((banner, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={banner.alt}
                className={`tc-slide-item ${isActive ? "is-active" : ""}`}
                aria-hidden={!isActive}
              >
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
            );
          })}
        </div>

        {/* Prev & Next navigation arrows */}
        <button
          type="button"
          className="tc-hero-arrow tc-hero-arrow-prev"
          onClick={prevSlide}
          aria-label="Banner trước"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          type="button"
          className="tc-hero-arrow tc-hero-arrow-next"
          onClick={nextSlide}
          aria-label="Banner tiếp"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Dots with accessible >= 24px touch targets */}
        <div className="tc-hero-dots-container" role="tablist" aria-label="Danh sách banner">
          {banners.map((banner, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Chuyển tới banner ${index + 1}`}
                className={`tc-hero-dot-btn ${isActive ? "is-active" : ""}`}
                onClick={() => setCurrentIndex(index)}
              >
                <span className="tc-hero-dot-indicator" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
});

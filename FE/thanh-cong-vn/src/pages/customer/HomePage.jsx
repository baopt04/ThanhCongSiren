import { useState, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { HeroBanner } from "../../components/common/customer/home/HeroBanner";
import { InfoStrip } from "../../components/common/customer/home/InfoStrip";
import { ProductSection } from "../../components/common/customer/home/ProductSection";
import { ProjectsSection } from "../../components/common/customer/home/ProjectsSection";
import { NewsSection } from "../../components/common/customer/home/NewsSection";
import { FastQuoteBanner } from "../../components/common/customer/home/FastQuoteBanner";
import { useHomeSectionsQuery } from "../../hooks/queries/customerQueries";
import { Seo } from "../../components/common/Seo";
import "./HomePage.css";

const QuoteModal = lazy(() =>
  import("../../components/common/customer/QuoteModal/QuoteModal").then((m) => ({
    default: m.QuoteModal,
  }))
);

// ── Local Fallback Images (WebP 360w & 720w) ──
import lk100a_360 from "../../assets/images/products/coi-quay-tay-lk100a-360.webp";
import lk100a_720 from "../../assets/images/products/coi-quay-tay-lk100a-720.webp";
import lkfx200_360 from "../../assets/images/products/coi-quay-tay-lkfx200-360.webp";
import lkfx200_720 from "../../assets/images/products/coi-quay-tay-lkfx200-720.webp";
import lk100_360 from "../../assets/images/products/coi-quay-tay-lk100-360.webp";
import lk100_720 from "../../assets/images/products/coi-quay-tay-lk100-720.webp";
import lk120a_360 from "../../assets/images/products/coi-quay-tay-lk120a-360.webp";
import lk120a_720 from "../../assets/images/products/coi-quay-tay-lk120a-720.webp";

import bf50_360 from "../../assets/images/products/quat-pin-bf50-360.webp";
import bf50_720 from "../../assets/images/products/quat-pin-bf50-720.webp";
import esv280_360 from "../../assets/images/products/may-thoi-khi-esv280-360.webp";
import esv280_720 from "../../assets/images/products/may-thoi-khi-esv280-720.webp";
import esv230_360 from "../../assets/images/products/may-thoi-khi-esv230-360.webp";
import esv230_720 from "../../assets/images/products/may-thoi-khi-esv230-720.webp";
import wf390_360 from "../../assets/images/products/may-thoi-khi-ap-luc-nuoc-360.webp";
import wf390_720 from "../../assets/images/products/may-thoi-khi-ap-luc-nuoc-720.webp";

import dem14x10_360 from "../../assets/images/products/dem-cuu-ho-14x10x35m-360.webp";
import dem14x10_720 from "../../assets/images/products/dem-cuu-ho-14x10x35m-720.webp";
import dem5x4_360 from "../../assets/images/products/dem-hoi-cuu-ho-5x4x25m-360.webp";
import dem5x4_720 from "../../assets/images/products/dem-hoi-cuu-ho-5x4x25m-720.webp";
import dem8x6_360 from "../../assets/images/products/dem-hoi-cuu-ho-8x6x25-360.webp";
import dem8x6_720 from "../../assets/images/products/dem-hoi-cuu-ho-8x6x25-720.webp";
import phao_360 from "../../assets/images/products/phao-cuu-sinh-360.webp";
import phao_720 from "../../assets/images/products/phao-cuu-sinh-720.webp";

// ── Fallback Products ensuring exactly 4 cards are always rendered beautifully ──
const FALLBACK_SIRENS = [
  {
    name: "Còi báo động quay tay LK-100A",
    price: "1.500.000 VNĐ",
    slug: "coi-bao-dong-quay-tay-lk-100a",
    image: lk100a_720,
    srcSet: `${lk100a_360} 360w, ${lk100a_720} 720w`,
  },
  {
    name: "Còi báo động quay tay FX-200",
    price: "1.000 VNĐ",
    slug: "coi-bao-dong-quay-tay-fx-200",
    image: lkfx200_720,
    srcSet: `${lkfx200_360} 360w, ${lkfx200_720} 720w`,
  },
  {
    name: "Còi báo động quay tay LK-100",
    price: "1.500.000 VNĐ",
    slug: "coi-bao-dong-quay-tay-lk-100",
    image: lk100_720,
    srcSet: `${lk100_360} 360w, ${lk100_720} 720w`,
  },
  {
    name: "Còi báo động quay tay LK-120A",
    price: "3.800.000 VNĐ",
    slug: "coi-bao-dong-quay-tay-lk-120a",
    image: lk120a_720,
    srcSet: `${lk120a_360} 360w, ${lk120a_720} 720w`,
  },
];

const FALLBACK_BLOWERS = [
  {
    name: "Quạt thổi gió phòng cháy chữa cháy chạy pin BF50",
    price: "Liên hệ báo giá",
    slug: "quat-gio-chay-bang-pin-bf50",
    image: bf50_720,
    srcSet: `${bf50_360} 360w, ${bf50_720} 720w`,
  },
  {
    name: "Máy thổi khí động cơ điện LK-ESV280",
    price: "Liên hệ báo giá",
    slug: "may-thoi-khi-dong-co-dien-lk-esv280",
    image: esv280_720,
    srcSet: `${esv280_360} 360w, ${esv280_720} 720w`,
  },
  {
    name: "Máy thổi khí động cơ điện LK-ESV230",
    price: "Liên hệ báo giá",
    slug: "may-thoi-khi-dong-co-dien-lk-esv230",
    image: esv230_720,
    srcSet: `${esv230_360} 360w, ${esv230_720} 720w`,
  },
  {
    name: "Quạt thổi khí áp lực nước PCCC WF390-16",
    price: "Liên hệ báo giá",
    slug: "may-thoi-khi-bang-ap-luc-nuoc",
    image: wf390_720,
    srcSet: `${wf390_360} 360w, ${wf390_720} 720w`,
  },
];

const FALLBACK_MATTRESS = [
  {
    name: "Đệm hơi cứu hộ cứu nạn 14x10x3.5M",
    price: "Liên hệ báo giá",
    slug: "dem-cuu-ho-14x10x35m",
    image: dem14x10_720,
    srcSet: `${dem14x10_360} 360w, ${dem14x10_720} 720w`,
  },
  {
    name: "Đệm hơi không khí cứu hộ cứu nạn 5x4x2.5M",
    price: "Liên hệ báo giá",
    slug: "dem-hoi-cuu-ho-5x4x25m",
    image: dem5x4_720,
    srcSet: `${dem5x4_360} 360w, ${dem5x4_720} 720w`,
  },
  {
    name: "Đệm cứu hộ cứu nạn chuyên dụng 8x6x2.5M",
    price: "Liên hệ báo giá",
    slug: "dem-hoi-cuu-ho-8x6x25",
    image: dem8x6_720,
    srcSet: `${dem8x6_360} 360w, ${dem8x6_720} 720w`,
  },
  {
    name: "Đệm cứu hộ bằng không khí Lion King",
    price: "Liên hệ báo giá",
    slug: "dem-cuu-ho-khong-khi",
    image: phao_720,
    srcSet: `${phao_360} 360w, ${phao_720} 720w`,
  },
];

export function HomePage() {
  const { data: sections = [], isLoading: loading } = useHomeSectionsQuery();
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  // Match API sections if available
  const { sirenProducts, blowerProducts, mattressProducts } = useMemo(() => {
    if (!sections || sections.length === 0) {
      return { sirenProducts: [], blowerProducts: [], mattressProducts: [] };
    }

    const sirens =
      sections.find(
        (s) =>
          s.categorySlug?.includes("coi") ||
          s.categoryName?.toLowerCase().includes("còi")
      )?.products || [];

    const blowers =
      sections.find(
        (s) =>
          s.categorySlug?.includes("thoi") ||
          s.categoryName?.toLowerCase().includes("thổi") ||
          s.categoryName?.toLowerCase().includes("quạt")
      )?.products || [];

    const mattress =
      sections.find(
        (s) =>
          s.categorySlug?.includes("dem") ||
          s.categoryName?.toLowerCase().includes("đệm")
      )?.products || [];

    return { sirenProducts: sirens, blowerProducts: blowers, mattressProducts: mattress };
  }, [sections]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <Seo
        title="Thành Công Việt Nam | Còi hú báo động & Thiết bị PCCC Lion King"
        description="Công ty TNHH Thành Công Việt Nam — đại lý ủy quyền Lion King. Còi hú báo động công suất lớn, thiết bị PCCC, máy thổi khí, đệm hơi. Hotline 0865 130 088"
        path="/"
      />

      {/* Semantic H1 heading for SEO & Accessibility */}
      <h1 className="tc-sr-only">
        Còi hú báo động &amp; Thiết bị PCCC Thành Công Việt Nam - Đại lý ủy quyền Lion King
      </h1>

      {/* 1. Hero 2-column card matching mockup */}
      <HeroBanner onOpenQuote={() => setQuoteModalOpen(true)} />

      {/* 2. 4 Value Proposition Badges */}
      <InfoStrip />

      {/* 3. Category Filter Section ("Danh mục sản phẩm") matching mockup */}
      <section className="tc-home-cat-filter-section">
        <div className="tc-home-cat-filter-container">
          <div className="tc-section-title-wrap">
            <span className="tc-title-indicator" />
            <h2 className="tc-section-title-text">Danh mục sản phẩm</h2>
          </div>
          <div className="tc-home-cat-pills-row">
            <button
              type="button"
              className="tc-home-cat-pill-btn"
              onClick={() => scrollToSection("section-coi-hu-bao-dong")}
            >
              Còi báo động
            </button>
            <button
              type="button"
              className="tc-home-cat-pill-btn"
              onClick={() => scrollToSection("section-may-thoi-khi")}
            >
              Máy thổi khí
            </button>
            <button
              type="button"
              className="tc-home-cat-pill-btn"
              onClick={() => scrollToSection("section-dem-hoi-cuu-ho-cuu-nan")}
            >
              Đệm hơi
            </button>
            <Link
              to="/san-pham/thiet-bi-bao-chay"
              className="tc-home-cat-pill-btn"
            >
              Thiết bị báo cháy
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Section: Còi báo động (Lưới 2 cột x 2 hàng trên mobile) */}
      <ProductSection
        title="Còi báo động"
        categorySlug="coi-hu-bao-dong"
        products={sirenProducts}
        fallbackProducts={FALLBACK_SIRENS}
        showButton={true}
        loading={loading}
        isScrollableOnMobile={false}
      />

      {/* 5. Section: Máy thổi khí (Cuộn ngang trên mobile) */}
      <ProductSection
        title="Máy thổi khí"
        categorySlug="may-thoi-khi"
        products={blowerProducts}
        fallbackProducts={FALLBACK_BLOWERS}
        showButton={true}
        loading={loading}
        isScrollableOnMobile={true}
      />

      {/* 6. Section: Đệm hơi (Cuộn ngang trên mobile) */}
      <ProductSection
        title="Đệm hơi"
        categorySlug="dem-hoi-cuu-ho-cuu-nan"
        products={mattressProducts}
        fallbackProducts={FALLBACK_MATTRESS}
        showButton={true}
        loading={loading}
        isScrollableOnMobile={true}
      />

      {/* 7. Section: Dự án đã thi công (Cuộn ngang matching mockup Ảnh 1) */}
      <ProjectsSection />

      {/* 8. Section: Tin tức (Matching mockup Ảnh 2) */}
      <NewsSection />

      {/* 8. Section: Cần báo giá nhanh? (Inline callout card matching mockup) */}
      <FastQuoteBanner />

      {/* Quick Quote Modal loaded on-demand */}
      {quoteModalOpen && (
        <Suspense fallback={null}>
          <QuoteModal
            isOpen={quoteModalOpen}
            onClose={() => setQuoteModalOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}

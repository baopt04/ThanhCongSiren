import { useState, useEffect } from "react";
import { HeroBanner } from "../../components/common/customer/home/HeroBanner";
import { InfoStrip } from "../../components/common/customer/home/InfoStrip";
import { ProductSection } from "../../components/common/customer/home/ProductSection";
import { FastQuoteBanner } from "../../components/common/customer/home/FastQuoteBanner";
import { NewsSection } from "../../components/common/customer/home/NewsSection";
import { categorySections } from "../../services/customer/CustomerProductService";
import { Seo } from "../../components/common/Seo";

export function HomePage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSections = async () => {
      try {
        setLoading(true);
        const res = await categorySections();
        const data = res?.data || (Array.isArray(res) ? res : []);
        if (isMounted) {
          setSections(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error loading home category sections:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSections();
    return () => {
      isMounted = false;
    };
  }, []);

  // Chia 2 section đầu trước banner báo giá và các section còn lại sau banner báo giá
  const firstHalf = sections.slice(0, 2);
  const secondHalf = sections.slice(2);

  return (
    <>
      <Seo
        title="Còi hú báo động & Thiết bị PCCC Lion King"
        description="Công ty TNHH Thành Công Việt Nam — đại lý ủy quyền Lion King. Còi hú báo động công suất lớn, thiết bị PCCC, tủ điều khiển GSM/4G. Hotline 0865.130.088"
        path="/"
      />
      <HeroBanner />
      <InfoStrip />

      {/* Hiển thị các section sản phẩm đầu (Còi hú báo động, Tủ điều khiển,...) */}
      {firstHalf.map((sec) => (
        <ProductSection
          key={sec.categoryId || sec.categorySlug}
          title={sec.categoryName}
          categorySlug={sec.categorySlug}
          products={sec.products}
          loading={loading}
        />
      ))}

      {/* Banner báo giá nhanh giữa trang */}
      <FastQuoteBanner />

      {/* Hiển thị các section sản phẩm tiếp theo (Còi quay tay, Máy thổi khí & Đệm hơi,...) */}
      {secondHalf.map((sec) => (
        <ProductSection
          key={sec.categoryId || sec.categorySlug}
          title={sec.categoryName}
          categorySlug={sec.categorySlug}
          products={sec.products}
          loading={loading}
        />
      ))}

      {/* Tin tức & video chân trang */}
      <NewsSection />
    </>
  );
}

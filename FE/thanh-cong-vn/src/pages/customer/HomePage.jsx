import { HeroBanner } from "../../components/common/customer/home/HeroBanner";
import { InfoStrip } from "../../components/common/customer/home/InfoStrip";
import { ProductSection, ProductSectionSkeleton } from "../../components/common/customer/home/ProductSection";
import { NewsSection } from "../../components/common/customer/home/NewsSection";
import { useHomeSectionsQuery } from "../../hooks/queries/customerQueries";
import { Seo } from "../../components/common/Seo";

export function HomePage() {
  const { data: sections = [], isLoading: loading } = useHomeSectionsQuery();

  const isInitialLoading = loading && (!sections || sections.length === 0);
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

      {isInitialLoading ? (
        <>
          <ProductSectionSkeleton title="CÒI HÚ BÁO ĐỘNG" />
          <ProductSectionSkeleton title="TỦ ĐIỀU KHIỂN & BỘ ĐIỀU KHIỂN" />
        </>
      ) : (
        <>
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
        </>
      )}

      {/* Tin tức & video chân trang */}
      <NewsSection />
    </>
  );
}

import { HeroBanner } from "../../components/common/customer/home/HeroBanner";
import { InfoStrip } from "../../components/common/customer/home/InfoStrip";
import { ProductSection } from "../../components/common/customer/home/ProductSection";

export function HomePage() {
  return (
    <>
      <HeroBanner />
      <InfoStrip />
      <ProductSection title="THIẾT BỊ BÁO CHÁY" />
      <ProductSection title="CÒI BÁO ĐỘNG" />
      <ProductSection title="MÁY THỔI KHÍ" />
      <ProductSection title="ĐỆM HƠI CỨU HỘ CỨU NẠN" />
      <ProductSection title="TIN TỨC-VIDEO" />

    </>
  );
}


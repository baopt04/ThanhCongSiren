import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductListingLayout } from "../../components/common/customer/ProductListingLayout/ProductListingLayout";
import { SafetyCertificateOutlined, PhoneOutlined } from "@ant-design/icons";
import { useCustomerProductsQuery } from "../../hooks/queries/customerQueries";
import { Seo } from "../../components/common/Seo";

function isFireAlarmProduct(p) {
  const cat = (p.categoryName || "").toLowerCase();
  const name = (p.name || "").toLowerCase();
  return (
    cat.includes("cháy") ||
    cat.includes("chay") ||
    cat.includes("báo cháy") ||
    cat.includes("bao chay") ||
    cat.includes("pccc") ||
    cat.includes("khói") ||
    cat.includes("khoi") ||
    cat.includes("nhiệt") ||
    cat.includes("nhiet") ||
    cat.includes("thoát hiểm") ||
    cat.includes("quat") ||
    cat.includes("quạt") ||
    name.includes("cháy") ||
    name.includes("chay") ||
    name.includes("pccc") ||
    name.includes("khói") ||
    name.includes("báo cháy")
  );
}

export function FireAlarmPage() {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type") || "all";
  
  const { data: res, isLoading: loading } = useCustomerProductsQuery(0, 50);

  const products = useMemo(() => {
    const rawList = Array.isArray(res)
      ? res
      : res?.data || res?.result || res?.content || [];
    const list = Array.isArray(rawList) ? rawList : [];
    const filtered = list.filter(isFireAlarmProduct);
    return filtered.length > 0 ? filtered : list;
  }, [res]);

  const guideCard = (
    <div className="tc-siren-guide-card">
      <div className="tc-guide-header">
        <SafetyCertificateOutlined className="tc-guide-ic" />
        <h2>TƯ VẤN THIẾT KẾ & LẮP ĐẶT HỆ THỐNG BÁO CHÁY TỰ ĐỘNG</h2>
      </div>
      <div className="tc-guide-body">
        <p>Mọi thiết bị báo cháy do Thành Công Việt Nam cung cấp đều đầy đủ chứng nhận kiểm định PCCC & CO/CQ gốc.</p>
        <div className="tc-guide-cta">
          <span>Nhận báo giá trọn gói thiết bị PCCC cho công trình:</span>
          <a href="tel:0865130088" className="tc-guide-phone-btn">
            <PhoneOutlined /> Gọi Hotline: 0865.130.088
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Seo
        title="Thiết bị báo cháy & PCCC"
        description="Thiết bị báo cháy tự động, đầu báo khói nhiệt, còi đèn PCCC chính hãng — Công ty TNHH Thành Công Việt Nam."
      />
      <ProductListingLayout
        pageTitle="Thiết bị báo cháy & PCCC"
        breadcrumbItems={[
          { label: "Trang chủ", path: "/" },
          { label: "Thiết bị báo cháy", path: null },
        ]}
        defaultCategoryId={typeParam}
        products={products}
        loading={loading}
        pageSize={12}
        guideCard={guideCard}
      />
    </>
  );
}

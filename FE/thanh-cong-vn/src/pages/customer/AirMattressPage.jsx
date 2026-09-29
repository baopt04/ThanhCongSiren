import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductListingLayout } from "../../components/common/customer/ProductListingLayout/ProductListingLayout";
import { SafetyCertificateOutlined, PhoneOutlined } from "@ant-design/icons";
import { getAllProductsForCustomer } from "../../services/customer/CustomerProductService";
import { Seo } from "../../components/common/Seo";

function isRescueMattressProduct(p) {
  const cat = (p.categoryName || "").toLowerCase();
  const name = (p.name || "").toLowerCase();
  return (
    cat.includes("đệm") ||
    cat.includes("dem") ||
    cat.includes("cứu hộ") ||
    cat.includes("cuu ho") ||
    cat.includes("cứu nạn") ||
    cat.includes("cuu nan") ||
    name.includes("đệm hơi") ||
    name.includes("dem hoi") ||
    name.includes("cứu hộ") ||
    name.includes("cuu ho")
  );
}

export function AirMattressPage() {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type") || "all";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await getAllProductsForCustomer();
        const rawList = Array.isArray(res)
          ? res
          : res?.data || res?.result || res?.content || [];
        if (isMounted) {
          const list = Array.isArray(rawList) ? rawList : [];
          setProducts(list.filter(isRescueMattressProduct));
        }
      } catch (error) {
        console.error("Error loading products for AirMattressPage:", error);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const guideCard = (
    <div className="tc-siren-guide-card">
      <div className="tc-guide-header">
        <SafetyCertificateOutlined className="tc-guide-ic" />
        <h2>ĐỆM HƠI CỨU HỘ CỨU NẠN</h2>
      </div>
      <div className="tc-guide-body">
        <p>
          Đệm hơi cứu hộ cứu nạn giúp lực lượng PCCC & CNCH sơ tán an toàn từ nhà cao tầng khi xảy ra sự cố.
        </p>
        <div className="tc-guide-cta">
          <span>Tư vấn thiết bị cứu hộ:</span>
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
        title="Đệm hơi cứu hộ cứu nạn"
        description="Đệm hơi cứu hộ cứu nạn PCCC & CNCH — Công ty TNHH Thành Công Việt Nam."
      />
      <ProductListingLayout
        pageTitle="Đệm hơi cứu hộ cứu nạn"
        breadcrumbItems={[
          { label: "Trang chủ", path: "/" },
          { label: "Đệm hơi cứu hộ cứu nạn", path: null },
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

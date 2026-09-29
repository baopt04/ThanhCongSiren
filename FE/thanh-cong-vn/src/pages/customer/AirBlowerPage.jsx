import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductListingLayout } from "../../components/common/customer/ProductListingLayout/ProductListingLayout";
import { SafetyCertificateOutlined, PhoneOutlined } from "@ant-design/icons";
import { getAllProductsForCustomer } from "../../services/customer/CustomerProductService";
import { Seo } from "../../components/common/Seo";

function isBlowerProduct(p) {
  const cat = (p.categoryName || "").toLowerCase();
  const name = (p.name || "").toLowerCase();
  return (
    cat.includes("thổi") ||
    cat.includes("thoi") ||
    cat.includes("hút khói") ||
    cat.includes("hut khoi") ||
    cat.includes("quạt") ||
    cat.includes("quat") ||
    name.includes("thổi khí") ||
    name.includes("thoi khi") ||
    name.includes("hút khói") ||
    name.includes("hut khoi") ||
    name.includes("máy thổi") ||
    name.includes("may thoi")
  );
}

export function AirBlowerPage() {
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
          const filtered = list.filter(isBlowerProduct);
          setProducts(filtered);
        }
      } catch (error) {
        console.error("Error loading products for AirBlowerPage:", error);
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
        <h2>HƯỚNG DẪN LỰA CHỌN MÁY THỔI KHÍ PCCC</h2>
      </div>
      <div className="tc-guide-body">
        <p>
          Máy thổi khí PCCC trang bị động cơ xăng hoặc áp lực nước giúp xua tan khói độc tại hiện trường đám cháy và thông gió công trình ngầm.
        </p>
        <div className="tc-guide-cta">
          <span>Tư vấn kỹ thuật chọn máy thổi khí:</span>
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
        title="Máy thổi khí & quạt hút khói PCCC"
        description="Máy thổi khí PCCC, quạt hút khói di động cho cảnh sát PCCC & CNCH — Thành Công Việt Nam."
      />
      <ProductListingLayout
        pageTitle="Máy thổi khí & Quạt hút khói"
        breadcrumbItems={[
          { label: "Trang chủ", path: "/" },
          { label: "Máy thổi khí & Quạt hút khói", path: null },
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

import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { ProductListingLayout } from "../../components/common/customer/ProductListingLayout/ProductListingLayout";
import { SafetyCertificateOutlined, PhoneOutlined } from "@ant-design/icons";
import { getAllProductsForCustomer } from "../../services/customer/CustomerProductService";
import { Seo } from "../../components/common/Seo";

export function SirenPage() {
  const { param, slug } = useParams();
  const [searchParams] = useSearchParams();
  const activeCategorySlug = param || slug || searchParams.get("type") || "all";
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
          setProducts(Array.isArray(rawList) ? rawList : []);
        }
      } catch (error) {
        console.error("Error loading products for SirenPage:", error);
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
        <h2>HƯỚNG DẪN LỰA CHỌN CÒI HÚ BÁO ĐỘNG DỰ ÁN THỦY ĐIỆN & QUÂN ĐỘI</h2>
      </div>
      <div className="tc-guide-body">
        <p>
          Khi chọn còi hú cho trạm quan trắc thủy điện, hồ chứa nước hay khu quân sự, Quý khách cần lưu ý:
        </p>
        <ul>
          <li><strong>Bán kính âm thanh:</strong> Chọn bán kính phát âm từ 1km đến 10km tùy diện tích xả lũ.</li>
          <li><strong>Công suất & Điện áp:</strong> Còi cỡ lớn dùng điện 3 pha 380V (công suất từ 3kW đến 10kW).</li>
          <li><strong>Tủ GSM/4G từ xa:</strong> Vận hành kích hoạt từ xa qua điện thoại hoặc hệ thống SCADA.</li>
          <li><strong>Hồ sơ CO/CQ gốc:</strong> Kèm chứng nhận nguồn gốc Lion King chính hãng nghiệm thu dự án.</li>
        </ul>
        <div className="tc-guide-cta">
          <span>Cần tư vấn bản vẽ kỹ thuật & báo giá dự án?</span>
          <a href="tel:0865130088" className="tc-guide-phone-btn">
            <PhoneOutlined /> Hotline Kỹ Thuật: 0865.130.088
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Seo
        title="Sản phẩm còi hú báo động"
        description="Danh mục còi hú báo động công suất lớn Lion King chính hãng cho thủy điện, quân đội, PCCC — Thành Công Việt Nam."
      />
      <ProductListingLayout
        pageTitle="Danh sách sản phẩm"
        breadcrumbItems={[
          { label: "Trang chủ", path: "/" },
          { label: "Sản phẩm", path: "/san-pham" },
          ...(activeCategorySlug && activeCategorySlug !== "all"
            ? [{ label: activeCategorySlug, path: null }]
            : []),
        ]}
        defaultCategoryId={activeCategorySlug}
        products={products}
        loading={loading}
        pageSize={12}
        guideCard={guideCard}
      />
    </>
  );
}

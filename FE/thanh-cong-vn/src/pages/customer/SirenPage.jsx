import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { ProductListingLayout } from "../../components/common/customer/ProductListingLayout/ProductListingLayout";
import { SafetyCertificateOutlined, PhoneOutlined } from "@ant-design/icons";
import {
  useCustomerProductsQuery,
  prefetchCustomerProductsPage,
} from "../../hooks/queries/customerQueries";
import { getCachedCustomerCategories, findCategoryInTree } from "../../utils/categoriesCache";
import { Seo } from "../../components/common/Seo";

export function SirenPage() {
  const { param, slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategorySlug = param || slug || searchParams.get("type") || "all";
  const [categoryName, setCategoryName] = useState("");

  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;
  const backendPage = Math.max(0, currentPage - 1);
  const isAllCategory = activeCategorySlug === "all";

  // Tải sản phẩm phân trang qua TanStack Query cache
  const { data: res, isLoading: loading } = useCustomerProductsQuery(
    backendPage,
    12,
    { enabled: isAllCategory }
  );

  const rawList = useMemo(() => {
    if (!res) return [];
    return Array.isArray(res)
      ? res
      : res?.data || res?.result || res?.content || [];
  }, [res]);

  const products = Array.isArray(rawList) ? rawList : [];

  const pagination = useMemo(() => {
    if (res?.pagination) {
      return {
        page: (res.pagination.page ?? backendPage) + 1,
        size: res.pagination.size ?? 12,
        total: res.pagination.totalElements ?? rawList.length,
        totalPages: res.pagination.totalPages ?? 1,
      };
    }
    return {
      page: currentPage,
      size: 12,
      total: rawList.length,
      totalPages: Math.ceil(rawList.length / 12) || 1,
    };
  }, [res, backendPage, currentPage, rawList.length]);

  // Prefetch trang kế tiếp (Next page) ở background để khi bấm là hiển thị tức thì
  useEffect(() => {
    if (isAllCategory && pagination.page < pagination.totalPages) {
      prefetchCustomerProductsPage(backendPage + 1, 12);
    }
  }, [isAllCategory, backendPage, pagination.page, pagination.totalPages]);

  // Tải tên danh mục để hiển thị breadcrumb và title thân thiện
  useEffect(() => {
    if (activeCategorySlug && activeCategorySlug !== "all") {
      getCachedCustomerCategories()
        .then((treeRes) => {
          const raw = treeRes?.data || treeRes?.result || treeRes || [];
          const found = findCategoryInTree(Array.isArray(raw) ? raw : [], activeCategorySlug);
          if (found?.name) {
            setCategoryName(found.name);
          }
        })
        .catch(() => {});
    } else {
      setCategoryName("");
    }
  }, [activeCategorySlug]);

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newPage === 1) {
        next.delete("page");
      } else {
        next.set("page", String(newPage));
      }
      return next;
    });
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

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

  const displayTitle = categoryName || (activeCategorySlug !== "all" ? activeCategorySlug : "Danh sách sản phẩm");

  return (
    <>
      <Seo
        title={categoryName ? `${categoryName} | Thành Công Việt Nam` : "Sản phẩm còi hú báo động"}
        description="Danh mục còi hú báo động công suất lớn Lion King chính hãng cho thủy điện, quân đội, PCCC — Thành Công Việt Nam."
      />
      <ProductListingLayout
        pageTitle={displayTitle}
        breadcrumbItems={[
          { label: "Trang chủ", path: "/" },
          { label: "Sản phẩm", path: "/san-pham" },
          ...(activeCategorySlug && activeCategorySlug !== "all"
            ? [{ label: categoryName || activeCategorySlug, path: null }]
            : []),
        ]}
        defaultCategoryId={activeCategorySlug}
        products={products}
        loading={loading}
        pageSize={12}
        totalItems={pagination.total}
        currentPage={pagination.page}
        onPageChange={handlePageChange}
        guideCard={guideCard}
      />
    </>
  );
}

import { useState, useEffect, useMemo } from "react";
import "./News.css";
import { Link, useSearchParams } from "react-router-dom";
import {
  LoadingOutlined,
  SearchOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  PhoneOutlined,
  MessageOutlined,
  FireOutlined,
  FolderOpenOutlined,
  SafetyCertificateOutlined,
  ReadOutlined
} from "@ant-design/icons";
import { Pagination } from "antd";
import { useCustomerPostsQuery } from "../../../../hooks/queries/customerQueries";
import { useScrollRestoration } from "../../../../hooks/useScrollRestoration";
import { preloadRouteChunks } from "../../../../utils/preloadChunks";

// Helper định dạng ngày DD/MM/YYYY
function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

// Helper lấy tên danh mục bài viết
function getCategoryName(article) {
  if (Array.isArray(article?.categoryNews) && article.categoryNews.length > 0) {
    return article.categoryNews[0]?.name || "Tin tức";
  }
  return article?.category || "Tin tức";
}

// Ước tính thời gian đọc bài viết
function estimateReadTime(text) {
  if (!text) return "3 phút đọc";
  const words = text.replace(/<[^>]*>/g, " ").split(/\s+/).length;
  const minutes = Math.max(2, Math.ceil(words / 200));
  return `${minutes} phút đọc`;
}

// Fallback ảnh nếu không có thumbnail
const DEFAULT_THUMBNAIL =
  "https://cdn0344.cdn4s.com/media/coi%20bao%20chay/bao-chay-to-lien-gia/hien/mo-hinh-to-lien-gia-an-toan-pccc.jpg";

export default function News() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc trạng thái từ URL Search Params hoặc SessionStorage để nhớ trang khi quay lại
  const [currentPage, setCurrentPage] = useState(() => {
    const pUrl = parseInt(searchParams.get("page"), 10);
    if (!isNaN(pUrl) && pUrl > 0) return pUrl;
    const pStorage = parseInt(sessionStorage.getItem("tc_news_page"), 10);
    if (!isNaN(pStorage) && pStorage > 0) return pStorage;
    return 1;
  });

  const [selectedCategory, setSelectedCategory] = useState(() => {
    return (
      searchParams.get("category") ||
      sessionStorage.getItem("tc_news_category") ||
      "all"
    );
  });

  const [searchKeyword, setSearchKeyword] = useState(() => {
    return (
      searchParams.get("search") ||
      sessionStorage.getItem("tc_news_search") ||
      ""
    );
  });

  const { data: rawArticles = [], isLoading: loading } = useCustomerPostsQuery();
  const pageSize = 6;

  // Lấy các bài viết đã xuất bản
  const articles = useMemo(() => {
    if (!rawArticles || rawArticles.length === 0) return [];
    const publishedList = rawArticles.filter(
      (item) =>
        !item.status ||
        item.status === "PUBLISHED" ||
        item.status === 1 ||
        item.status === "1"
    );
    return publishedList.length > 0 ? publishedList : rawArticles;
  }, [rawArticles]);

  // Đồng bộ URL params khi user bấm Back / Forward
  useEffect(() => {
    const pUrl = parseInt(searchParams.get("page"), 10);
    const targetPage = !isNaN(pUrl) && pUrl > 0 ? pUrl : 1;
    setCurrentPage(targetPage);

    const catUrl = searchParams.get("category") || "all";
    setSelectedCategory(catUrl);

    const searchUrl = searchParams.get("search") || "";
    setSearchKeyword(searchUrl);
  }, [searchParams]);

  // Khôi phục vị trí cuộn khi dữ liệu bài viết đã sẵn sàng
  useScrollRestoration(!loading);

  // Trích xuất danh sách các chuyên mục duy nhất từ bài viết
  const categoriesList = useMemo(() => {
    const map = new Map();
    articles.forEach((art) => {
      const catName = getCategoryName(art);
      map.set(catName, (map.get(catName) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [articles]);

  // Lọc bài viết theo danh mục và từ khóa tìm kiếm
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // Lọc danh mục
      const matchCat =
        selectedCategory === "all" || getCategoryName(art) === selectedCategory;

      // Lọc từ khóa
      const kw = searchKeyword.trim().toLowerCase();
      const matchKw =
        !kw ||
        (art.title && art.title.toLowerCase().includes(kw)) ||
        (art.excerpt && art.excerpt.toLowerCase().includes(kw));

      return matchCat && matchKw;
    });
  }, [articles, selectedCategory, searchKeyword]);

  // Xử lý chuyển trang & lưu vào URL + SessionStorage
  const handlePageChange = (page) => {
    setCurrentPage(page);
    sessionStorage.setItem("tc_news_page", String(page));
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (page > 1) {
          next.set("page", String(page));
        } else {
          next.delete("page");
        }
        return next;
      },
      { replace: true }
    );
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  // Xử lý đổi chuyên mục
  const handleCategoryChange = (catName) => {
    setSelectedCategory(catName);
    setCurrentPage(1);
    sessionStorage.setItem("tc_news_category", catName);
    sessionStorage.setItem("tc_news_page", "1");
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (catName !== "all") {
          next.set("category", catName);
        } else {
          next.delete("category");
        }
        next.delete("page");
        return next;
      },
      { replace: true }
    );
  };

  // Xử lý tìm kiếm
  const handleSearchChange = (kw) => {
    setSearchKeyword(kw);
    setCurrentPage(1);
    sessionStorage.setItem("tc_news_search", kw);
    sessionStorage.setItem("tc_news_page", "1");
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (kw.trim()) {
          next.set("search", kw.trim());
        } else {
          next.delete("search");
        }
        next.delete("page");
        return next;
      },
      { replace: true }
    );
  };

  // Phân trang
  const totalArticles = filteredArticles.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedArticles = filteredArticles.slice(
    startIndex,
    startIndex + pageSize
  );

  return (
    <div className="tc-news-portal">
      <div className="tc-news-portal-inner">
        {/* ═══════════════════════════════════════════
            TOP HEADER BANNER & SEARCH BAR
            ═══════════════════════════════════════════ */}
        <div className="tc-news-top-banner">
          <div className="tc-news-banner-content">
            <div className="tc-news-badge-skew">
              <FireOutlined className="tc-badge-icon" />
              <span>TIN TỨC & KIẾN THỨC CHUYÊN NGÀNH</span>
            </div>
            <h1 className="tc-news-main-heading">
              Cập nhật quy chuẩn PCCC, hướng dẫn kỹ thuật & giải pháp an toàn
            </h1>
            <p className="tc-news-subheading">
              Tổng hợp các bài viết chuyên sâu từ đội ngũ kỹ sư Thành Công Việt Nam về hệ thống còi hú báo động, thiết bị chữa cháy và cứu hộ cứu nạn.
            </p>
          </div>

          {/* Thanh tìm kiếm nhanh */}
          <div className="tc-news-search-box">
            <SearchOutlined className="tc-news-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết, quy chuẩn, kỹ thuật..."
              value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="tc-news-search-input"
            />
            {searchKeyword && (
              <button
                type="button"
                className="tc-news-search-clear"
                onClick={() => handleSearchChange("")}
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            CATEGORY FILTER TABS
            ═══════════════════════════════════════════ */}
        <div className="tc-news-tabs-bar">
          <button
            type="button"
            className={`tc-news-tab-btn ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => handleCategoryChange("all")}
          >
            Tất cả ({articles.length})
          </button>

          {categoriesList.map(({ name, count }) => (
            <button
              key={name}
              type="button"
              className={`tc-news-tab-btn ${selectedCategory === name ? "active" : ""}`}
              onClick={() => handleCategoryChange(name)}
            >
              {name} ({count})
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════
            MAIN 2-COLUMN LAYOUT
            ═══════════════════════════════════════════ */}
        <div className="tc-news-main-grid">
          {/* CỘT TRÁI: DANH SÁCH BÀI VIẾT DẠNG THẺ NGANG */}
          <main className="tc-news-feed-col">
            {loading ? (
              <div className="tc-news-loading-card">
                <LoadingOutlined spin style={{ fontSize: 40, color: "#d90429" }} />
                <p>Đang tải danh sách bài viết...</p>
              </div>
            ) : paginatedArticles.length > 0 ? (
              <div className="tc-news-feed-list">
                {paginatedArticles.map((article, idx) => {
                  const articleSlug = article.slug || article.id;
                  const linkPath = `/tin-tuc/${articleSlug}`;
                  const categoryName = getCategoryName(article);
                  const displayDate = formatDate(
                    article.publishedAt || article.createdAt || article.date
                  );
                  const thumbUrl =
                    article.thumbnailUrl || article.image || DEFAULT_THUMBNAIL;
                  const readTime = estimateReadTime(article.content || article.excerpt);

                  return (
                    <article
                      key={article.id || articleSlug || idx}
                      className="tc-news-feed-card"
                      onMouseEnter={() => {
                        try {
                          preloadRouteChunks.newsDetail?.();
                        } catch {}
                      }}
                    >
                      {/* Ảnh bài viết bên trái */}
                      <div className="tc-news-card-thumb-wrap">
                        <Link
                          to={linkPath}
                          state={{
                            fromPage: currentPage,
                            fromCategory: selectedCategory,
                            fromSearch: searchKeyword
                          }}
                          className="tc-news-card-thumb-link"
                        >
                          <img
                            src={thumbUrl}
                            alt={article.title}
                            className="tc-news-card-thumb"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.target.src = DEFAULT_THUMBNAIL;
                            }}
                          />
                          <div className="tc-news-card-thumb-overlay">
                            <span>Đọc bài viết <ArrowRightOutlined /></span>
                          </div>
                        </Link>
                      </div>

                      {/* Nội dung bên phải */}
                      <div className="tc-news-card-body">
                        {/* Hàng Meta: Badge danh mục + Ngày đăng + Thời gian đọc */}
                        <div className="tc-news-card-meta-row">
                          <span
                            className="tc-news-pill-badge"
                            onClick={() => handleCategoryChange(categoryName)}
                            title={`Lọc chuyên mục ${categoryName}`}
                          >
                            <FolderOpenOutlined className="tc-pill-icon" />
                            {categoryName}
                          </span>

                          {displayDate && (
                            <span className="tc-news-meta-item">
                              <CalendarOutlined className="tc-meta-icon" />
                              {displayDate}
                            </span>
                          )}

                          <span className="tc-news-meta-item tc-meta-readtime">
                            <ClockCircleOutlined className="tc-meta-icon" />
                            {readTime}
                          </span>
                        </div>

                        {/* Tiêu đề bài viết */}
                        <h2 className="tc-news-card-title">
                          <Link
                            to={linkPath}
                            state={{
                              fromPage: currentPage,
                              fromCategory: selectedCategory,
                              fromSearch: searchKeyword
                            }}
                            title={article.title}
                          >
                            {article.title}
                          </Link>
                        </h2>

                        {/* Tóm tắt bài viết */}
                        {article.excerpt && (
                          <p className="tc-news-card-excerpt">
                            {article.excerpt}
                          </p>
                        )}

                        {/* Nút đọc tiếp */}
                        <div className="tc-news-card-footer">
                          <Link
                            to={linkPath}
                            state={{
                              fromPage: currentPage,
                              fromCategory: selectedCategory,
                              fromSearch: searchKeyword
                            }}
                            className="tc-news-btn-read"
                          >
                            <span>Xem chi tiết</span>
                            <ArrowRightOutlined className="tc-arrow-hover" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="tc-news-empty-box">
                <ReadOutlined className="tc-empty-icon" />
                <h3>Không tìm thấy bài viết phù hợp</h3>
                <p>
                  Không có bài viết nào khớp với chuyên mục hoặc từ khóa bạn đang tìm kiếm.
                </p>
                <button
                  type="button"
                  className="tc-news-btn-reset"
                  onClick={() => {
                    handleCategoryChange("all");
                    handleSearchChange("");
                  }}
                >
                  Xóa bộ lọc & Xem tất cả bài viết
                </button>
              </div>
            )}

            {/* Phân trang bài viết */}
            {totalArticles > pageSize && (
              <div className="tc-news-pagination-wrap">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalArticles}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            )}
          </main>

          {/* CỘT PHẢI: WIDGETS TƯ VẤN, DANH MỤC & SẢN PHẨM TIÊU BIỂU */}
          <aside className="tc-news-sidebar-col">
            {/* Widget 1: Hotline Tư Vấn Kỹ Thuật 24/7 */}
            <div className="tc-widget-box tc-widget-hotline">
              <div className="tc-widget-header">
                <PhoneOutlined className="tc-widget-icon" />
                <h3>TƯ VẤN KỸ THUẬT & DỰ ÁN</h3>
              </div>
              <div className="tc-widget-body">
                <p className="tc-hotline-desc">
                  Liên hệ trực tiếp với kỹ sư giải pháp để nhận bản vẽ nguyên lý và báo giá còi hú cảnh báo:
                </p>
                <a href="tel:0865130088" className="tc-hotline-call-btn">
                  <PhoneOutlined />
                  <span>0865.130.088</span>
                </a>
                <span className="tc-hotline-time">Phục vụ 24/7 (Kể cả ngày nghỉ, lễ)</span>
              </div>
            </div>

            {/* Widget 2: Cam kết năng lực Thành Công VN */}
            <div className="tc-widget-box tc-widget-trust">
              <div className="tc-widget-header">
                <SafetyCertificateOutlined className="tc-widget-icon" />
                <h3>CAM KẾT CHẤT LƯỢNG</h3>
              </div>
              <ul className="tc-trust-list">
                <li>
                  <span className="tc-trust-check">✓</span>
                  <span>Đầy đủ chứng nhận CO, CQ chuẩn quốc tế.</span>
                </li>
                <li>
                  <span className="tc-trust-check">✓</span>
                  <span>Bảo hành chính hãng 12-24 tháng trên toàn quốc.</span>
                </li>
                <li>
                  <span className="tc-trust-check">✓</span>
                  <span>Hỗ trợ kỹ thuật lắp đặt & nghiệm thu công trình.</span>
                </li>
                <li>
                  <span className="tc-trust-check">✓</span>
                  <span>Chiết khấu hấp dẫn cho nhà thầu, dự án PCCC.</span>
                </li>
              </ul>
            </div>

            {/* Widget 3: Nút yêu cầu tư vấn nhanh */}
            <div className="tc-widget-cta-banner">
              <div className="tc-cta-inner">
                <h4>Cần Báo Giá Trọn Gói Dự Án?</h4>
                <p>Gửi yêu cầu để nhận dự toán chi tiết và bản vẽ nguyên lý trong 15 phút.</p>
                <Link to="/lien-he" className="tc-cta-btn">
                  <MessageOutlined />
                  <span>Yêu cầu báo giá ngay</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
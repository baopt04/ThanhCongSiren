import { useState, useEffect, useMemo } from "react";
import "./News.css";
import { Link } from "react-router-dom";
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
import { getAllPostsForCustomer } from "../../../../services/customer/CustomerPostService";

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
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await getAllPostsForCustomer();
        const rawList =
          res?.data?.content ||
          res?.data ||
          res?.content ||
          (Array.isArray(res) ? res : []);

        const list = Array.isArray(rawList) ? rawList : [];

        if (isMounted) {
          const publishedList = list.filter(
            (item) =>
              !item.status ||
              item.status === "PUBLISHED" ||
              item.status === 1 ||
              item.status === "1"
          );
          setArticles(publishedList.length > 0 ? publishedList : list);
        }
      } catch (error) {
        console.error("Error loading posts from API:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();
    return () => {
      isMounted = false;
    };
  }, []);

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

  // Reset trang về 1 khi đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchKeyword]);

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
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="tc-news-search-input"
            />
            {searchKeyword && (
              <button
                type="button"
                className="tc-news-search-clear"
                onClick={() => setSearchKeyword("")}
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
            onClick={() => setSelectedCategory("all")}
          >
            Tất cả ({articles.length})
          </button>

          {categoriesList.map(({ name, count }) => (
            <button
              key={name}
              type="button"
              className={`tc-news-tab-btn ${selectedCategory === name ? "active" : ""}`}
              onClick={() => setSelectedCategory(name)}
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
                    >
                      {/* Ảnh bài viết bên trái */}
                      <div className="tc-news-card-thumb-wrap">
                        <Link to={linkPath} className="tc-news-card-thumb-link">
                          <img
                            src={thumbUrl}
                            alt={article.title}
                            className="tc-news-card-thumb"
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
                            onClick={() => setSelectedCategory(categoryName)}
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
                          <Link to={linkPath} title={article.title}>
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
                          <Link to={linkPath} className="tc-news-btn-read">
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
                    setSelectedCategory("all");
                    setSearchKeyword("");
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
                  onChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
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
                  Hỗ trợ tư vấn giải pháp lắp đặt còi hú xả lũ, trạm truyền thanh cảnh báo và nghiệm thu PCCC:
                </p>
                <a href="tel:0865130088" className="tc-hotline-phone-btn">
                  <PhoneOutlined /> 0865.130.088
                </a>
                <div className="tc-hotline-subphones">
                  <span>Hà Nội: <strong>02466.873.822</strong></span>
                  <span>Hotline 2: <strong>0865.130.088</strong></span>
                </div>
                <a
                  href="https://zalo.me/0865130088"
                  target="_blank"
                  rel="noreferrer"
                  className="tc-hotline-zalo-btn"
                >
                  <MessageOutlined /> Chat Zalo Kỹ Thuật
                </a>
              </div>
            </div>

            {/* Widget 2: Chuyên mục bài viết */}
            {categoriesList.length > 0 && (
              <div className="tc-widget-box tc-widget-categories">
                <div className="tc-widget-header">
                  <FolderOpenOutlined className="tc-widget-icon" />
                  <h3>CHỦ ĐỀ ĐƯỢC QUAN TÂM</h3>
                </div>
                <div className="tc-widget-body">
                  <ul className="tc-widget-cat-list">
                    <li
                      className={`tc-widget-cat-item ${selectedCategory === "all" ? "active" : ""}`}
                      onClick={() => setSelectedCategory("all")}
                    >
                      <span>Tất cả chủ đề</span>
                      <span className="tc-widget-cat-count">{articles.length}</span>
                    </li>
                    {categoriesList.map(({ name, count }) => (
                      <li
                        key={name}
                        className={`tc-widget-cat-item ${selectedCategory === name ? "active" : ""}`}
                        onClick={() => setSelectedCategory(name)}
                      >
                        <span>{name}</span>
                        <span className="tc-widget-cat-count">{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Widget 3: CTA sản phẩm */}
            <div className="tc-widget-box tc-widget-products">
              <div className="tc-widget-header">
                <SafetyCertificateOutlined className="tc-widget-icon" />
                <h3>THIẾT BỊ BÁO ĐỘNG</h3>
              </div>
              <div className="tc-widget-body">
                <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: 13, lineHeight: 1.5 }}>
                  Xem đầy đủ danh mục còi hú báo động Lion King chính hãng và thiết bị PCCC.
                </p>
                <Link to="/san-pham" className="tc-sidebar-view-all-prod">
                  Xem tất cả thiết bị &rarr;
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
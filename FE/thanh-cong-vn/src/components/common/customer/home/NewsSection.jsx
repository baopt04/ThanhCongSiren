import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { PlayCircleFilled } from "@ant-design/icons";
import "./NewsSection.css";
import { useCustomerPostsQuery } from "../../../../hooks/queries/customerQueries";
import { optimizeCloudinary, cloudinarySrcSet } from "../../../../utils/cloudinary";

import sapaImg360 from "../../../../assets/images/projects/sapa-thuy-dien-360.webp";
import sapaImg720 from "../../../../assets/images/projects/sapa-thuy-dien-720.webp";

const FALLBACK_FEATURED = {
  id: "featured-1",
  title: "Lắp đặt và bàn giao hệ thống còi hú báo xả lũ cho công trình thủy điện Sapa",
  slug: "lap-dat-coi-bao-xa-lu-thuy-dien-sapa",
  image: sapaImg720,
  srcSet: `${sapaImg360} 360w, ${sapaImg720} 720w`,
};

const FALLBACK_LIST = [
  {
    id: "news-1",
    title: "Thử nghiệm thực tế còi báo động chống cháy nổ Lion King tại mỏ khai thác",
    slug: "thu-nghiem-coi-chong-chay-no",
    image: sapaImg360,
    srcSet: `${sapaImg360} 360w, ${sapaImg720} 720w`,
  },
  {
    id: "news-2",
    title: "Bàn giao thiết bị đệm hơi cứu hộ và quạt hút khói cho lực lượng PCCC",
    slug: "ban-giao-dem-hoi-cuu-ho-pccc",
    image: sapaImg360,
    srcSet: `${sapaImg360} 360w, ${sapaImg720} 720w`,
  },
  {
    id: "news-3",
    title: "Video thực tế: Vận hành còi hú báo động xé gió công suất lớn ngoài trời (video)",
    slug: "video-van-hanh-coi-hu-xe-gio",
    image: sapaImg360,
    srcSet: `${sapaImg360} 360w, ${sapaImg720} 720w`,
    isVideo: true,
  },
];

export const NewsSection = memo(function NewsSection() {
  const { data: postsList = [] } = useCustomerPostsQuery();

  const { featuredPost, sidePosts } = useMemo(() => {
    if (postsList && postsList.length > 0) {
      const rawFeaturedImg = postsList[0].thumbnailUrl || postsList[0].image || FALLBACK_FEATURED.image;
      const featured = {
        id: postsList[0].id,
        title: postsList[0].title,
        slug: postsList[0].slug || postsList[0].id,
        image: optimizeCloudinary(rawFeaturedImg, 600),
        srcSet: cloudinarySrcSet(rawFeaturedImg, [400, 600]) || (rawFeaturedImg === FALLBACK_FEATURED.image ? FALLBACK_FEATURED.srcSet : undefined),
      };

      const side = postsList.slice(1, 4).map((item, idx) => {
        const fallbackItem = FALLBACK_LIST[idx] || FALLBACK_LIST[0];
        const rawSideImg = item.thumbnailUrl || item.image || fallbackItem.image;
        return {
          id: item.id,
          title: item.title,
          slug: item.slug || item.id,
          image: optimizeCloudinary(rawSideImg, 300),
          srcSet: cloudinarySrcSet(rawSideImg, [180, 360]) || fallbackItem.srcSet,
          isVideo: idx === 2,
        };
      });

      // Pad if fewer than 3 side items
      while (side.length < 3) {
        side.push(FALLBACK_LIST[side.length]);
      }

      return { featuredPost: featured, sidePosts: side };
    }

    return {
      featuredPost: FALLBACK_FEATURED,
      sidePosts: FALLBACK_LIST,
    };
  }, [postsList]);

  return (
    <section className="tc-home-news-section" id="section-tin-tuc">
      <div className="tc-home-news-container">
        {/* Section Header */}
        <div className="tc-section-header-modern">
          <div className="tc-section-title-wrap">
            <span className="tc-title-indicator" />
            <h2 className="tc-section-title-text">Tin tức</h2>
          </div>
          <Link to="/tin-tuc" className="tc-section-more-link">
            Xem tất cả
          </Link>
        </div>

        {/* 2-Column News Layout */}
        <div className="tc-news-split-grid">
          {/* Left Column: Big Featured Card */}
          <div className="tc-news-featured-card">
            <Link
              to={`/tin-tuc/${featuredPost.slug || featuredPost.id}`}
              className="tc-news-featured-thumb-wrap"
            >
              {featuredPost.image ? (
                <img
                  src={featuredPost.image}
                  srcSet={featuredPost.srcSet}
                  sizes="(max-width: 768px) 100vw, 600px"
                  alt={featuredPost.title}
                  className="tc-news-featured-img"
                  loading="lazy"
                  decoding="async"
                  width={600}
                  height={380}
                />
              ) : null}
              <div className="tc-news-featured-label">
                <span>Tin nổi bật</span>
              </div>
            </Link>
            <h3 className="tc-news-featured-title">
              <Link to={`/tin-tuc/${featuredPost.slug || featuredPost.id}`}>
                {featuredPost.title}
              </Link>
            </h3>
          </div>

          {/* Right Column: 3 Horizontal List Items */}
          <div className="tc-news-side-list">
            {sidePosts.map((post, idx) => (
              <div key={post.id || idx} className="tc-news-side-card">
                <Link
                  to={`/tin-tuc/${post.slug || post.id}`}
                  className="tc-news-side-thumb-wrap"
                >
                  {post.image ? (
                    <img
                      src={post.image}
                      srcSet={post.srcSet}
                      sizes="(max-width: 768px) 120px, 180px"
                      alt={post.title}
                      className="tc-news-side-img"
                      loading="lazy"
                      decoding="async"
                      width={180}
                      height={120}
                    />
                  ) : null}
                  <div className="tc-news-side-thumb-label">
                    <span>{post.isVideo ? "Video" : "Ảnh"}</span>
                  </div>
                  {post.isVideo && (
                    <div className="tc-news-video-badge">
                      <PlayCircleFilled />
                    </div>
                  )}
                </Link>

                <div className="tc-news-side-info">
                  <h4 className="tc-news-side-title">
                    <Link to={`/tin-tuc/${post.slug || post.id}`}>
                      {post.title}
                    </Link>
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

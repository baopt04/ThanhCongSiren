import "./NewsSection.css";
import { Link } from "react-router-dom";
import { PlayCircleFilled, PlayCircleOutlined, RightOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useCustomerPostsQuery } from "../../../../hooks/queries/customerQueries";

export function NewsSection() {
  const [activeVideo, setActiveVideo] = useState(null);
  const [newsList, setNewsList] = useState([]);
  const [videoProjects, setVideoProjects] = useState([]);

  const { data: postsList = [] } = useCustomerPostsQuery();

  useEffect(() => {
    if (!postsList || postsList.length === 0) return;

    setNewsList(
      postsList.slice(0, 5).map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug || item.id,
        image: item.thumbnailUrl || item.image || "",
      }))
    );

    // Dùng bài có thumbnail làm danh sách "video dự án"
    const videos = postsList
      .filter((item) => item.thumbnailUrl || item.image)
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        title: item.title,
        videoUrl: item.thumbnailUrl || item.image,
        slug: item.slug || item.id,
      }));
    setVideoProjects(videos);
    if (videos.length > 0 && !activeVideo) setActiveVideo(videos[0]);
  }, [postsList]);

  if (newsList.length === 0 && videoProjects.length === 0) {
    return null;
  }

  return (
    <section className="tc-news-section">
      <div className="tc-news-container">
        <div className="tc-news-header">
          <div className="tc-news-tab-badge">
            <span>TIN TỨC - VIDEO</span>
          </div>
          <div className="tc-news-header-line"></div>
          <Link to="/tin-tuc" className="tc-news-view-all">
            Xem tất cả <RightOutlined />
          </Link>
        </div>

        <div className="tc-news-grid">
          <div className="tc-news-left-col">
            {newsList.map((item) => (
              <div key={item.id} className="tc-news-item">
                <div className="tc-news-item-info">
                  <h3 className="tc-news-item-title">
                    <Link to={`/tin-tuc/${item.slug}`}>{item.title}</Link>
                  </h3>
                </div>
                {item.image && (
                  <div className="tc-news-item-thumb">
                    <Link to={`/tin-tuc/${item.slug}`}>
                      <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          {activeVideo && (
            <div className="tc-news-right-col">
              <div className="tc-video-player-box">
                <div className="tc-video-thumb-container">
                  <img
                    src={activeVideo.videoUrl}
                    alt={activeVideo.title}
                    className="tc-video-thumb"
                    loading="lazy"
                    decoding="async"
                  />
                  <Link
                    to={`/tin-tuc/${activeVideo.slug}`}
                    className="tc-video-play-btn"
                    aria-label="Xem bài viết"
                  >
                    <PlayCircleFilled />
                  </Link>
                </div>
              </div>

              <div className="tc-video-playlist">
                {videoProjects.map((vid) => (
                  <div
                    key={vid.id}
                    className={`tc-video-playlist-item ${activeVideo.id === vid.id ? "active" : ""}`}
                    onClick={() => setActiveVideo(vid)}
                    onKeyDown={(e) => e.key === "Enter" && setActiveVideo(vid)}
                    role="button"
                    tabIndex={0}
                  >
                    <PlayCircleOutlined className="tc-play-icon-red" />
                    <span className="tc-video-item-title">{vid.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

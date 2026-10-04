import { useEffect, useState } from "react";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { Outlet } from "react-router-dom";
import { PhoneOutlined, MessageOutlined, FileTextOutlined, CloseOutlined } from "@ant-design/icons";
import { RouteSkeleton } from "../../components/common/RouteSkeleton";
import "./MainLayout.css";

const ZALO_URL = "https://zalo.me/0865130088";
const HOTLINE_DISPLAY = "0865.130.088";
const HOTLINE_TEL = "0865130088";

export function MainLayout() {
  const [chatOpen, setChatOpen] = useState(false);
  const [showFloatWidgets, setShowFloatWidgets] = useState(false);

  // Hoãn widget nổi / chat tới sau khi trang render (đỡ chiếm main thread lúc mở trang)
  useEffect(() => {
    let idleId;
    let timerId;
    const show = () => setShowFloatWidgets(true);

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(show, { timeout: 2500 });
    } else {
      timerId = window.setTimeout(show, 1200);
    }

    return () => {
      if (idleId && window.cancelIdleCallback) window.cancelIdleCallback(idleId);
      if (timerId) window.clearTimeout(timerId);
    };
  }, []);

  useEffect(() => {
    if (!showFloatWidgets) return;
    const timer = window.setTimeout(() => setChatOpen(true), 1500);
    return () => window.clearTimeout(timer);
  }, [showFloatWidgets]);

  return (
    <div className="tc-layout">
      <Header />
      <main className="tc-layout-main">
        <RouteSkeleton layout="customer" duration={400}>
          <Outlet />
        </RouteSkeleton>
      </main>

      {showFloatWidgets && (
        <>
          {/* Floating contact — giữa cạnh phải */}
          <div className="tc-floating-widget" aria-label="Liên hệ nhanh">
            <a
              href={ZALO_URL}
              target="_blank"
              rel="noreferrer"
              className="tc-float-btn tc-zalo-btn"
              title="Chat Zalo Tư Vấn Báo Giá"
            >
              <MessageOutlined />
              <span className="tc-float-tooltip">Chat Zalo</span>
            </a>

            <a
              href={`tel:${HOTLINE_TEL}`}
              className="tc-float-btn tc-phone-btn"
              title={`Gọi Hotline ${HOTLINE_DISPLAY}`}
            >
              <PhoneOutlined />
              <span className="tc-float-tooltip">{HOTLINE_DISPLAY}</span>
            </a>

            <a
              href="/lien-he"
              className="tc-float-btn tc-top-btn"
              title="Yêu cầu báo giá"
            >
              <FileTextOutlined />
              <span className="tc-float-tooltip">Báo Giá</span>
            </a>
          </div>

          {/* Widget Zalo kiểu chat bubble */}
          <div className="tc-zalo-chat-widget">
            {chatOpen && (
              <div className="tc-zalo-chat-bubble" role="dialog" aria-label="Tin nhắn hỗ trợ">
                <button
                  type="button"
                  className="tc-zalo-chat-close"
                  aria-label="Đóng"
                  onClick={() => setChatOpen(false)}
                >
                  <CloseOutlined />
                </button>
                <p>Xin chào! tôi có thể giúp gì cho bạn?</p>
                <p>Nếu bạn chờ quá lâu vui lòng liên hệ</p>
                <p>hoặc add zalo số điện thoại:</p>
                <a href={`tel:${HOTLINE_TEL}`} className="tc-zalo-chat-phone">
                  {HOTLINE_DISPLAY.replace(/\./g, "")}
                </a>
              </div>
            )}

            <a
              href={ZALO_URL}
              target="_blank"
              rel="noreferrer"
              className="tc-zalo-chat-launcher"
              title="Chat Zalo"
              onClick={() => setChatOpen(true)}
            >
              <span className="tc-zalo-chat-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48" width="28" height="28" fill="none">
                  <path
                    d="M24 8C14.6 8 7 14.5 7 22.5c0 4.6 2.5 8.7 6.4 11.4-.2 1.8-.9 4.2-2.6 6.1 0 0 4.1-.5 7.3-2.7 1.8.5 3.8.7 5.9.7 9.4 0 17-6.5 17-14.5S33.4 8 24 8z"
                    fill="#fff"
                  />
                  <path
                    d="M16.5 23.2c1.4 1.6 3.6 2.6 7.5 2.6s6.1-1 7.5-2.6"
                    stroke="#00b14f"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="tc-zalo-chat-badge">1</span>
            </a>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}

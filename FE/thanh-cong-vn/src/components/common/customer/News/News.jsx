import "./News.css";
import { Link } from "react-router-dom";
export default function News() {
    return (
        <div className="news-container">
            <h2>Tin tức báo cháy</h2>
            <div className="news-grid">

                <div className="news-card">
                    <Link to="/">
                        <img
                            src="https://cdn0344.cdn4s.com/media/coi%20bao%20chay/bao-chay-to-lien-gia/hien/mo-hinh-to-lien-gia-an-toan-pccc.jpg"
                            alt=""
                        />
                    </Link>

                    <div className="news-content">
                        <h3>Thiết bị báo cháy mới nhất 2026</h3>
                        <p>
                            Các thiết bị báo cháy thông minh đang được sử dụng
                            nhiều trong các tòa nhà và nhà xưởng...
                        </p>
                        <span className="news-date">12/03/2026</span>
                    </div>
                </div>

                <div className="news-card">
                    <img
                        src="https://cdn0344.cdn4s.com/media/coi%20bao%20chay/bao-chay-to-lien-gia/tuyen-truyen-bao-chay-to-lien-gia-cho-cac-ho-dan.jpg"
                        alt=""
                    />

                    <div className="news-content">
                        <h3>Hướng dẫn lắp đặt còi hú báo động</h3>
                        <p>
                            Việc lắp đặt còi hú báo động đúng cách sẽ giúp
                            cảnh báo nhanh khi có sự cố...
                        </p>
                        <span className="news-date">11/03/2026</span>
                    </div>
                </div>
                <div className="news-card">
                    <img
                        src="https://cdn0344.cdn4s.com/media/coi%20bao%20chay/bao-chay-to-lien-gia/hien/mo-hinh-to-lien-gia-an-toan-pccc.jpg"
                        alt=""
                    />

                    <div className="news-content">
                        <h3>Thiết bị báo cháy mới nhất 2026</h3>
                        <p>
                            Các thiết bị báo cháy thông minh đang được sử dụng
                            nhiều trong các tòa nhà và nhà xưởng...
                        </p>
                        <span className="news-date">12/03/2026</span>
                    </div>
                </div>

                <div className="news-card">
                    <img
                        src="https://cdn0344.cdn4s.com/media/coi%20bao%20chay/bao-chay-to-lien-gia/tuyen-truyen-bao-chay-to-lien-gia-cho-cac-ho-dan.jpg"
                        alt=""
                    />

                    <div className="news-content">
                        <h3>Hướng dẫn lắp đặt còi hú báo động</h3>
                        <p>
                            Việc lắp đặt còi hú báo động đúng cách sẽ giúp
                            cảnh báo nhanh khi có sự cố...
                        </p>
                        <span className="news-date">11/03/2026</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
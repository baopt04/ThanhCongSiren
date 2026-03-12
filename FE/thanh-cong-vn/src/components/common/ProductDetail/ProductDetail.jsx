import { useState } from "react";
import "./ProductDetail.css";

export default function ProductDetail() {
    const images = [
        "https://cdn0344.cdn4s.com/media/2022/coi%20bao%20dong/jdw245pk/coi-bao-dong-lk-jdw245pk-khu-dan-cu-thuy-dien-song-hinh.jpg",
        "https://cdn0344.cdn4s.com/thumbs/2022/coi%20bao%20dong/jdw245pk/coi-hu-bao-xa-lu-tren-dap-ho-chua-nuoc-thuy-dien-sapa_thumb_150.jpg",
        "https://cdn0344.cdn4s.com/thumbs/2022/coi%20bao%20dong/jdw245pk/coi-bao-dong-lk-jdw245pk-lap-tai-nha-may-thuy-dien-song-hinh_thumb_150.jpg",
        "https://cdn0344.cdn4s.com/thumbs/2020/11/coi-hu-cong-suat-lon-lk-jdw245pk_thumb_150.jpg"
    ];

    const [activeImg, setActiveImg] = useState(images[0]);
    const [activeTab, setActiveTab] = useState("description");
    return (
        <div className="pd-container">

            <div className="pd-grid">

                {/* LEFT */}
                <div className="pd-gallery">

                    <div className="pd-main-image">
                        <div className="pd-main-image-inner">
                            <img src={activeImg} alt="" />
                        </div>
                    </div>

                    <div className="pd-thumb-list">
                        {images.map((img, i) => (
                            <img
                                key={i}
                                src={img}
                                alt=""
                                className={activeImg === img ? "active" : ""}
                                onClick={() => setActiveImg(img)}
                            />
                        ))}
                    </div>

                </div>

                {/* RIGHT */}
                <div className="pd-info">

                    <h1 className="pd-title">
                        Còi hú báo động công suất lớn báo xả lũ LK-JDW245PK
                    </h1>

                    <div className="pd-price">
                        32.990.000đ
                    </div>

                    <div className="pd-meta">
                        <div>Mã sản phẩm: <span>LK-JDW245PK</span></div>
                        <div>Danh mục: <span>Còi hú báo động cỡ lớn</span></div>
                    </div>

                    <div className="pd-description">
                        Cung cấp Còi Hú Báo LK-JDW245PK công suất lớn 220v. Được sử dụng trong hệ
                        thống phòng cháy chữa cháy, báo xả lũ, báo động các thành phố lớn.
                    </div>

                    {/* Thông tin kích thước */}
                    <div className="pd-dimension">
                        <div>Cân nặng: <span>55kg</span></div>
                        <div>Chiều cao: <span>100cm</span></div>
                        <div>Chiều dài: <span>120cm</span></div>
                        <div>Chiều rộng: <span>110cm</span></div>
                    </div>

                    {/* Thông số */}
                    <div className="pd-spec">
                        <h3>Thông số chính</h3>
                        <ul>
                            <li>Độ ồn: 135 ± 2dB (A) @ 1M</li>
                            <li>Động cơ điện: 0.75kW, 220VAC, 50/60Hz</li>
                            <li>Cấp độ IP bảo vệ: sử dụng IP55</li>
                            <li>Tần số đầu ra: 530/580±20Hz</li>
                            <li>Bao gồm 20 loa phóng âm thanh</li>
                            <li>Trọng lượng: 55kg</li>
                            <li>Kích thước đóng gói : 110x110x100CM</li>
                        </ul>
                    </div>

                    {/* Ưu đãi */}
                    {/* <div className="pd-promo">
                        <h3>Ưu đãi</h3>
                        <ul>
                            <li>✔ Giảm 1.000.000đ khi thanh toán online</li>
                            <li>✔ Trả góp 0%</li>
                            <li>✔ Bảo hành chính hãng 12 tháng</li>
                        </ul>
                    </div> */}

                    <button className="pd-buy-btn">
                        MUA NGAY
                    </button>

                </div>

            </div>


            {/* Tabs */}
            <div className="pd-tabs">

                <div className="pd-tab-header">
                    <button
                        className={activeTab === "description" ? "active" : ""}
                        onClick={() => setActiveTab("description")}
                    >
                        Mô tả sản phẩm
                    </button>

                    <button
                        className={activeTab === "spec" ? "active" : ""}
                        onClick={() => setActiveTab("spec")}
                    >
                        Thông số kỹ thuật
                    </button>
                </div>

                <div className="pd-tab-content">

                    {activeTab === "description" && (
                        <>
                            <p>
                                Còi hú công suất lớn LK-JDW245PK là loại còi phát ra tiếng còi báo động đa hướng. Tiếng còi báo động kêu do động cơ điện quay tác động đến bộ phận phát, phát ra âm thanh đặc biệt và chất lượng có thể sử dụng để báo động, báo xả lũ trong các nhà máy thủy điện.
                                Âm thanh đặc biệt này có một âm lượng lớn, cao cung cấp độ tương phản với tiếng ồn xung quanh có thể phóng đi tới các khu vực dân cư dưới hạ lưu nhờ các loa phóng âm.
                            </p>

                            <div className="pd-description-image">
                                <img src="https://cdn0344.cdn4s.com/media/2022/coi%20bao%20dong/jdw245pk/coi-bao-dong-lk-jdw245pk-lap-tai-nha-may-thuy-dien-song-hinh.jpg" />
                            </div>

                            <p>
                                Thông tin chung về Còi hú công suất lớn LK-JDW245PK. Còi có thể
                                phát âm thanh lớn giúp cảnh báo trong các khu vực dân cư.
                            </p>
                            <p>
                                Thông tin chung về Còi hú công suất lớn LK-JDW245PK
                                Còi hú công suất lớn LK-JDW245PK có động cơ hoạt động với nguồn điện 220VAC.
                            </p>
                            <ul>
                                <li>Động cơ còi có một ngoại hình hấp dẫn và cao cấp chống ăn mòn</li>
                                <li>Sản phẩm có thể kết hợp với một bộ phận điều khiển và tạo ra một tiếng còi với độ ồn 135dB @ 1M, khoảng âm hiệu quả đạt được từ 2Km đến 3Km</li>
                                <li>Còi có thể được sử dụng trong hệ thống phòng cháy chữa cháy, báo xả lũ, báo động các thành phố lớn.</li>
                                <li>Còi hú báo động công suất lớn LK-JDW245PK có thể ngăn chặn sự xâm nhập của các vật rắn lớn hơn 1.0 mm. Ngăn chặn các đối tượng (công cụ, dây hoặc tương tự) với đường kính hoặc độ dày lớn hơn 1.0mm chạm vào bên trong.</li>

                            </ul>
                            <p>Còi hú được sử dụng trong:</p>
                            <ul>
                                <li>Hệ thống cảnh báo dân phòng của các thành phố lớn trên khắp thế giới</li>
                                <li>Hệ thống phòng cháy chữa cháy</li>
                                <li>Cảnh báo cháy trong hệ thống của cộng đồng, nhà máy, mỏ, các tòa nhà, vv
                                </li>
                                <li>Cảnh báo tai nạn của các hồ chứa, đập, nhà tù, các sân bay, quân đội, vv</li>
                            </ul>
                        </>
                    )}

                    {activeTab === "spec" && (
                        <ul className="pd-spec-list">
                            <li>Độ ồn: 135 ± 2dB (A) @ 1M</li>
                            <li>Động cơ điện: 0.75kW, 220VAC</li>
                            <li>Cấp độ IP bảo vệ: IP55</li>
                            <li>Tần số đầu ra: 530/580±20Hz</li>
                            <li>Bao gồm 20 loa phóng âm thanh</li>
                            <li>Trọng lượng: 55kg</li>
                            <li>Kích thước đóng gói: 110x110x100CM</li>
                        </ul>
                    )}
                    <div className="pd-content-video">
                        <p>Video thực tế sản phẩm:</p>

                        <iframe
                            width="560"
                            height="315"
                            src="https://www.youtube.com/embed/vzQlZfFuZF8"
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                    <div className="pd-contact-box">

                        <div className="pd-contact-title">
                            <span className="pd-phone-icon">📞</span>
                            Hãy liên hệ với chúng tôi để được tư vấn thêm
                        </div>

                        <div className="pd-contact-info">
                            <div>Hotline: <span>0865.130.088</span></div>
                            <div>Email: <span>coihubaodongvn@gmail.com</span></div>
                        </div>

                        <div className="pd-shipping">
                            Giao hàng toàn quốc - Miễn phí giao hàng nội thành Hà Nội với các đơn hàng trên 1 triệu đồng
                        </div>

                    </div>
                </div>

            </div>

        </div>
    );
}
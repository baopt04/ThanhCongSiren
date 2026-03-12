import "./HeroBanner.css";
import { Carousel } from "antd";
export function HeroBanner() {
  return (
    <div>
      <div className="hero-banner">
        <Carousel autoplay arrows>
          <div>
            <img
              src="https://cdn0344.cdn4s.com/media/banner/banner-thanh-cong-1.jpg"
              style={{ width: "100%", height: "36vw", objectFit: "cover" }}
            />
          </div>
          <div>
            <img
              src="	https://cdn0344.cdn4s.com/media/banner/banner-thanh-cong-2.jpg"
              style={{ width: "100%", height: "36vw", objectFit: "cover" }}
            />
          </div>
          <div>
            <img
              src="https://cdn0344.cdn4s.com/media/banner/banner-thanh-cong-3.jpg"
              style={{ width: "100%", height: "36vw", objectFit: "cover" }}
            />
          </div>

        </Carousel>
      </div>
      < section className="sd-hero" >
        <div className="sd-hero-main">
          <Carousel autoplay>
            <div>
              <img
                src="https://shopdunk.com/images/uploaded/airpods-3-tinh-nang/banner%20web%20shopdunk%20care-01.png"
                style={{ width: "100%", height: "166px", objectFit: "cover" }}
              />
            </div>

            <div>
              <img
                src="https://shopdunk.com/images/uploaded/airpods-3-tinh-nang/banner%20web%20shopdunk%20care-01.png"
                style={{ width: "100%", height: "166px", objectFit: "cover" }}
              />
            </div>
            <div>
              <img
                src="https://shopdunk.com/images/uploaded/airpods-3-tinh-nang/banner%20web%20shopdunk%20care-01.png"
                style={{ width: "100%", height: "166px", objectFit: "cover" }}
              />
            </div>
          </Carousel>
        </div>

        <div className="sd-hero-sub">
          <div className="sd-hero-sub-item">
            <h3>Còi báo động</h3>
            <p>Đa dạng các loại còi báo động chất lượng.</p>
          </div>
          <div className="sd-hero-sub-item">
            <h3>Thiết bị báo cháy</h3>
            <p>Đa dạng các hãng(HORING-DAHUA-YUNYANG-CHUNGMIE)</p>
          </div>
          <div className="sd-hero-sub-item">
            <h3>Đệm hơi-Máy thổi khí</h3>
            <p>Cung cấp đầy đủ các trang thiết bị cứu hộ-cứu nạn.</p>
          </div>
        </div>
      </section >
    </div>
  );
}


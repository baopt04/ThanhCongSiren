import "./Login.css";

export default function Login() {
    return (
        <div>
            <div className="breadcrumb">
                <div className="breadcrumb-inner">
                    Trang chủ › Đăng nhập
                </div>
            </div>

            <div className="login-page">
                <div className="login-container">

                    <div className="login-left">
                        <img
                            src="https://shopdunk.com/images/uploaded/banner/VNU_M492_08%201.jpeg"
                            alt="login"
                            className="login-image"
                        />
                    </div>

                    <div className="login-right">
                        <h2>Đăng nhập</h2>

                        <label>Tên đăng nhập:</label>
                        <input type="text" />

                        <label>Mật khẩu:</label>
                        <input type="password" />

                        <div className="login-options">
                            <label>
                                <input type="checkbox" />
                                Nhớ mật khẩu
                            </label>
                            <a href="#">Quên mật khẩu?</a>
                        </div>

                        <button className="login-btn">Đăng nhập</button>

                        <p className="register">
                            Bạn Chưa Có Tài Khoản? <a href="#">Tạo tài khoản ngay</a>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
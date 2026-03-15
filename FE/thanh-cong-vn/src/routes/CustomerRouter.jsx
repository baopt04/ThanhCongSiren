import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { HomePage } from "../pages/HomePage";
import { SirenPage } from "../pages/SirenPage";
import { FireAlarmPage } from "../pages/FireAlarmPage";
import { AirBlowerPage } from "../pages/AirBlowerPage";
import { AirMattressPage } from "../pages/AirMattressPage";
import ProductDetail from "../components/common/ProductDetail/ProductDetail";
import CartPage from "../pages/CartPage";
import { NewsPage } from "../pages/NewsPage";
import Login from "../components/common/Login/Login";
export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/coi-hu-bao-dong" element={<SirenPage />} />
                    <Route path="/thiet-bi-bao-chay" element={<FireAlarmPage />} />
                    <Route path="/may-thoi-khi" element={<AirBlowerPage />} />
                    <Route path="/dem-hoi-cuu-ho-cuu-nan" element={<AirMattressPage />} />
                    <Route path="/coi-hu-bao-dong/coi-hu" element={<ProductDetail />} />
                    <Route path="/gio-hang" element={<CartPage />} />
                    <Route path="/tin-tuc" element={<NewsPage />} />
                    <Route path="/dang-nhap" element={<Login />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
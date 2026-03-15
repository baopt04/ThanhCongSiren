import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "../layouts/customer/MainLayout";
import { HomePage } from "../pages/customer/HomePage";
import { SirenPage } from "../pages/customer/SirenPage";
import { FireAlarmPage } from "../pages/customer/FireAlarmPage";
import { AirBlowerPage } from "../pages/customer/AirBlowerPage";
import { AirMattressPage } from "../pages/customer/AirMattressPage";
import ProductDetail from "../components/common/customer/ProductDetail/ProductDetail";
import CartPage from "../pages/customer/CartPage";
import { NewsPage } from "../pages/customer/NewsPage";
import Login from "../components/common/customer/Login/Login";
import { AdminLayout } from "../layouts/admin/AdminLayout";
import { DashboardPage } from "../pages/admin/DashboardPage";
import { BrandsPage } from "../pages/admin/BrandsPage";
import { CategoriesPage } from "../pages/admin/CategoriesPage";
import { ProductsPage } from "../pages/admin/ProductsPage";
import { ProductSpecsPage } from "../pages/admin/ProductSpecsPage";
import { NewsCategoriesPage } from "../pages/admin/NewsCategoriesPage";
import { PostsPage } from "../pages/admin/PostsPage";
import { UsersPage } from "../pages/admin/UsersPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer routes */}
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
        {/* Admin dashboard routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="product-specs" element={<ProductSpecsPage />} />
          <Route path="news-categories" element={<NewsCategoriesPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

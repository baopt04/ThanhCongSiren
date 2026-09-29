import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ScrollToTop } from "../components/common/ScrollToTop";
import { MainLayout } from "../layouts/customer/MainLayout";
import { RouteSkeleton } from "../components/common/RouteSkeleton";
import { PrivateRoute } from "../components/common/PrivateRoute";

const HomePage = lazy(() =>
  import("../pages/customer/HomePage").then((m) => ({ default: m.HomePage }))
);
const SirenPage = lazy(() =>
  import("../pages/customer/SirenPage").then((m) => ({ default: m.SirenPage }))
);
const FireAlarmPage = lazy(() =>
  import("../pages/customer/FireAlarmPage").then((m) => ({ default: m.FireAlarmPage }))
);
const AirBlowerPage = lazy(() =>
  import("../pages/customer/AirBlowerPage").then((m) => ({ default: m.AirBlowerPage }))
);
const AirMattressPage = lazy(() =>
  import("../pages/customer/AirMattressPage").then((m) => ({ default: m.AirMattressPage }))
);
const ProductDetail = lazy(() =>
  import("../components/common/customer/ProductDetail/ProductDetail")
);
const CartPage = lazy(() => import("../pages/customer/CartPage"));
const NewsPage = lazy(() =>
  import("../pages/customer/NewsPage").then((m) => ({ default: m.NewsPage }))
);
const NewsDetailPage = lazy(() =>
  import("../pages/customer/NewsDetailPage").then((m) => ({ default: m.NewsDetailPage }))
);
const ContactPage = lazy(() =>
  import("../pages/customer/ContactPage").then((m) => ({ default: m.ContactPage }))
);
const AboutPage = lazy(() =>
  import("../pages/customer/AboutPage").then((m) => ({ default: m.AboutPage }))
);
const Login = lazy(() => import("../components/common/customer/Login/Login"));
const RegisterPage = lazy(() => import("../pages/customer/RegisterPage"));
const AccountPage = lazy(() => import("../pages/customer/AccountPage"));

const AdminLayout = lazy(() =>
  import("../layouts/admin/AdminLayout").then((m) => ({ default: m.AdminLayout }))
);
const AdminLoginPage = lazy(() =>
  import("../pages/admin/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage }))
);
const DashboardPage = lazy(() =>
  import("../pages/admin/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const BillsPage = lazy(() =>
  import("../pages/admin/BillsPage").then((m) => ({ default: m.BillsPage }))
);
const BrandsPage = lazy(() =>
  import("../pages/admin/BrandsPage").then((m) => ({ default: m.BrandsPage }))
);
const CategoriesPage = lazy(() =>
  import("../pages/admin/CategoriesPage").then((m) => ({ default: m.CategoriesPage }))
);
const ProductsPage = lazy(() =>
  import("../pages/admin/ProductsPage").then((m) => ({ default: m.ProductsPage }))
);
const ProductSpecsPage = lazy(() =>
  import("../pages/admin/ProductSpecsPage").then((m) => ({ default: m.ProductSpecsPage }))
);
const NewsCategoriesPage = lazy(() =>
  import("../pages/admin/NewsCategoriesPage").then((m) => ({ default: m.NewsCategoriesPage }))
);
const PostsPage = lazy(() =>
  import("../pages/admin/PostsPage").then((m) => ({ default: m.PostsPage }))
);
const UsersPage = lazy(() =>
  import("../pages/admin/UsersPage").then((m) => ({ default: m.UsersPage }))
);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ProductRouteHandler() {
  const { param } = useParams();
  if (param && UUID_REGEX.test(param)) {
    return <ProductDetail />;
  }
  return <SirenPage />;
}

function LazyPage({ children, layout = "customer" }) {
  return (
    <Suspense fallback={<RouteSkeleton layout={layout} duration={0} />}>
      {children}
    </Suspense>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LazyPage><HomePage /></LazyPage>} />
          <Route path="/gioi-thieu" element={<LazyPage><AboutPage /></LazyPage>} />
          <Route path="/cong-ty-tnhh-thanh-cong-viet-nam" element={<LazyPage><AboutPage /></LazyPage>} />
          <Route path="/san-pham" element={<LazyPage><SirenPage /></LazyPage>} />
          <Route path="/san-pham/:param" element={<LazyPage><ProductRouteHandler /></LazyPage>} />
          <Route path="/san-pham/chi-tiet/:id" element={<LazyPage><ProductDetail /></LazyPage>} />
          <Route path="/thiet-bi-bao-chay" element={<LazyPage><FireAlarmPage /></LazyPage>} />
          <Route path="/may-thoi-khi" element={<LazyPage><AirBlowerPage /></LazyPage>} />
          <Route path="/dem-hoi-cuu-ho-cuu-nan" element={<LazyPage><AirMattressPage /></LazyPage>} />
          <Route path="/gio-hang" element={<LazyPage><CartPage /></LazyPage>} />
          <Route path="/tin-tuc" element={<LazyPage><NewsPage /></LazyPage>} />
          <Route path="/tin-tuc/:slug" element={<LazyPage><NewsDetailPage /></LazyPage>} />
          <Route path="/lien-he" element={<LazyPage><ContactPage /></LazyPage>} />
          <Route path="/dang-nhap" element={<LazyPage><Login /></LazyPage>} />
          <Route path="/dang-ky" element={<LazyPage><RegisterPage /></LazyPage>} />
          <Route path="/tai-khoan" element={<LazyPage><AccountPage /></LazyPage>} />
          <Route path="/tai-khoan/:tab" element={<LazyPage><AccountPage /></LazyPage>} />
        </Route>

        <Route
          path="/admin/login"
          element={
            <LazyPage layout="admin">
              <AdminLoginPage />
            </LazyPage>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <LazyPage layout="admin">
                <AdminLayout />
              </LazyPage>
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="bills" element={<BillsPage />} />
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

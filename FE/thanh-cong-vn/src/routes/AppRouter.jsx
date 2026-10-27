import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { getCachedCustomerCategories } from "../utils/categoriesCache";
import { ScrollToTop } from "../components/common/ScrollToTop";
import { MainLayout } from "../layouts/customer/MainLayout";
import { RouteSkeleton } from "../components/common/RouteSkeleton";
import { PrivateRoute } from "../components/common/PrivateRoute";
import { HomePage } from "../pages/customer/HomePage";
const SirenPage = lazy(() =>
  import("../pages/customer/SirenPage").then((m) => ({ default: m.SirenPage || m.default }))
);
const FireAlarmPage = lazy(() =>
  import("../pages/customer/FireAlarmPage").then((m) => ({ default: m.FireAlarmPage || m.default }))
);
const AirBlowerPage = lazy(() =>
  import("../pages/customer/AirBlowerPage").then((m) => ({ default: m.AirBlowerPage || m.default }))
);
const AirMattressPage = lazy(() =>
  import("../pages/customer/AirMattressPage").then((m) => ({ default: m.AirMattressPage || m.default }))
);
const ProductDetail = lazy(() =>
  import("../components/common/customer/ProductDetail/ProductDetail")
);
const CartPage = lazy(() =>
  import("../pages/customer/CartPage")
);
const NewsPage = lazy(() =>
  import("../pages/customer/NewsPage").then((m) => ({ default: m.NewsPage || m.default }))
);
const NewsDetailPage = lazy(() =>
  import("../pages/customer/NewsDetailPage").then((m) => ({ default: m.NewsDetailPage || m.default }))
);
const ContactPage = lazy(() =>
  import("../pages/customer/ContactPage").then((m) => ({ default: m.ContactPage || m.default }))
);
const AboutPage = lazy(() =>
  import("../pages/customer/AboutPage").then((m) => ({ default: m.AboutPage || m.default }))
);
const Login = lazy(() =>
  import("../components/common/customer/Login/Login")
);
const RegisterPage = lazy(() =>
  import("../pages/customer/RegisterPage").then((m) => ({ default: m.RegisterPage || m.default }))
);
const AccountPage = lazy(() =>
  import("../pages/customer/AccountPage").then((m) => ({ default: m.AccountPage || m.default }))
);

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
const ProductCategoriesPage = lazy(() =>
  import("../pages/admin/ProductCategoriesPage").then((m) => ({ default: m.ProductCategoriesPage }))
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

const KNOWN_CATEGORY_SLUGS = new Set([
  "dem-hoi-cuu-ho-cuu-nan",
  "coi-hu-bao-dong",
  "coi-bao-dong-quay-tay",
  "coi-bao-dong-co-nho",
  "coi-bao-dong-co-lon",
  "coi-bao-dong-co-trung",
  "coi-bao-dong-dong-co-dien-chong-chay-no",
  "tu-dieu-khien",
  "bo-dieu-khien-trung-gian",
  "tu-dieu-khien-coi-220v",
  "tu-dieu-khien-coi-380v",
  "coi-quay-tay",
  "coi-quay-tay-co-lon",
  "coi-quay-tay-co-nho",
  "quat-thoi-khi",
  "thiet-bi-pccc-va-cnch",
  "may-thoi-khi-va-dem-hoi-cuu-ho",
  "ong-dan-va-phu-kien",
  "dem-hoi-cuu-ho",
  "may-thoi-khi-dong-co-dien",
  "tu-trung-tam-4-kenh",
  "may-thoi-khi-dong-co-xang",
  "may-thoi-khi-chay-bang-ap-luc-nuoc",
  "coi-hu-xe-gio",
  "quat-hut-khoi-pccc",
  "iphone",
  "coihubaodong",
  "coi-bao-gio",
  "coi-bao-chay",
  "coi-hu-chong-trom",
  "bao-chay-he-tu-trung-tam",
  "bao-chay-to-lien-gia",
  "bao-chay-cuc-bo",
  "thiet-bi-bao-chay",
  "may-thoi-khi",
  "may-thoi-khi-pccc",
  "coi-hu-co-nho",
  "coi-hu-chong-chay-no",
]);

let _dynamicCategorySlugs = null;

function ProductRouteHandler() {
  const { param } = useParams();
  const [isCategory, setIsCategory] = useState(() => {
    if (!param) return true;
    if (UUID_REGEX.test(param)) return false;
    if (KNOWN_CATEGORY_SLUGS.has(param)) return true;
    if (_dynamicCategorySlugs) return _dynamicCategorySlugs.has(param);
    return false;
  });

  useEffect(() => {
    if (!param || UUID_REGEX.test(param)) {
      setIsCategory(false);
      return;
    }
    if (KNOWN_CATEGORY_SLUGS.has(param)) {
      setIsCategory(true);
      return;
    }
    if (_dynamicCategorySlugs) {
      setIsCategory(_dynamicCategorySlugs.has(param));
      return;
    }

    let mounted = true;
    getCachedCustomerCategories()
      .then((tree) => {
        const slugs = new Set(KNOWN_CATEGORY_SLUGS);
        const extractSlugs = (items) => {
          if (!Array.isArray(items)) return;
          for (const item of items) {
            if (item.slug) slugs.add(item.slug);
            if (item.children) extractSlugs(item.children);
          }
        };
        extractSlugs(tree?.data || tree);
        _dynamicCategorySlugs = slugs;
        if (mounted) {
          setIsCategory(slugs.has(param));
        }
      })
      .catch(() => {
        if (mounted) setIsCategory(false);
      });

    return () => {
      mounted = false;
    };
  }, [param]);

  if (isCategory) {
    return <SirenPage />;
  }
  return <ProductDetail />;
}

function LazyPage({ children }) {
  return (
    <Suspense fallback={null}>
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
          <Route path="/" element={<HomePage />} />
          <Route path="/gioi-thieu" element={<AboutPage />} />
          <Route path="/cong-ty-tnhh-thanh-cong-viet-nam" element={<AboutPage />} />
          <Route path="/san-pham" element={<SirenPage />} />
          <Route path="/san-pham/:param" element={<ProductRouteHandler />} />
          <Route path="/san-pham/chi-tiet/:id" element={<ProductDetail />} />
          <Route path="/thiet-bi-bao-chay" element={<FireAlarmPage />} />
          <Route path="/may-thoi-khi" element={<AirBlowerPage />} />
          <Route path="/dem-hoi-cuu-ho-cuu-nan" element={<AirMattressPage />} />
          <Route path="/gio-hang" element={<CartPage />} />
          <Route path="/tin-tuc" element={<NewsPage />} />
          <Route path="/tin-tuc/:slug" element={<NewsDetailPage />} />
          <Route path="/lien-he" element={<ContactPage />} />
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<RegisterPage />} />
          <Route path="/tai-khoan" element={<AccountPage />} />
          <Route path="/tai-khoan/:tab" element={<AccountPage />} />
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
          <Route path="product-categories" element={<ProductCategoriesPage />} />
          <Route path="product-specs" element={<ProductSpecsPage />} />
          <Route path="news-categories" element={<NewsCategoriesPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

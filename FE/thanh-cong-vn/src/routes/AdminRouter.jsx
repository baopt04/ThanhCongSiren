import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "../layouts/admin/AdminLayout";
import { DashboardPage } from "../pages/admin/DashboardPage";
import { BrandsPage } from "../pages/admin/BrandsPage";
import { CategoriesPage } from "../pages/admin/CategoriesPage";
import { ProductsPage } from "../pages/admin/ProductsPage";
import { ProductSpecsPage } from "../pages/admin/ProductSpecsPage";
import { NewsCategoriesPage } from "../pages/admin/NewsCategoriesPage";
import { PostsPage } from "../pages/admin/PostsPage";
import { UsersPage } from "../pages/admin/UsersPage";

export function AdminRouter() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/brands" element={<BrandsPage />} />
        <Route path="/admin/categories" element={<CategoriesPage />} />
        <Route path="/admin/products" element={<ProductsPage />} />
        <Route path="/admin/product-specs" element={<ProductSpecsPage />} />
        <Route path="/admin/news-categories" element={<NewsCategoriesPage />} />
        <Route path="/admin/posts" element={<PostsPage />} />
        <Route path="/admin/users" element={<UsersPage />} />
      </Route>
    </Routes>
  );
}

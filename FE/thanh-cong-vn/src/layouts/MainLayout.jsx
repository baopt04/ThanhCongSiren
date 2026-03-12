import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Outlet } from "react-router-dom";
import "./MainLayout.css";

export function MainLayout({ children }) {
  return (
    <div className="sd-layout">
      <Header />
      <main className="sd-layout-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}


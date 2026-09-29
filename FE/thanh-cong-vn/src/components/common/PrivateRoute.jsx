import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "../../utils/auth";

/**
 * PrivateRoute — Protects admin routes.
 * Checks if the user is authenticated as an ADMIN.
 * If not authenticated as admin, redirects to /admin/login.
 */
export function PrivateRoute({ children }) {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    // Redirect to admin login, preserving the intended destination
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

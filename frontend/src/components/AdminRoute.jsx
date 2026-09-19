import { Navigate } from "react-router-dom";
import { isAdminLoggedIn } from "../services/adminAuth";

// Wraps admin-only pages. This is a UX convenience only — it makes the
// redirect feel instant instead of waiting on an API call to fail — the
// real enforcement happens on the backend (verifyToken/isAdmin), which is
// what actually protects the data.
export default function AdminRoute({ children }) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

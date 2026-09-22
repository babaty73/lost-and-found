import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";
import { getAdminUser, clearAdminSession } from "./services/adminAuth";

import Home from "./pages/Home";
import ReportFoundItem from "./pages/ReportFoundItem";
import FoundedItems from "./pages/FoundedItems";
import ItemDetail from "./pages/ItemDetail";
import HowItWorks from "./pages/HowItWorks";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRegisterFoundItem from "./pages/AdminRegisterFoundItem";
import AdminPendingFoundReports from "./pages/AdminPendingFoundReports";
import AdminItemsList from "./pages/AdminItemsList";
import AdminItemDetail from "./pages/AdminItemDetail";

// Students never log in (see architecture notes) — every student-facing
// route below is public, with no auth gate of any kind. The only thing
// that is ever protected is the /admin/* section, and that protection is
// enforced for real on the backend; AdminRoute here is just a UX nicety.
function App() {
  const [adminUser, setAdminUser] = useState(getAdminUser());

  const handleLogout = () => {
    clearAdminSession();
    setAdminUser(null);
  };

  return (
    <>
      <Navbar adminUser={adminUser} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/report-found" element={<ReportFoundItem />} />
        <Route path="/found-items" element={<FoundedItems />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/how-it-works" element={<HowItWorks />} />

        <Route path="/admin/login" element={<AdminLogin onLogin={setAdminUser} />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/register-found"
          element={
            <AdminRoute>
              <AdminRegisterFoundItem />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/pending-found-reports"
          element={
            <AdminRoute>
              <AdminPendingFoundReports />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/items"
          element={
            <AdminRoute>
              <AdminItemsList />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/items/:id"
          element={
            <AdminRoute>
              <AdminItemDetail />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
}

export default App;

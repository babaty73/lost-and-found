import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

// Students never log in, so the main nav is always the same for every
// visitor. The only thing that changes is a small "Admin" link/logout
// button, driven by whether a Student Union staff member is currently
// signed in (see App.jsx, which owns the adminUser state).
function Navbar({ adminUser, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    setMenuOpen(false);
    navigate("/home");
  };

  return (
    <nav className="navbar">
      <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
        ☰
      </button>

      <div className="logo">ASTU Lost &amp; Found</div>

      {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} />}

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
          ✕
        </button>

        <Link to="/home" onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        <Link to="/report-lost" onClick={() => setMenuOpen(false)}>
          Report Lost Item
        </Link>
        <Link to="/found-items" onClick={() => setMenuOpen(false)}>
          Found Items
        </Link>
        <Link to="/how-it-works" onClick={() => setMenuOpen(false)}>
          How It Works
        </Link>

        {adminUser ? (
          <>
            <Link to="/admin" onClick={() => setMenuOpen(false)}>
              Admin Dashboard
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              Logout ({adminUser.name})
            </button>
          </>
        ) : (
          <Link to="/admin/login" className="admin-link" onClick={() => setMenuOpen(false)}>
            Student Union Staff Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

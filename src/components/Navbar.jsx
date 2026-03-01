import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar({ setIsLoggedIn }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      
      {/* Hamburger LEFT */}
      <button className="menu-btn" onClick={() => setMenuOpen(true)}>
        ☰
      </button>

      <div className="logo">ASTU Lost & Found</div>

      {/* Sidebar */}
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>

        {/* X Close Button */}
        <button className="close-btn" onClick={() => setMenuOpen(false)}>
          ✕
        </button>

        <Link to="/home" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/report-lost" onClick={() => setMenuOpen(false)}>Report Lost Item</Link>
        <Link to="/report-found" onClick={() => setMenuOpen(false)}>Founded Items</Link>
        <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

import { Link } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);

  return (
    <nav className="navbar">
      {/* Hamburger / X button on left */}
      <div className="menu-btn" onClick={toggleMenu}>
        {open ? "✖" : "☰"}
      </div>

      <div className="logo">ASTU Lost & Found</div>

      {/* Links */}
      <div className={`nav-links ${open ? "open" : ""}`}>
        <Link to="/" onClick={() => setOpen(false)}>Home</Link>
        <Link to="/report-lost" onClick={() => setOpen(false)}>Report Lost</Link>
        <Link to="/report-found" onClick={() => setOpen(false)}>Report Found</Link>
        <Link to="/search" onClick={() => setOpen(false)}>Search</Link>
        <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
      </div>
    </nav>
  );
}

export default Navbar;


import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

const navLinkClasses = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

// Students never log in, so the main nav is always the same for every
// visitor — the only thing that changes is a small admin link/logout
// control, driven by whether a Student Union staff member is signed in
// (see App.jsx, which owns the adminUser state). There is no "Report Lost
// Item" link: found-item reporting is the only student reporting workflow.
function Navbar({ adminUser, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    setMenuOpen(false);
    navigate("/home");
  };

  const links = [
    { to: "/home", label: "Home" },
    { to: "/found-items", label: "Browse Found Items" },
    { to: "/report-found", label: "Report Found Item" },
    { to: "/how-it-works", label: "How It Works" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/home" className="flex items-center gap-2 text-base font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm text-white">
            AL
          </span>
          <span className="hidden sm:inline">ASTU Lost &amp; Found</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClasses}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {adminUser ? (
            <>
              <Link
                to="/admin"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Admin Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Logout ({adminUser.name})
              </button>
            </>
          ) : (
            <Link
              to="/admin/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              Admin Login
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out md:hidden ${
          menuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="space-y-1 border-t border-slate-200 bg-white px-4 py-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <div className="mt-2 border-t border-slate-100 pt-2">
            {adminUser ? (
              <>
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Admin Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Logout ({adminUser.name})
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

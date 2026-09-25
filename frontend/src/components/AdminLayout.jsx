import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/pending-found-reports", label: "Pending Reports" },
  { to: "/admin/register-found", label: "Register Item" },
  { to: "/admin/items", label: "All Items" },
];

const tabClasses = ({ isActive }) =>
  `whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
    isActive ? "border-primary-600 text-primary-700" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
  }`;

// A slim, shared sub-navigation for every admin page, so the admin section
// feels like one coherent dashboard rather than a set of separately
// designed screens. Deliberately not a full collapsible sidebar — this
// application doesn't have enough admin surface area to need one.
function AdminLayout({ children }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {tabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to} end={tab.end} className={tabClasses}>
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}

export default AdminLayout;

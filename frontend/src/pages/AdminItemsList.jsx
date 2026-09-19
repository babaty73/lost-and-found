import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import "./AdminDashboard.css";

// A simple filtered list backing the dashboard's stat-card links
// (e.g. "Active Lost Reports" -> /admin/items?type=lost&status=active).
// Deliberately plain — the operational review work happens on each item's
// own AdminItemDetail page, not here.
function AdminItemsList() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "";
  const status = searchParams.get("status") || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = { limit: 50 };
    if (type) params.type = type;
    if (status) params.status = status;

    api
      .get("/items", { params })
      .then((res) => setItems(res.data.items))
      .catch(() => setError("Could not load items."))
      .finally(() => setLoading(false));
  }, [type, status]);

  const title = [type, status ? status.replace("_", " ") : null].filter(Boolean).join(" · ") || "All items";

  return (
    <div className="admin-container">
      <Link to="/admin" className="back-link">
        ← Back to dashboard
      </Link>
      <h1 style={{ textTransform: "capitalize" }}>{title}</h1>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <div className="admin-empty">
          <h3>No items match this filter.</h3>
        </div>
      ) : (
        <div className="admin-grid">
          {items.map((item) => (
            <Link to={`/admin/items/${item.id}`} className="admin-card" key={item.id}>
              <div className="admin-card-header">
                <h2>{item.title}</h2>
                <span className="admin-status">{item.status.replace("_", " ")}</span>
              </div>
              <p>
                <strong>Type:</strong> {item.type}
              </p>
              <p>
                <strong>Location:</strong> {item.location}
              </p>
              <p>
                <strong>Category:</strong> {item.category}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminItemsList;

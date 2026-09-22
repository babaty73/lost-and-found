import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./AdminDashboard.css";

// Real operational stats, pulled from the backend — replacing the old
// prototype's "Retrieved Items" counter, which read a `retrieved` field
// nothing ever set and therefore always showed zero.
function useCount(params) {
  const [count, setCount] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const endpoint = params.__endpoint || "/items";
    const { __endpoint, ...query } = params;
    void __endpoint;
    api
      .get(endpoint, { params: { ...query, limit: 1 } })
      .then((res) => {
        if (!cancelled) setCount(res.data.total);
      })
      .catch(() => {
        if (!cancelled) setCount(null);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);
  return count;
}

function StatCard({ label, count, to }) {
  const content = (
    <div className="admin-stat-card">
      <h2>{count === null ? "…" : count}</h2>
      <p>{label}</p>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

function AdminDashboard() {
  const activeLost = useCount({ type: "lost", status: "active" });
  const activeFound = useCount({ type: "found", status: "active" });
  const pendingHandover = useCount({ __endpoint: "/items/found-reports/pending" });
  const underReview = useCount({ type: "found", status: "under_review" });
  const unclaimed = useCount({ type: "found", status: "unclaimed" });
  const resolved = useCount({ status: "resolved" });
  const pendingClaims = useCount({ __endpoint: "/claims", status: "pending" });
  const verifiedClaims = useCount({ __endpoint: "/claims", status: "verified" });

  const [underReviewItems, setUnderReviewItems] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(true);

  useEffect(() => {
    api
      .get("/items", { params: { type: "found", status: "under_review", limit: 20 } })
      .then((res) => setUnderReviewItems(res.data.items))
      .finally(() => setLoadingQueue(false));
  }, []);

  return (
    <div className="admin-container">
      <div className="admin-header-row">
        <h1>Student Union Admin Dashboard</h1>
        <Link to="/admin/register-found" className="admin-primary-btn">
          + Register a Found Item
        </Link>
      </div>

      <div className="admin-stats-grid">
        <StatCard
          label="Pending Found Reports"
          count={pendingHandover}
          to="/admin/pending-found-reports"
        />
        <StatCard label="Active Lost Reports" count={activeLost} to="/admin/items?type=lost&status=active" />
        <StatCard label="Active Found Items" count={activeFound} to="/admin/items?type=found&status=active" />
        <StatCard label="Items Under Review" count={underReview} to="/admin/items?type=found&status=under_review" />
        <StatCard label="Pending Claims" count={pendingClaims} />
        <StatCard label="Verified Claims Awaiting Collection" count={verifiedClaims} />
        <StatCard label="Unclaimed Items" count={unclaimed} to="/admin/items?type=found&status=unclaimed" />
        <StatCard label="Resolved Items" count={resolved} to="/admin/items?status=resolved" />
      </div>

      <h2 className="admin-section-title">Items with claims awaiting review</h2>

      {loadingQueue ? (
        <p>Loading...</p>
      ) : underReviewItems.length === 0 ? (
        <div className="admin-empty">
          <h3>Nothing awaiting review</h3>
          <p>Once a claim is submitted on a found item, it will appear here.</p>
        </div>
      ) : (
        <div className="admin-grid">
          {underReviewItems.map((item) => (
            <Link to={`/admin/items/${item.id}`} className="admin-card" key={item.id}>
              <div className="admin-card-header">
                <h2>{item.title}</h2>
                <span className="admin-status">{item.status.replace("_", " ")}</span>
              </div>
              <p>
                <strong>Location:</strong> {item.location}
              </p>
              <p>
                <strong>Category:</strong> {item.category}
              </p>
              <p className="admin-note">Open to review claims and take action.</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

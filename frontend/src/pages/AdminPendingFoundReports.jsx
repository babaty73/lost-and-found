import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./AdminDashboard.css";

// The Student Union's intake queue: online found-item reports waiting on
// the physical item to actually arrive. Nothing here is publicly visible —
// see itemController.listItems/getItem, which exclude pending_handover
// unconditionally. Opening a report links through to the same
// AdminItemDetail page used for every other item, where "Accept Physical
// Handover" lives.
function AdminPendingFoundReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/items/found-reports/pending", { params: { limit: 50 } })
      .then((res) => setReports(res.data.items))
      .catch(() => setError("Could not load pending found-item reports."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-container">
      <Link to="/admin" className="back-link">
        ← Back to dashboard
      </Link>
      <h1>Pending Found Item Reports</h1>
      <p className="report-intro" style={{ textAlign: "left", margin: "0 0 20px" }}>
        Students submitted these online, saying they found something and intend to
        bring it in. None of these are public yet — open one once the physical item
        actually arrives at the office to accept it and publish the listing.
      </p>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : reports.length === 0 ? (
        <div className="admin-empty">
          <h3>Nothing pending</h3>
          <p>Online found-item reports waiting on physical handover will appear here.</p>
        </div>
      ) : (
        <div className="admin-grid">
          {reports.map((report) => (
            <Link to={`/admin/items/${report._id}`} className="admin-card" key={report._id}>
              <div className="admin-card-header">
                <h2>{report.title}</h2>
                <span className="admin-status">pending handover</span>
              </div>
              <p>
                <strong>Reported found at:</strong> {report.location}
              </p>
              <p>
                <strong>Category:</strong> {report.category}
              </p>
              <p>
                <strong>Submitted:</strong> {new Date(report.createdAt).toLocaleString()}
              </p>
              <p className="admin-note">Open to review and accept physical handover.</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPendingFoundReports;

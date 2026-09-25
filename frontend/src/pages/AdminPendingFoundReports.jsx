import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { PageHeader, Card, StatusBadge, EmptyState, LoadingState, ErrorState } from "../components/ui";

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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/admin" className="mb-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">
        ← Back to dashboard
      </Link>
      <PageHeader
        title="Pending Found Item Reports"
        description="Students submitted these online, saying they found something and intend to bring it in. None of these are public yet — open one once the physical item actually arrives at the office to accept it and publish the listing."
      />

      {error && <ErrorState className="mb-6">{error}</ErrorState>}

      {loading ? (
        <LoadingState />
      ) : reports.length === 0 ? (
        <EmptyState
          title="Nothing pending"
          description="Online found-item reports waiting on physical handover will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card as={Link} to={`/admin/items/${report._id}`} hoverable key={report._id}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-900">{report.title}</h2>
                <StatusBadge status="pending_handover" />
              </div>
              <dl className="mt-3 space-y-1 text-sm text-slate-600">
                <div>
                  <dt className="inline font-medium text-slate-700">Found at: </dt>
                  <dd className="inline">{report.location}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-slate-700">Category: </dt>
                  <dd className="inline">{report.category}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-slate-700">Submitted: </dt>
                  <dd className="inline">{new Date(report.createdAt).toLocaleString()}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs font-medium text-primary-600">Open to review and accept handover →</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPendingFoundReports;

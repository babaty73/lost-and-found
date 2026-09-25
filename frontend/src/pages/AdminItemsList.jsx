import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import { PageHeader, Card, StatusBadge, EmptyState, LoadingState, ErrorState } from "../components/ui";

// A simple filtered list backing the dashboard's stat-card links
// (e.g. "Active Found Items" -> /admin/items?type=found&status=active).
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/admin" className="mb-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">
        ← Back to dashboard
      </Link>
      <PageHeader title={title} />

      {error && <ErrorState className="mb-6">{error}</ErrorState>}

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState title="No items match this filter." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card as={Link} to={`/admin/items/${item.id}`} hoverable key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-900">{item.title}</h2>
                <StatusBadge status={item.status} />
              </div>
              <dl className="mt-3 space-y-1 text-sm text-slate-600">
                <div>
                  <dt className="inline font-medium text-slate-700">Location: </dt>
                  <dd className="inline">{item.location}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-slate-700">Category: </dt>
                  <dd className="inline">{item.category}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminItemsList;

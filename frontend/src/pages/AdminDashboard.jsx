import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { PageHeader, Button, Card, StatusBadge, EmptyState, LoadingState } from "../components/ui";

// Real operational stats, pulled from the backend — replacing the old
// prototype's "Retrieved Items" counter, which read a `retrieved` field
// nothing ever set and therefore always showed zero. There is no
// lost-report statistic here: found-item reporting is the only student
// workflow this application supports.
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

function StatCard({ label, count, to, highlight }) {
  const content = (
    <Card hoverable={Boolean(to)} className={highlight ? "!border-primary-200 !bg-primary-50/50" : ""}>
      <p className="text-3xl font-bold text-slate-900">{count === null ? "…" : count}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </Card>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

function AdminDashboard() {
  const pendingHandover = useCount({ __endpoint: "/items/found-reports/pending" });
  const activeFound = useCount({ type: "found", status: "active" });
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Student Union Admin Dashboard"
        actions={
          <Button as={Link} to="/admin/register-found">
            + Register a Found Item
          </Button>
        }
      />

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Pending Found Reports" count={pendingHandover} to="/admin/pending-found-reports" highlight />
        <StatCard label="Active Found Items" count={activeFound} to="/admin/items?type=found&status=active" />
        <StatCard label="Items Under Review" count={underReview} to="/admin/items?type=found&status=under_review" />
        <StatCard label="Pending Claims" count={pendingClaims} />
        <StatCard label="Verified Claims Awaiting Collection" count={verifiedClaims} />
        <StatCard label="Unclaimed Items" count={unclaimed} to="/admin/items?type=found&status=unclaimed" />
        <StatCard label="Resolved Items" count={resolved} to="/admin/items?status=resolved" />
      </div>

      <h2 className="mb-4 text-lg font-semibold text-slate-900">Items with claims awaiting review</h2>

      {loadingQueue ? (
        <LoadingState />
      ) : underReviewItems.length === 0 ? (
        <EmptyState
          title="Nothing awaiting review"
          description="Once a claim is submitted on a found item, it will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {underReviewItems.map((item) => (
            <Card as={Link} to={`/admin/items/${item.id}`} hoverable key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
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
              <p className="mt-3 text-xs font-medium text-primary-600">Open to review claims →</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

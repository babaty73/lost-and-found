import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import "./AdminItemDetail.css";

const CLAIM_STATUS_LABELS = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

function ClaimRow({ claim, onReview, onRecordReturn, itemType, itemStatus }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (action) => {
    setBusy(true);
    await onReview(claim._id, action, note);
    setBusy(false);
    setNote("");
  };

  return (
    <div className="claim-row">
      <div className="claim-row-header">
        <strong>{claim.claimType === "on_behalf" ? "On behalf of another student" : "Self claim"}</strong>
        <span className={`claim-status claim-status-${claim.status}`}>
          {CLAIM_STATUS_LABELS[claim.status] || claim.status}
        </span>
      </div>

      <p>
        <strong>Claimant student ID:</strong> {claim.claimantStudentId}
      </p>
      {claim.claimantContact && (
        <p>
          <strong>Claimant contact:</strong> {claim.claimantContact}
        </p>
      )}
      {claim.claimType === "on_behalf" && (
        <p>
          <strong>Intended owner student ID:</strong> {claim.ownerStudentId}
        </p>
      )}
      <p>
        <strong>Why they believe it's theirs:</strong> {claim.explanation}
      </p>
      {claim.evidence && (
        <p>
          <strong>Identifying details provided:</strong> {claim.evidence}
        </p>
      )}
      <p className="claim-meta">Submitted {new Date(claim.createdAt).toLocaleString()}</p>

      {claim.status !== "pending" && claim.review?.reviewedAt && (
        <p className="claim-meta">
          Reviewed {new Date(claim.review.reviewedAt).toLocaleString()}
          {claim.review.note ? ` — "${claim.review.note}"` : ""}
        </p>
      )}

      {claim.status === "pending" && (
        <div className="claim-actions">
          <label className="visually-hidden" htmlFor={`note-${claim._id}`}>
            Admin note
          </label>
          <input
            id={`note-${claim._id}`}
            type="text"
            placeholder="Optional note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button disabled={busy} onClick={() => run("verify")} className="admin-verify-btn">
            Verify
          </button>
          <button disabled={busy} onClick={() => run("reject")} className="admin-reject-btn">
            Reject
          </button>
        </div>
      )}

      {claim.status === "verified" && itemType === "found" && itemStatus !== "resolved" && (
        <div className="claim-actions">
          <button disabled={busy} onClick={() => onRecordReturn(claim._id, note)} className="admin-verify-btn">
            Record Return (item collected)
          </button>
        </div>
      )}
    </div>
  );
}

function AdminItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [duplicates, setDuplicates] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [itemRes, claimsRes, auditRes] = await Promise.all([
        api.get(`/items/${id}/admin`),
        api.get(`/items/${id}/claims`),
        api.get("/audit", { params: { itemId: id, limit: 20 } }),
      ]);
      setItem(itemRes.data);
      setClaims(claimsRes.data);
      setAuditLogs(auditRes.data.logs);
    } catch (_err) {
      setError("Could not load this item.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReview = async (claimId, action, note) => {
    setActionError("");
    try {
      await api.patch(`/claims/${claimId}/review`, { action, note });
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update this claim.");
    }
  };

  const handleRecordReturn = async (claimId, note) => {
    setActionError("");
    try {
      await api.post(`/items/${id}/return`, { claimId, note });
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to record the return.");
    }
  };

  const handleMarkUnclaimed = async () => {
    setActionError("");
    try {
      await api.patch(`/items/${id}/unclaimed`);
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to mark this item unclaimed.");
    }
  };

  const handleResolveLost = async () => {
    setActionError("");
    try {
      await api.patch(`/items/${id}/resolve`, { method: "self-reported" });
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to resolve this report.");
    }
  };

  const checkDuplicates = async () => {
    try {
      const res = await api.get(`/items/${id}/possible-duplicates`);
      setDuplicates(res.data.possibleDuplicates);
    } catch (_err) {
      setDuplicates([]);
    }
  };

  if (loading) return <div className="admin-container">Loading...</div>;
  if (error || !item) {
    return (
      <div className="admin-container">
        <p className="form-error">{error || "Item not found."}</p>
        <Link to="/admin">Back to dashboard</Link>
      </div>
    );
  }

  const hasActiveClaim = claims.some((c) => ["pending", "verified"].includes(c.status));

  return (
    <div className="admin-container">
      <Link to="/admin" className="back-link">
        ← Back to dashboard
      </Link>

      <div className="admin-item-detail-card">
        <div className="admin-item-detail-header">
          <h1>{item.title}</h1>
          <span className={`item-status item-status-${item.status}`}>{item.status.replace("_", " ")}</span>
        </div>

        {actionError && (
          <p className="form-error" role="alert">
            {actionError}
          </p>
        )}

        <div className="admin-item-detail-grid">
          <div>
            <h2>Item information</h2>
            <p>
              <strong>Type:</strong> {item.type}
            </p>
            <p>
              <strong>Category:</strong> {item.category}
            </p>
            <p>
              <strong>Location:</strong> {item.location}
            </p>
            <p>
              <strong>Date:</strong> {new Date(item.eventDate).toLocaleDateString()}
            </p>
            {item.description && (
              <p>
                <strong>Description:</strong> {item.description}
              </p>
            )}
            {item.privateDetails && (
              <p>
                <strong>Private verification details:</strong> {item.privateDetails}
              </p>
            )}
            {item.images?.length > 0 && (
              <div className="admin-item-images">
                {item.images.map((src, i) => (
                  <img key={i} src={src} alt={`${item.title} ${i + 1}`} />
                ))}
              </div>
            )}
          </div>

          <div>
            {item.type === "found" ? (
              <>
                <h2>Finder / intake information</h2>
                <p>
                  <strong>Finder type:</strong> {item.finder?.type || "unknown"}
                </p>
                {item.finder?.studentId && (
                  <p>
                    <strong>Finder student ID:</strong> {item.finder.studentId}
                  </p>
                )}
                {item.finder?.name && (
                  <p>
                    <strong>Finder name:</strong> {item.finder.name}
                  </p>
                )}
                <p>
                  <strong>Received through:</strong> {item.intake?.receivedThrough}
                </p>
                {item.intake?.notes && (
                  <p>
                    <strong>Intake notes:</strong> {item.intake.notes}
                  </p>
                )}
                <p>
                  <strong>Received:</strong>{" "}
                  {item.intake?.receivedAt ? new Date(item.intake.receivedAt).toLocaleString() : "—"}
                </p>
              </>
            ) : (
              <>
                <h2>Reporter information</h2>
                <p>
                  <strong>Reporter student ID:</strong> {item.reporterStudentId}
                </p>
                {item.reporterContact && (
                  <p>
                    <strong>Contact:</strong> {item.reporterContact}
                  </p>
                )}
              </>
            )}

            {item.resolution?.resolvedAt && (
              <>
                <h2>Resolution</h2>
                <p>
                  <strong>Method:</strong> {item.resolution.method}
                </p>
                <p>
                  <strong>Resolved:</strong> {new Date(item.resolution.resolvedAt).toLocaleString()}
                </p>
                {item.resolution.note && (
                  <p>
                    <strong>Note:</strong> {item.resolution.note}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="admin-item-actions">
          {item.type === "found" && item.status !== "resolved" && !hasActiveClaim && (
            <button className="admin-secondary-btn" onClick={handleMarkUnclaimed}>
              Mark Unclaimed
            </button>
          )}
          {item.type === "lost" && !["resolved", "cancelled"].includes(item.status) && (
            <button className="admin-secondary-btn" onClick={handleResolveLost}>
              Resolve This Report
            </button>
          )}
          <button className="admin-secondary-btn" onClick={checkDuplicates}>
            Check for Possible Duplicates
          </button>
        </div>

        {duplicates && (
          <div className="admin-duplicates">
            <h2>Possible duplicates</h2>
            {duplicates.length === 0 ? (
              <p>No likely duplicates found.</p>
            ) : (
              <ul>
                {duplicates.map((d) => (
                  <li key={d.item._id}>
                    <Link to={`/admin/items/${d.item._id}`}>{d.item.title}</Link> — {d.item.location} (
                    {new Date(d.item.eventDate).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {item.type === "found" && (
          <div className="admin-claims-section">
            <h2>Claims ({claims.length})</h2>
            {claims.length === 0 ? (
              <p>No claims have been submitted for this item yet.</p>
            ) : (
              claims.map((claim) => (
                <ClaimRow
                  key={claim._id}
                  claim={claim}
                  onReview={handleReview}
                  onRecordReturn={handleRecordReturn}
                  itemType={item.type}
                  itemStatus={item.status}
                />
              ))
            )}
          </div>
        )}

        <div className="admin-audit-section">
          <h2>Activity log</h2>
          {auditLogs.length === 0 ? (
            <p>No recorded activity yet.</p>
          ) : (
            <ul className="admin-audit-list">
              {auditLogs.map((log) => (
                <li key={log._id}>
                  <span className="audit-time">{new Date(log.createdAt).toLocaleString()}</span>{" "}
                  <span className="audit-action">{log.action}</span>
                  {log.actor?.name ? ` by ${log.actor.name}` : " (system)"}
                  {log.details ? ` — ${log.details}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminItemDetail;

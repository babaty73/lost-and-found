import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { Button, Card, StatusBadge, ErrorState, LoadingState, Modal, useToast } from "../components/ui";

function InfoRow({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function ClaimRow({ claim, onReview, onRecordReturn, itemType, itemStatus }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // "reject" | "return" | null

  const run = async (action) => {
    setBusy(true);
    await onReview(claim._id, action, note);
    setBusy(false);
    setNote("");
    setConfirmAction(null);
  };

  const runReturn = async () => {
    setBusy(true);
    await onRecordReturn(claim._id, note);
    setBusy(false);
    setConfirmAction(null);
  };

  return (
    <Card className="!p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">
          {claim.claimType === "on_behalf" ? "On behalf of another student" : "Self claim"}
        </p>
        <StatusBadge status={claim.status} />
      </div>

      <dl className="mt-3 divide-y divide-slate-100 text-sm">
        <InfoRow label="Claimant student ID" value={claim.claimantStudentId} />
        <InfoRow label="Claimant contact" value={claim.claimantContact} />
        {claim.claimType === "on_behalf" && <InfoRow label="Intended owner student ID" value={claim.ownerStudentId} />}
      </dl>

      <div className="mt-3 space-y-2 text-sm">
        <p>
          <span className="font-medium text-slate-700">Why they believe it's theirs: </span>
          <span className="text-slate-600">{claim.explanation}</span>
        </p>
        {claim.evidence && (
          <p>
            <span className="font-medium text-slate-700">Identifying details provided: </span>
            <span className="text-slate-600">{claim.evidence}</span>
          </p>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-400">Submitted {new Date(claim.createdAt).toLocaleString()}</p>

      {claim.status !== "pending" && claim.review?.reviewedAt && (
        <p className="mt-1 text-xs text-slate-400">
          Reviewed {new Date(claim.review.reviewedAt).toLocaleString()}
          {claim.review.note ? ` — "${claim.review.note}"` : ""}
        </p>
      )}

      {claim.status === "pending" && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <label className="sr-only" htmlFor={`note-${claim._id}`}>
            Admin note
          </label>
          <input
            id={`note-${claim._id}`}
            type="text"
            placeholder="Optional note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-w-[160px] flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Button size="sm" disabled={busy} onClick={() => run("verify")}>
            Verify
          </Button>
          <Button size="sm" variant="destructive" disabled={busy} onClick={() => setConfirmAction("reject")}>
            Reject
          </Button>
        </div>
      )}

      {claim.status === "verified" && itemType === "found" && itemStatus !== "resolved" && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <Button size="sm" disabled={busy} onClick={() => setConfirmAction("return")}>
            Record Return (item collected)
          </Button>
        </div>
      )}

      <Modal
        open={confirmAction === "reject"}
        title="Reject this claim?"
        description="The claim stays in this item's history as rejected — it is not deleted. The item remains open for any other legitimate claim."
        confirmLabel="Reject Claim"
        variant="destructive"
        loading={busy}
        onConfirm={() => run("reject")}
        onClose={() => setConfirmAction(null)}
      />
      <Modal
        open={confirmAction === "return"}
        title="Record this item as returned?"
        description="Only do this after physically verifying the claimant's institutional student ID at the Student Union office. This will mark the item resolved."
        confirmLabel="Confirm Return"
        loading={busy}
        onConfirm={runReturn}
        onClose={() => setConfirmAction(null)}
      />
    </Card>
  );
}

function AdminItemDetail() {
  const { id } = useParams();
  const showToast = useToast();
  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [duplicates, setDuplicates] = useState(null);
  const [confirmHandover, setConfirmHandover] = useState(false);
  const [acceptingHandover, setAcceptingHandover] = useState(false);

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
      showToast(action === "verify" ? "Claim verified." : "Claim rejected.", "success");
      await load();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update this claim.";
      setActionError(message);
      showToast(message, "error");
    }
  };

  const handleRecordReturn = async (claimId, note) => {
    setActionError("");
    try {
      await api.post(`/items/${id}/return`, { claimId, note });
      showToast("Return recorded — item marked resolved.", "success");
      await load();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to record the return.";
      setActionError(message);
      showToast(message, "error");
    }
  };

  const handleMarkUnclaimed = async () => {
    setActionError("");
    try {
      await api.patch(`/items/${id}/unclaimed`);
      showToast("Item marked unclaimed.", "success");
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to mark this item unclaimed.");
    }
  };

  const handleAcceptHandover = async () => {
    setActionError("");
    setAcceptingHandover(true);
    try {
      await api.patch(`/items/${id}/accept-handover`, { receivedThrough: "Student Union" });
      showToast("Handover accepted — item is now public.", "success");
      setConfirmHandover(false);
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to accept this handover.");
    } finally {
      setAcceptingHandover(false);
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

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <LoadingState />
      </div>
    );
  }
  if (error || !item) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState>{error || "Item not found."}</ErrorState>
        <Link to="/admin" className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const hasActiveClaim = claims.some((c) => ["pending", "verified"].includes(c.status));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/admin" className="mb-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">
        ← Back to dashboard
      </Link>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-900">{item.title}</h1>
          <StatusBadge status={item.status} />
        </div>

        {actionError && <ErrorState className="mt-4">{actionError}</ErrorState>}

        {item.status === "pending_handover" && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            This is an online report only — the Student Union has not received the
            physical item yet. It is not publicly visible and cannot be claimed until
            you accept the handover below.
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Item information</h2>
            <dl className="mt-2 divide-y divide-slate-100">
              <InfoRow label="Type" value={item.type} />
              <InfoRow label="Category" value={item.category} />
              <InfoRow label="Location" value={item.location} />
              <InfoRow label="Date" value={new Date(item.eventDate).toLocaleDateString()} />
            </dl>
            {item.description && (
              <p className="mt-3 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Description: </span>
                {item.description}
              </p>
            )}
            {item.privateDetails && (
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Private verification details: </span>
                {item.privateDetails}
              </p>
            )}
            {item.images?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.images.map((src, i) => (
                  <img key={i} src={src} alt={`${item.title} ${i + 1}`} className="h-24 w-24 rounded-lg object-cover ring-1 ring-slate-200" />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">Finder / intake information</h2>
            <dl className="mt-2 divide-y divide-slate-100">
              <InfoRow label="Finder type" value={item.finder?.type || "unknown"} />
              <InfoRow label="Finder student ID" value={item.finder?.studentId} />
              <InfoRow label="Finder name" value={item.finder?.name} />
              <InfoRow label="Received through" value={item.intake?.receivedThrough} />
              <InfoRow label="Intake notes" value={item.intake?.notes} />
              <InfoRow
                label="Received"
                value={item.intake?.receivedAt ? new Date(item.intake.receivedAt).toLocaleString() : null}
              />
            </dl>

            {item.resolution?.resolvedAt && (
              <>
                <h2 className="mt-5 text-sm font-semibold text-slate-900">Resolution</h2>
                <dl className="mt-2 divide-y divide-slate-100">
                  <InfoRow label="Method" value={item.resolution.method} />
                  <InfoRow label="Resolved" value={new Date(item.resolution.resolvedAt).toLocaleString()} />
                  <InfoRow label="Note" value={item.resolution.note} />
                </dl>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
          {item.status === "pending_handover" && (
            <Button onClick={() => setConfirmHandover(true)}>Accept Physical Handover &amp; Publish</Button>
          )}
          {item.type === "found" && !["resolved", "pending_handover"].includes(item.status) && !hasActiveClaim && (
            <Button variant="secondary" onClick={handleMarkUnclaimed}>
              Mark Unclaimed
            </Button>
          )}
          <Button variant="ghost" onClick={checkDuplicates}>
            Check for Possible Duplicates
          </Button>
        </div>

        {duplicates && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h2 className="text-sm font-semibold text-amber-900">Possible duplicates</h2>
            {duplicates.length === 0 ? (
              <p className="mt-1 text-sm text-amber-800">No likely duplicates found.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {duplicates.map((d) => (
                  <li key={d.item._id}>
                    <Link to={`/admin/items/${d.item._id}`} className="font-medium text-primary-700 hover:text-primary-800">
                      {d.item.title}
                    </Link>{" "}
                    <span className="text-amber-800">
                      — {d.item.location} ({new Date(d.item.eventDate).toLocaleDateString()})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card>

      {item.type === "found" && item.status !== "pending_handover" && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Claims ({claims.length})</h2>
          {claims.length === 0 ? (
            <p className="text-sm text-slate-500">No claims have been submitted for this item yet.</p>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <ClaimRow
                  key={claim._id}
                  claim={claim}
                  onReview={handleReview}
                  onRecordReturn={handleRecordReturn}
                  itemType={item.type}
                  itemStatus={item.status}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Activity log</h2>
        {auditLogs.length === 0 ? (
          <p className="text-sm text-slate-500">No recorded activity yet.</p>
        ) : (
          <Card className="!p-0">
            <ul className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <li key={log._id} className="px-5 py-3 text-sm text-slate-600">
                  <span className="text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>{" "}
                  <span className="font-medium text-slate-900">{log.action}</span>
                  {log.actor?.name ? ` by ${log.actor.name}` : " (system)"}
                  {log.details ? ` — ${log.details}` : ""}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <Modal
        open={confirmHandover}
        title="Accept physical handover?"
        description="Only confirm this once the physical item has actually been received at the Student Union office. This will publish the item so students can search for and claim it."
        confirmLabel="Accept & Publish"
        loading={acceptingHandover}
        onConfirm={handleAcceptHandover}
        onClose={() => setConfirmHandover(false)}
      />
    </div>
  );
}

export default AdminItemDetail;

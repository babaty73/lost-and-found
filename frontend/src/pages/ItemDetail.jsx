import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { Button, Input, Textarea, ErrorState, LoadingState, StatusBadge } from "../components/ui";

const CLAIMABLE_STATUSES = ["active", "under_review"];

function ClaimForm({ itemId, onSubmitted }) {
  const [claimType, setClaimType] = useState("self");
  const [form, setForm] = useState({
    claimantStudentId: "",
    claimantContact: "",
    ownerStudentId: "",
    explanation: "",
    evidence: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post(`/items/${itemId}/claims`, { claimType, ...form });
      onSubmitted();
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to submit your claim. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
        Submitting a claim does not mean this item is automatically yours, and it does
        not reserve it for you. Multiple students may claim the same item — the Student
        Union reviews every claim and decides ownership. If your claim is verified, you
        will need to visit the Student Union Lost &amp; Found office with your
        institutional student ID before the item is released. False claims are recorded
        and may be subject to institutional action.
      </div>

      <fieldset className="rounded-lg border border-slate-200 p-4">
        <legend className="px-1 text-sm font-medium text-slate-700">Who is this claim for?</legend>
        <div className="mt-2 space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="claimType"
              value="self"
              checked={claimType === "self"}
              onChange={() => setClaimType("self")}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500"
            />
            I am claiming this item for myself
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="claimType"
              value="on_behalf"
              checked={claimType === "on_behalf"}
              onChange={() => setClaimType("on_behalf")}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500"
            />
            I am claiming this on behalf of someone else
          </label>
        </div>
      </fieldset>

      {error && <ErrorState>{error}</ErrorState>}

      <Input
        id="claimant-id"
        label="Your institutional student ID"
        name="claimantStudentId"
        value={form.claimantStudentId}
        onChange={handleChange}
        required
      />

      {claimType === "on_behalf" && (
        <Input
          id="owner-id"
          label="Institutional student ID of the intended owner"
          name="ownerStudentId"
          value={form.ownerStudentId}
          onChange={handleChange}
          required
        />
      )}

      <Input
        id="claimant-contact"
        label="Contact information (optional)"
        name="claimantContact"
        placeholder="Phone number or email"
        value={form.claimantContact}
        onChange={handleChange}
      />

      <Textarea
        id="claim-explanation"
        label="Why do you believe this item belongs to you (or the person above)?"
        name="explanation"
        value={form.explanation}
        onChange={handleChange}
        required
      />

      <Textarea
        id="claim-evidence"
        label="Identifying details that could help verify ownership (optional)"
        name="evidence"
        placeholder="e.g. a scratch, a sticker, contents, serial number"
        value={form.evidence}
        onChange={handleChange}
      />

      <Button type="submit" loading={submitting} className="w-full sm:w-auto">
        {submitting ? "Submitting..." : "Submit Claim"}
      </Button>
    </form>
  );
}

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get(`/items/${id}`)
      .then((res) => {
        if (!cancelled) setItem(res.data);
      })
      .catch(() => {
        if (!cancelled) setError("This item could not be found.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <LoadingState label="Loading item..." />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState>{error || "This item could not be found."}</ErrorState>
        <Link to="/found-items" className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">
          ← Back to browse
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/found-items" className="mb-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">
        ← Back to browse
      </Link>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        {item.images?.length > 0 ? (
          <div className={`grid gap-0.5 ${item.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {item.images.map((src, i) => (
              <img key={i} src={src} alt={`${item.title} photo ${i + 1}`} className="h-64 w-full object-cover" />
            ))}
          </div>
        ) : (
          <div className="flex h-56 w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
            No photo
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{item.title}</h1>
            <StatusBadge status={item.status} />
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-4 border-y border-slate-100 py-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Category</dt>
              <dd className="mt-1 text-sm text-slate-900">{item.category}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Found location</dt>
              <dd className="mt-1 text-sm text-slate-900">{item.location}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Date found</dt>
              <dd className="mt-1 text-sm text-slate-900">{new Date(item.eventDate).toLocaleDateString()}</dd>
            </div>
          </dl>

          {item.description && <p className="mt-5 text-sm leading-relaxed text-slate-600">{item.description}</p>}

          <div className="mt-8">
            {claimSubmitted ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-5">
                <h2 className="text-sm font-semibold text-green-900">Claim submitted</h2>
                <p className="mt-1.5 text-sm text-green-800">
                  Thank you. The Student Union will review your claim along with any
                  others submitted for this item. If it's verified, you'll need to visit
                  the Student Union Lost &amp; Found office with your institutional
                  student ID to collect it.
                </p>
              </div>
            ) : CLAIMABLE_STATUSES.includes(item.status) ? (
              <div className="border-t border-slate-100 pt-6">
                <h2 className="text-lg font-semibold text-slate-900">Think this is yours?</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Found items are held at the ASTU Student Union Lost &amp; Found office
                  — submitting a claim below does not give you possession of the item.
                </p>
                <div className="mt-5">
                  <ClaimForm itemId={item.id} onSubmitted={() => setClaimSubmitted(true)} />
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                This item is no longer open for new claims.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import "./ItemDetail.css";

const STATUS_LABELS = {
  active: "Available",
  under_review: "Claim(s) under review",
  unclaimed: "Unclaimed",
  resolved: "Returned to owner",
  cancelled: "Cancelled",
};

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
    <form className="claim-form" onSubmit={handleSubmit}>
      <p className="claim-warning">
        Submitting a claim does not mean this item is automatically yours, and it does
        not reserve it for you. Multiple students may claim the same item — the Student
        Union reviews every claim and decides ownership. If your claim is verified,
        you will need to visit the Student Union Lost &amp; Found office with your
        institutional student ID before the item is released. False claims are
        recorded and may be subject to institutional action.
      </p>

      <fieldset className="claim-type-toggle">
        <legend>Who is this claim for?</legend>
        <label>
          <input
            type="radio"
            name="claimType"
            value="self"
            checked={claimType === "self"}
            onChange={() => setClaimType("self")}
          />
          I am claiming this item for myself
        </label>
        <label>
          <input
            type="radio"
            name="claimType"
            value="on_behalf"
            checked={claimType === "on_behalf"}
            onChange={() => setClaimType("on_behalf")}
          />
          I am claiming this on behalf of someone else
        </label>
      </fieldset>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <label htmlFor="claimant-id">Your institutional student ID</label>
      <input
        id="claimant-id"
        type="text"
        name="claimantStudentId"
        value={form.claimantStudentId}
        onChange={handleChange}
        required
      />

      {claimType === "on_behalf" && (
        <>
          <label htmlFor="owner-id">Institutional student ID of the intended owner</label>
          <input
            id="owner-id"
            type="text"
            name="ownerStudentId"
            value={form.ownerStudentId}
            onChange={handleChange}
            required
          />
        </>
      )}

      <label htmlFor="claimant-contact">Contact information (optional)</label>
      <input
        id="claimant-contact"
        type="text"
        name="claimantContact"
        placeholder="Phone number or email"
        value={form.claimantContact}
        onChange={handleChange}
      />

      <label htmlFor="claim-explanation">Why do you believe this item belongs to you (or the person above)?</label>
      <textarea
        id="claim-explanation"
        name="explanation"
        rows={3}
        value={form.explanation}
        onChange={handleChange}
        required
      />

      <label htmlFor="claim-evidence">Identifying details that could help verify ownership (optional)</label>
      <textarea
        id="claim-evidence"
        name="evidence"
        rows={3}
        placeholder="e.g. a scratch, a sticker, contents, serial number"
        value={form.evidence}
        onChange={handleChange}
      />

      <button type="submit" className="submit-btn" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Claim"}
      </button>
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

  if (loading) return <div className="item-detail-container">Loading item...</div>;
  if (error || !item) {
    return (
      <div className="item-detail-container">
        <p className="form-error" role="alert">
          {error || "This item could not be found."}
        </p>
        <Link to="/found-items">Back to browse</Link>
      </div>
    );
  }

  return (
    <div className="item-detail-container">
      <Link to="/found-items" className="back-link">
        ← Back to browse
      </Link>

      <div className="item-detail-card">
        {item.images?.length > 0 ? (
          <div className="item-detail-images">
            {item.images.map((src, i) => (
              <img key={i} src={src} alt={`${item.title} photo ${i + 1}`} />
            ))}
          </div>
        ) : (
          <div className="item-card-no-image">No photo</div>
        )}

        <h1>{item.title}</h1>
        <p className={`item-status item-status-${item.status}`}>
          {STATUS_LABELS[item.status] || item.status}
        </p>

        <dl className="item-detail-facts">
          <dt>Category</dt>
          <dd>{item.category}</dd>
          <dt>{item.type === "lost" ? "Last known location" : "Found location"}</dt>
          <dd>{item.location}</dd>
          <dt>{item.type === "lost" ? "Approximate date lost" : "Approximate date found"}</dt>
          <dd>{new Date(item.eventDate).toLocaleDateString()}</dd>
        </dl>

        {item.description && <p className="item-detail-description">{item.description}</p>}

        {item.type === "lost" ? (
          <div className="item-detail-note">
            <p>
              This is a lost-item report submitted by a student. If you've found something
              matching this description, please bring it to the ASTU Student Union Lost
              &amp; Found office rather than contacting the reporter directly.
            </p>
          </div>
        ) : claimSubmitted ? (
          <div className="claim-confirmation">
            <h2>Claim submitted</h2>
            <p>
              Thank you. The Student Union will review your claim along with any others
              submitted for this item. If it's verified, you'll need to visit the Student
              Union Lost &amp; Found office with your institutional student ID to collect it.
            </p>
          </div>
        ) : CLAIMABLE_STATUSES.includes(item.status) ? (
          <div className="claim-section">
            <h2>Think this is yours?</h2>
            <p>
              Found items are held at the ASTU Student Union Lost &amp; Found office —
              submitting a claim below does not give you possession of the item.
            </p>
            <ClaimForm itemId={item.id} onSubmitted={() => setClaimSubmitted(true)} />
          </div>
        ) : (
          <div className="item-detail-note">
            <p>This item is no longer open for new claims.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemDetail;

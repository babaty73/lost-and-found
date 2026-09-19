import { useState } from "react";
import api from "../services/api";
import "./ReportLost.css";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB — matches the backend's per-image cap

// The genuine "I lost something" form. No login, no password — a lost
// report only needs an institutional student ID, which is used purely for
// accountability if the item turns up later (see identityProvider on the
// backend for why this is not treated as a credential).
function ReportLost() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    location: "",
    eventDate: "",
    category: "",
    description: "",
    reporterStudentId: "",
    reporterContact: "",
    image: null,
  });

  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files[0];
      if (file) {
        if (file.size > MAX_IMAGE_SIZE) {
          setError("Please upload an image smaller than 2MB.");
          setFileName("");
          setForm({ ...form, image: null });
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          setForm({ ...form, image: reader.result });
          setFileName(file.name);
          setError("");
        };
        reader.readAsDataURL(file);
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      title: form.title,
      location: form.location,
      eventDate: form.eventDate,
      category: form.category,
      description: form.description,
      reporterStudentId: form.reporterStudentId,
      reporterContact: form.reporterContact || undefined,
      images: form.image ? [form.image] : [],
    };

    try {
      await api.post("/items/lost", payload);
      setShowSuccess(true);

      setForm({
        title: "",
        location: "",
        eventDate: "",
        category: "",
        description: "",
        reporterStudentId: "",
        reporterContact: "",
        image: null,
      });
      setFileName("");

      setTimeout(() => setShowSuccess(false), 3500);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to submit your report. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-container">
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h2>Report Submitted!</h2>
            <p>
              Your lost item report has been recorded. If it's found and brought to the
              ASTU Student Union Lost &amp; Found office, staff can match it against your
              report using the student ID you provided.
            </p>
          </div>
        </div>
      )}

      <div className="report-card">
        <h1>Report a Lost Item</h1>
        <p className="report-intro">
          Lost something on campus? Tell us what happened below. There is no login —
          just fill in the details and your institutional student ID so the Student
          Union can reach you if it turns up.
        </p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="report-form">
          <label htmlFor="lost-title">Item title</label>
          <input
            id="lost-title"
            type="text"
            name="title"
            placeholder="e.g. Black backpack"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label htmlFor="lost-description">Description</label>
          <textarea
            id="lost-description"
            name="description"
            placeholder="Any details that could help identify it"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />

          <label htmlFor="lost-location">Last known location</label>
          <input
            id="lost-location"
            type="text"
            name="location"
            placeholder="e.g. Main Library, 2nd floor"
            value={form.location}
            onChange={handleChange}
            required
          />

          <label htmlFor="lost-date">Approximate date</label>
          <input
            id="lost-date"
            type="date"
            name="eventDate"
            value={form.eventDate}
            onChange={handleChange}
            required
          />

          <label htmlFor="lost-category">Category</label>
          <select
            id="lost-category"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="ID">ID Card</option>
            <option value="Electronics">Electronics</option>
            <option value="Book">Book</option>
            <option value="Clothing">Clothing</option>
            <option value="Other">Other</option>
          </select>

          <label htmlFor="lost-student-id">Your institutional student ID</label>
          <input
            id="lost-student-id"
            type="text"
            name="reporterStudentId"
            placeholder="e.g. UGR/1234/17"
            value={form.reporterStudentId}
            onChange={handleChange}
            required
          />
          <p className="field-hint">
            Used only so the Student Union can reach you and verify your identity if
            this item is found. It is never shown publicly.
          </p>

          <label htmlFor="lost-contact">Contact information (optional)</label>
          <input
            id="lost-contact"
            type="text"
            name="reporterContact"
            placeholder="Phone number or email"
            value={form.reporterContact}
            onChange={handleChange}
          />

          <label className="file-label" htmlFor="lost-image">
            Upload a photo (optional)
            <input
              id="lost-image"
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleChange}
              hidden
            />
          </label>

          {fileName && <p className="file-name">Selected: {fileName}</p>}

          {form.image && <img src={form.image} alt="Preview of the uploaded item" className="image-preview" />}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportLost;

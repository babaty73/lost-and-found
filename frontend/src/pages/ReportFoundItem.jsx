import { useState } from "react";
import api from "../services/api";
import "./ReportLost.css";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB — matches the backend's per-image cap

// Reporting something you found is a two-step process, and this page exists
// to make that unmistakable: submitting this form only creates a pending
// record the Student Union can see — it does NOT publish a found-item
// listing. Publication only happens once an admin confirms the physical
// item has actually been handed over (see AdminItemDetail's "Accept
// Physical Handover" action). No login, no password — the student ID here
// is an accountability identifier only, same as the lost-item report.
function ReportFoundItem() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    location: "",
    eventDate: "",
    category: "",
    description: "",
    finderStudentId: "",
    finderContact: "",
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
      finderStudentId: form.finderStudentId,
      finderContact: form.finderContact || undefined,
      images: form.image ? [form.image] : [],
    };

    try {
      await api.post("/items/found-report", payload);
      setShowSuccess(true);

      setForm({
        title: "",
        location: "",
        eventDate: "",
        category: "",
        description: "",
        finderStudentId: "",
        finderContact: "",
        image: null,
      });
      setFileName("");

      setTimeout(() => setShowSuccess(false), 5000);
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
            <h2>Report Submitted</h2>
            <p>
              Please bring the physical item to the ASTU Student Union Lost &amp; Found
              office. Your report will only be published — and searchable by other
              students — after the Student Union receives and verifies the item.
            </p>
          </div>
        </div>
      )}

      <div className="report-card">
        <h1>Report a Found Item</h1>

        <ol className="found-report-steps">
          <li>Tell us what you found using the form below.</li>
          <li>
            Bring the physical item to the <strong>ASTU Student Union Lost &amp; Found
            office</strong>.
          </li>
          <li>Once the Student Union receives it, your report is published so its owner can find it.</li>
        </ol>

        <p className="report-intro">
          Submitting this form does not publish anything yet — it just lets the Student
          Union know to expect you.
        </p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="report-form">
          <label htmlFor="found-report-title">Item title</label>
          <input
            id="found-report-title"
            type="text"
            name="title"
            placeholder="e.g. Silver phone"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label htmlFor="found-report-description">Description</label>
          <textarea
            id="found-report-description"
            name="description"
            placeholder="Any details that could help identify it, or additional context"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />

          <label htmlFor="found-report-location">Where you found it</label>
          <input
            id="found-report-location"
            type="text"
            name="location"
            placeholder="e.g. Cafeteria"
            value={form.location}
            onChange={handleChange}
            required
          />

          <label htmlFor="found-report-date">Approximate date found</label>
          <input
            id="found-report-date"
            type="date"
            name="eventDate"
            value={form.eventDate}
            onChange={handleChange}
            required
          />

          <label htmlFor="found-report-category">Category</label>
          <select
            id="found-report-category"
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

          <label htmlFor="found-report-student-id">Your institutional student ID</label>
          <input
            id="found-report-student-id"
            type="text"
            name="finderStudentId"
            placeholder="e.g. UGR/1234/17"
            value={form.finderStudentId}
            onChange={handleChange}
            required
          />
          <p className="field-hint">
            Used only so the Student Union can reach you about handing the item in. It
            is never shown publicly.
          </p>

          <label htmlFor="found-report-contact">Contact information (optional)</label>
          <input
            id="found-report-contact"
            type="text"
            name="finderContact"
            placeholder="Phone number or email"
            value={form.finderContact}
            onChange={handleChange}
          />

          <label className="file-label" htmlFor="found-report-image">
            Upload a photo (optional)
            <input
              id="found-report-image"
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleChange}
              hidden
            />
          </label>
          {fileName && <p className="file-name">Selected: {fileName}</p>}
          {form.image && <img src={form.image} alt="Preview of the found item" className="image-preview" />}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportFoundItem;

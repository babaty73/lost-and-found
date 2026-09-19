import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ReportLost.css";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB — matches the backend's per-image cap
const RECEIVED_THROUGH_SUGGESTIONS = [
  "Student Union",
  "Library",
  "Dormitory",
  "Security",
  "Department",
  "Cafeteria",
  "Direct",
  "Other",
];

// The Student Union intake form. This is where a physically-received item
// actually enters the system — finder identity is optional and never
// blocks registration (see architecture notes on finder vs. reporter).
function AdminRegisterFoundItem() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    eventDate: "",
    privateDetails: "",
    finderType: "unknown",
    finderStudentId: "",
    finderName: "",
    receivedThrough: "Student Union",
    intakeNotes: "",
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
      category: form.category,
      description: form.description,
      location: form.location,
      eventDate: form.eventDate,
      privateDetails: form.privateDetails,
      images: form.image ? [form.image] : [],
      finder: {
        type: form.finderType,
        studentId: form.finderType === "student" ? form.finderStudentId : undefined,
        name: form.finderType === "staff" ? form.finderName : undefined,
      },
      intake: {
        receivedThrough: form.receivedThrough,
        notes: form.intakeNotes,
      },
    };

    try {
      const res = await api.post("/items/found", payload);
      setShowSuccess(true);
      setTimeout(() => navigate(`/admin/items/${res.data._id}`), 1200);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to register this item. Please try again.";
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
            <h2>Item Registered</h2>
            <p>Redirecting to the item...</p>
          </div>
        </div>
      )}

      <div className="report-card" style={{ maxWidth: 560 }}>
        <h1>Register a Found Item</h1>
        <p className="report-intro">
          For items physically received at the Student Union Lost &amp; Found office.
        </p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="report-form">
          <label htmlFor="found-title">Item title</label>
          <input id="found-title" type="text" name="title" value={form.title} onChange={handleChange} required />

          <label htmlFor="found-description">Description</label>
          <textarea
            id="found-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />

          <label htmlFor="found-category">Category</label>
          <select id="found-category" name="category" value={form.category} onChange={handleChange} required>
            <option value="">Select Category</option>
            <option value="ID">ID Card</option>
            <option value="Electronics">Electronics</option>
            <option value="Book">Book</option>
            <option value="Clothing">Clothing</option>
            <option value="Other">Other</option>
          </select>

          <label htmlFor="found-location">Found location</label>
          <input id="found-location" type="text" name="location" value={form.location} onChange={handleChange} required />

          <label htmlFor="found-date">Approximate date found</label>
          <input id="found-date" type="date" name="eventDate" value={form.eventDate} onChange={handleChange} required />

          <label className="file-label" htmlFor="found-image">
            Upload a photo (optional)
            <input
              id="found-image"
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleChange}
              hidden
            />
          </label>
          {fileName && <p className="file-name">Selected: {fileName}</p>}
          {form.image && <img src={form.image} alt="Preview of the found item" className="image-preview" />}

          <hr />
          <p className="field-hint">Finder information (optional — never required to register an item)</p>

          <label htmlFor="finder-type">Finder</label>
          <select id="finder-type" name="finderType" value={form.finderType} onChange={handleChange}>
            <option value="unknown">Unknown / declined to identify</option>
            <option value="student">Student</option>
            <option value="staff">Staff member</option>
          </select>

          {form.finderType === "student" && (
            <>
              <label htmlFor="finder-student-id">Finder's institutional student ID</label>
              <input
                id="finder-student-id"
                type="text"
                name="finderStudentId"
                value={form.finderStudentId}
                onChange={handleChange}
              />
            </>
          )}

          {form.finderType === "staff" && (
            <>
              <label htmlFor="finder-name">Finder's name or role</label>
              <input id="finder-name" type="text" name="finderName" value={form.finderName} onChange={handleChange} />
            </>
          )}

          <label htmlFor="received-through">Received through</label>
          <select id="received-through" name="receivedThrough" value={form.receivedThrough} onChange={handleChange}>
            {RECEIVED_THROUGH_SUGGESTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <label htmlFor="intake-notes">Intake notes (optional)</label>
          <textarea
            id="intake-notes"
            name="intakeNotes"
            value={form.intakeNotes}
            onChange={handleChange}
            rows={2}
          />

          <label htmlFor="private-details">
            Private verification details (never shown publicly)
          </label>
          <textarea
            id="private-details"
            name="privateDetails"
            placeholder="e.g. small scratch under left corner, a distinctive sticker"
            value={form.privateDetails}
            onChange={handleChange}
            rows={2}
          />

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Registering..." : "Register Item"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminRegisterFoundItem;

import { useState } from "react";
import api from "../services/api";
import { Button, Input, Textarea, Select, ErrorState, Card } from "../components/ui";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB — matches the backend's per-image cap

const STEPS = [
  "Tell us what you found using the form below.",
  "Bring the physical item to the ASTU Student Union Lost & Found office.",
  "Once the Student Union receives it, your report is published so its owner can find it.",
];

// Reporting something you found is a two-step process, and this page exists
// to make that unmistakable: submitting this form only creates a pending
// record the Student Union can see — it does NOT publish a found-item
// listing. Publication only happens once an admin confirms the physical
// item has actually been handed over (see AdminItemDetail's "Accept
// Physical Handover" action). No login, no password — the student ID here
// is an accountability identifier only. This is the ONLY student reporting
// workflow; there is no lost-item report anywhere in this app.
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

      setTimeout(() => setShowSuccess(false), 6000);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to submit your report. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Report a Found Item
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        This is the only way students report items on this platform — there is no
        separate lost-item report.
      </p>

      <Card className="mt-6 !border-primary-100 !bg-primary-50/50 !shadow-none">
        <ol className="space-y-2 text-sm text-primary-900">
          {STEPS.map((step, i) => (
            <li key={step} className="flex gap-2.5">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-[11px] font-semibold text-white">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Card>

      {showSuccess && (
        <div className="mt-6 animate-fade-in rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
              ✓
            </span>
            <div>
              <h2 className="text-sm font-semibold text-green-900">Report submitted</h2>
              <p className="mt-1 text-sm text-green-800">
                Please bring the physical item to the ASTU Student Union Lost &amp; Found
                office. Your report will only be published — and searchable by other
                students — after the Student Union receives and verifies the item.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {error && <ErrorState>{error}</ErrorState>}

        <Input
          id="found-report-title"
          label="Item title"
          name="title"
          placeholder="e.g. Silver phone"
          value={form.title}
          onChange={handleChange}
          required
        />

        <Textarea
          id="found-report-description"
          label="Description"
          name="description"
          placeholder="Any details that could help identify it, or additional context"
          value={form.description}
          onChange={handleChange}
        />

        <Input
          id="found-report-location"
          label="Where you found it"
          name="location"
          placeholder="e.g. Cafeteria"
          value={form.location}
          onChange={handleChange}
          required
        />

        <Input
          id="found-report-date"
          label="Approximate date found"
          type="date"
          name="eventDate"
          value={form.eventDate}
          onChange={handleChange}
          required
        />

        <Select
          id="found-report-category"
          label="Category"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="">Select category</option>
          <option value="ID">ID Card</option>
          <option value="Electronics">Electronics</option>
          <option value="Book">Book</option>
          <option value="Clothing">Clothing</option>
          <option value="Other">Other</option>
        </Select>

        <Input
          id="found-report-student-id"
          label="Your institutional student ID"
          name="finderStudentId"
          placeholder="e.g. UGR/1234/17"
          value={form.finderStudentId}
          onChange={handleChange}
          required
          hint="Used only so the Student Union can reach you about handing the item in. It is never shown publicly."
        />

        <Input
          id="found-report-contact"
          label="Contact information (optional)"
          name="finderContact"
          placeholder="Phone number or email"
          value={form.finderContact}
          onChange={handleChange}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Upload a photo (optional)
          </label>
          <label
            htmlFor="found-report-image"
            className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 transition hover:border-primary-400 hover:text-primary-600"
          >
            {fileName || "Click to choose an image (JPEG, PNG, or WEBP, under 2MB)"}
            <input
              id="found-report-image"
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleChange}
              hidden
            />
          </label>
          {form.image && (
            <img
              src={form.image}
              alt="Preview of the found item"
              className="mt-3 h-40 w-40 rounded-lg object-cover ring-1 ring-slate-200"
            />
          )}
        </div>

        <Button type="submit" size="lg" loading={submitting} className="w-full sm:w-auto">
          {submitting ? "Submitting..." : "Submit Report"}
        </Button>
      </form>
    </div>
  );
}

export default ReportFoundItem;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Button, Input, Textarea, Select, ErrorState, PageHeader } from "../components/ui";
import { useToast } from "../components/ui";

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
  const showToast = useToast();
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
      showToast("Item registered.", "success");
      navigate(`/admin/items/${res.data._id}`);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to register this item. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Register a Found Item"
        description="For items physically received at the Student Union Lost & Found office."
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <ErrorState>{error}</ErrorState>}

        <Input id="found-title" label="Item title" name="title" value={form.title} onChange={handleChange} required />

        <Textarea
          id="found-description"
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <Select id="found-category" label="Category" name="category" value={form.category} onChange={handleChange} required>
          <option value="">Select category</option>
          <option value="ID">ID Card</option>
          <option value="Electronics">Electronics</option>
          <option value="Book">Book</option>
          <option value="Clothing">Clothing</option>
          <option value="Other">Other</option>
        </Select>

        <Input id="found-location" label="Found location" name="location" value={form.location} onChange={handleChange} required />

        <Input
          id="found-date"
          label="Approximate date found"
          type="date"
          name="eventDate"
          value={form.eventDate}
          onChange={handleChange}
          required
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Upload a photo (optional)</label>
          <label
            htmlFor="found-image"
            className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 transition hover:border-primary-400 hover:text-primary-600"
          >
            {fileName || "Click to choose an image"}
            <input
              id="found-image"
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleChange}
              hidden
            />
          </label>
          {form.image && (
            <img src={form.image} alt="Preview of the found item" className="mt-3 h-40 w-40 rounded-lg object-cover ring-1 ring-slate-200" />
          )}
        </div>

        <div className="border-t border-slate-200 pt-5">
          <p className="mb-4 text-sm font-medium text-slate-500">
            Finder information (optional — never required to register an item)
          </p>

          <div className="space-y-5">
            <Select id="finder-type" label="Finder" name="finderType" value={form.finderType} onChange={handleChange}>
              <option value="unknown">Unknown / declined to identify</option>
              <option value="student">Student</option>
              <option value="staff">Staff member</option>
            </Select>

            {form.finderType === "student" && (
              <Input
                id="finder-student-id"
                label="Finder's institutional student ID"
                name="finderStudentId"
                value={form.finderStudentId}
                onChange={handleChange}
              />
            )}

            {form.finderType === "staff" && (
              <Input
                id="finder-name"
                label="Finder's name or role"
                name="finderName"
                value={form.finderName}
                onChange={handleChange}
              />
            )}

            <Select
              id="received-through"
              label="Received through"
              name="receivedThrough"
              value={form.receivedThrough}
              onChange={handleChange}
            >
              {RECEIVED_THROUGH_SUGGESTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>

            <Textarea
              id="intake-notes"
              label="Intake notes (optional)"
              name="intakeNotes"
              value={form.intakeNotes}
              onChange={handleChange}
              rows={2}
            />

            <Textarea
              id="private-details"
              label="Private verification details (never shown publicly)"
              name="privateDetails"
              placeholder="e.g. small scratch under left corner, a distinctive sticker"
              value={form.privateDetails}
              onChange={handleChange}
              rows={2}
            />
          </div>
        </div>

        <Button type="submit" size="lg" loading={submitting} className="w-full sm:w-auto">
          {submitting ? "Registering..." : "Register Item"}
        </Button>
      </form>
    </div>
  );
}

export default AdminRegisterFoundItem;

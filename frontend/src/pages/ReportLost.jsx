import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportLost.css";

function ReportLost({ foundItems, setFoundItems }) {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    location: "",
    date: "",
    category: "",
    image: null,
  });

  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setForm({ ...form, image: reader.result });
          setFileName(file.name);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newItem = {
      ...form,
      id: Date.now().toString(),
      status: "available",
    };

    setFoundItems([...foundItems, newItem]);

    setShowSuccess(true);

    setTimeout(() => {
      navigate("/report-found");
    }, 2000);

    // reset form properly
    setForm({
      name: "",
      location: "",
      date: "",
      category: "",
      image: null,
    });

    setFileName("");
  };

  return (
    <div className="report-container">
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h2>Report Submitted!</h2>
            <p>Thank you for your submission. Redirecting...</p>
          </div>
        </div>
      )}

      <div className="report-card">
        <h1>Report Found Item</h1>

        <form onSubmit={handleSubmit} className="report-form">
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="location"
            placeholder="Location Found"
            value={form.location}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />

          {/* Category Dropdown */}
          <select
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

          {/* Custom File Upload */}
          <label className="file-label">
            Upload Item Image
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              hidden
            />
          </label>

          {/* Show file name */}
          {fileName && (
            <p className="file-name">Selected: {fileName}</p>
          )}

          {/* Image Preview */}
          {form.image && (
            <img
              src={form.image}
              alt="Preview"
              className="image-preview"
            />
          )}

          <button type="submit" className="submit-btn">
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportLost;

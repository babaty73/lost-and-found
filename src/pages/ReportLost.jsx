import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportLost.css";

function ReportLost({ foundItems, setFoundItems }) {
  const navigate = useNavigate();

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
        const imageURL = URL.createObjectURL(file);
        setForm({ ...form, image: imageURL });
        setFileName(file.name);
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setFoundItems([
  ...foundItems,
  { ...form, status: "available" }
]);


    alert("Your report was successfully submitted!");

    navigate("/report-found");

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

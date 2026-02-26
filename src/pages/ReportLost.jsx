import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ReportLost({ foundItems, setFoundItems }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    location: "",
    date: "",
    image: null,
  });

  const handleChange = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files[0];
      const imageURL = URL.createObjectURL(file);
      setForm({ ...form, image: imageURL });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setFoundItems([...foundItems, form]);

    alert("Your report was successfully submitted!");

    navigate("/report-found");

    setForm({
      name: "",
      location: "",
      date: "",
      image: null,
    });
  };

  return (
    <div>
      <h1>Report Found Item</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Item Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="location"
          placeholder="Location"
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

        {/* Image Upload */}
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default ReportLost;

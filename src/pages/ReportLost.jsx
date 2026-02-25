import { useState } from "react";
import { items } from "../data/data";
import ItemCard from "../components/ItemCard";

function ReportLost() {
  const [lostItems, setLostItems] = useState(items);
  const [form, setForm] = useState({ name: "", category: "", location: "", date: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLostItems([...lostItems, form]);
    setForm({ name: "", category: "", location: "", date: "" });
  };

  return (
    <div>
      <h1>Report Lost Item</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Item Name" value={form.name} onChange={handleChange} required />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
        <input name="location" placeholder="Location" value={form.location} onChange={handleChange} required />
        <input type="date" name="date" value={form.date} onChange={handleChange} required />
        <button type="submit">Add Lost Item</button>
      </form>

      <h2>Lost Items</h2>
      {lostItems.map((item, index) => <ItemCard key={index} item={item} />)}
    </div>
  );
}

export default ReportLost;

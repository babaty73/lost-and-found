import { useState } from "react";
import "./ItemCard.css";

function ItemCard({ item, updateItemStatus }) {
  const [claiming, setClaiming] = useState(false);
  const [claimer, setClaimer] = useState({ name: "", id: "" });

  const handleClaimClick = () => setClaiming(true);

  const handleChange = (e) => setClaimer({ ...claimer, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedItem = { ...item, status: "pending", claimer };
    updateItemStatus(item, updatedItem); // <-- pass original item and updated item
    setClaiming(false);
    setClaimer({ name: "", id: "" });
  };

  return (
    <div className="item-card">
      <img src={item.image} alt={item.name} />
      <h3>{item.name}</h3>
      <p>Location: {item.location}</p>
      <p>Date: {item.date}</p>
      <p>Status: {item.status}</p>

      {item.status === "available" && !claiming && (
        <button className="claim-btn" onClick={handleClaimClick}>Claim</button>
      )}

      {claiming && (
        <form className="claim-form" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Your Name" value={claimer.name} onChange={handleChange} required />
          <input type="text" name="id" placeholder="Your ID" value={claimer.id} onChange={handleChange} required />
          <button type="submit">Submit Claim</button>
          <button type="button" onClick={() => setClaiming(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
}

export default ItemCard;

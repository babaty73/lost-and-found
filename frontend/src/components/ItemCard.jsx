import { Link } from "react-router-dom";
import "./ItemCard.css";

const STATUS_LABELS = {
  active: "Available",
  under_review: "Claim(s) under review",
  unclaimed: "Unclaimed",
  resolved: "Returned",
  cancelled: "Cancelled",
};

// A pure display card — no claim logic lives here anymore. Submitting a
// claim now happens on the item's own detail page and is persisted by the
// backend (see ItemDetail.jsx), not held in local component state.
function ItemCard({ item }) {
  const thumbnail = item.images?.[0];
  const eventDate = item.eventDate ? new Date(item.eventDate).toLocaleDateString() : "";

  return (
    <Link to={`/items/${item.id}`} className="item-card">
      {thumbnail ? (
        <img src={thumbnail} alt={`Photo of ${item.title}`} />
      ) : (
        <div className="item-card-no-image" aria-hidden="true">
          No photo
        </div>
      )}
      <h3>{item.title}</h3>
      <p>Location: {item.location}</p>
      <p>Found: {eventDate}</p>
      <p className={`item-status item-status-${item.status}`}>
        {STATUS_LABELS[item.status] || item.status}
      </p>
    </Link>
  );
}

export default ItemCard;

import "./ItemCard.css";
function ItemCard({ item }) {
  return (
    <div className="item-card">
      <div className="item-content">
        <h3>{item.name}</h3>
        <p><strong>Founded:</strong> {item.location}</p>
        <p><strong>Date:</strong> {item.date}</p>

        {item.image && (
          <img src={item.image} alt={item.name} />
        )}
      </div>

      <div className="item-actions">
        <button>Retrieve It</button>
      </div>
    </div>
  );
}

export default ItemCard;

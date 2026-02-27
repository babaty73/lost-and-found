import "./ItemCard.css";
function ItemCard({ item }) {
  return (
    <div className="item-card">
      <h3>{item.name}</h3>
      <p><strong>Location:</strong> {item.location}</p>
      <p><strong>Date:</strong> {item.date}</p>

      {item.image && (
        <div className="image-container">
          <img
            src={item.image}
            alt={item.name}
          />
        </div>
      )}

      <button className="retrieve-button">Retrieve It</button>
    </div>
  );
}

export default ItemCard;

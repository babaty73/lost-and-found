function ItemCard({ item }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        margin: "10px 0",
        borderRadius: "8px",
      }}
    >
      <h3>{item.name}</h3>
      <p><strong>Founded:</strong> {item.location}</p>
      <p><strong>Date:</strong> {item.date}</p>

      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          style={{ width: "150px", marginTop: "10px", borderRadius: "8px" }}
        />
      )}
    </div>
  );
}

export default ItemCard;

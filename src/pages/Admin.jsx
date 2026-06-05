import "./Admin.css";

function Admin({ foundItems, setFoundItems }) {
  const pendingRequests = foundItems.filter((item) => item.status === "pending");

  const handleContacted = (item) => {
    const updatedItems = foundItems.map((currentItem) =>
      currentItem === item ? { ...currentItem, status: "contacted" } : currentItem
    );
    setFoundItems(updatedItems);
  };

  return (
    <div className="admin-container">
      <h1>Admin Requests</h1>

      {pendingRequests.length === 0 ? (
        <div className="admin-empty">
          <h3>No pending claim requests</h3>
          <p>Once a user submits a claim, it will appear here for review.</p>
        </div>
      ) : (
        <div className="admin-grid">
          {pendingRequests.map((item) => (
            <div className="admin-card" key={item.id || `${item.name}-${item.date}`}> 
              <div className="admin-card-header">
                <h2>{item.name}</h2>
                <span className="admin-status">{item.status}</span>
              </div>

              <p>
                <strong>Location:</strong> {item.location}
              </p>
              <p>
                <strong>Date:</strong> {item.date}
              </p>
              <p>
                <strong>Category:</strong> {item.category || "Unknown"}
              </p>
              <p>
                <strong>Submitted by:</strong> {item.claimer?.name || "N/A"}
              </p>
              <p>
                <strong>Claimant ID:</strong> {item.claimer?.id || "N/A"}
              </p>
              <p>
                 {item.image ? <img src={item.image} style={{ maxWidth: "70%", height: "auto" }} alt="Item" /> : "No image available"}
              </p>
              <p className="admin-note">
                Use the name and ID above to contact the claimant.
              </p>

              <button
                className="admin-contacted-btn"
                onClick={() => handleContacted(item)}
              >
                Mark Contacted
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Admin;

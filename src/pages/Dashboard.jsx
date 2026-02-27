import { useState, useEffect } from "react";
import ItemCard from "../components/ItemCard";
import "./Dashboard.css";

function Dashboard({ foundItems }) {
  const [animate, setAnimate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState(foundItems);

  useEffect(() => {
    setAnimate(true);
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = foundItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
    );
    setFilteredItems(filtered)
  }, [searchQuery, foundItems]);

  const retrievedCount = 0;

  return (
    <div className="dashboard-container">
      <h1 className="fade-in">Dashboard</h1>
      <p className="dashboard-subtitle fade-in">
        Manage all found items from here.
      </p>

      {/* Search Bar */}
      <div className="search-container fade-in">
        <input
          type="text"
          placeholder="Search items by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Stats Section */}
      <div className={`stats-container ${animate ? "show" : ""}`}>
        <div className="stat-box">
          <h2>{foundItems.length}</h2>
          <p>Found Items</p>
        </div>

        <div className="stat-box">
          <h2>{retrievedCount}</h2>
          <p>Retrieved Items</p>
        </div>
      </div>

      {/* Cards */}
      {filteredItems.length === 0 ? (
        <div className="empty-state fade-in">
          <h3>No items found</h3>
          <p>Items matching your search will appear here.</p>
        </div>
      ) : (
        <div className="cards-container">
          {filteredItems.map((item, index) => (
            <ItemCard key={index} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;

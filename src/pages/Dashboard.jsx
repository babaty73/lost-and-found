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

    </div>
  );
}

export default Dashboard;

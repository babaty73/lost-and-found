import { useState } from "react";
import ItemCard from "../components/ItemCard";
import "./Dashboard.css";

function Dashboard({ foundItems }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = foundItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      {/* Stats Section */}
      <div className="stats-container">
        <div className="stat-box">
          <h2>{foundItems.length}</h2>
          <p>Found Items</p>
        </div>

        <div className="stat-box">
          <h2>0</h2>
          <p>Retrieved Items</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by item name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Items */}
      {filteredItems.length === 0 ? (
        <p className="no-items">No matching items found.</p>
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

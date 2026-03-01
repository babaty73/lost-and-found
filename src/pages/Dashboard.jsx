import { useState, useEffect } from "react";
import ItemCard from "../components/ItemCard";
import "./Dashboard.css";

function Dashboard() {
  // Load items from localStorage
  const [foundItems, setFoundItems] = useState(() => {
    return JSON.parse(localStorage.getItem("foundItems")) || [];
  });

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  // Keep localStorage updated
  useEffect(() => {
    localStorage.setItem("foundItems", JSON.stringify(foundItems));
  }, [foundItems]);

  // Count retrieved items
  const retrievedCount = foundItems.filter(
    (item) => item.retrieved === true
  ).length;

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

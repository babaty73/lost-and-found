import "./Dashboard.css";

function Dashboard({ foundItems }) {
  // Count retrieved items
  const retrievedCount = foundItems.filter(
    (item) => item.retrieved === true
  ).length;

  return (
    <div className="dashboard-container">
      <h1 className="fade-in">Dashboard</h1>

      {/* Stats Section */}
      <div className="stats-container show">
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

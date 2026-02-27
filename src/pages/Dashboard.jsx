import ItemCard from "../components/ItemCard";
import "./Dashboard.css";

function Dashboard({ foundItems }) {
  const totalFound = foundItems.length;
  const retrievedCount = 0;

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p className="dashboard-subtitle">
        Overview of all reported found items
      </p>

      {/*  NEW STATS SECTION */}
      <div className="stats-container">
        <div className="stat-box found-box">
          <h2>{totalFound}</h2>
          <p>Items Found</p>
        </div>

        <div className="stat-box retrieved-box">
          <h2>{retrievedCount}</h2>
          <p>Items Retrieved</p>
        </div>
      </div>

      {/*  EXISTING ITEMS DISPLAY */}
      {foundItems.length === 0 ? (
        <p className="no-items">No found items reported yet.</p>
      ) : (
        <div className="cards-container">
          {foundItems.map((item, index) => (
            <ItemCard key={index} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;

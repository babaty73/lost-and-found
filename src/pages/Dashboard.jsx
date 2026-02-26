import ItemCard from "../components/ItemCard";
import "./Dashboard.css";

function Dashboard({ foundItems }) {
  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p className="dashboard-subtitle">
        All items reported as found are displayed below:
      </p>

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

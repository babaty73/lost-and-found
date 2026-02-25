import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#eee" }}>
      <Link to="/">Home</Link> |{" "}
      <Link to="/report-lost">Report Lost</Link> |{" "}
      <Link to="/report-found">Report Found</Link> |{" "}
      <Link to="/search">Search</Link> |{" "}
      <Link to="/dashboard">Dashboard</Link>
    </nav>
  );
}

export default Navbar;

import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ReportLost from "./pages/ReportLost";
import ReportFound from "./pages/FoundedItems";
import Search from "./pages/Search";
import Dashboard from "./pages/Dashboard";

function App() {
  const [foundItems, setFoundItems] = useState([]);

  return (
    <>
      <Navbar />

      <Routes>
       <Route path="/" element={<Home />} />

  <Route
    path="/report-lost"
    element={
      <ReportLost
        foundItems={foundItems}
        setFoundItems={setFoundItems}
      />
    }
  />
<Route
    path="/report-found"
    element={
      <ReportFound
        foundItems={foundItems}
        setFoundItems={setFoundItems}
      />
    }
  />

        <Route
    path="/search"
    element={<Search  foundItems={foundItems} />}
  />
          
        

      <Route
    path="/dashboard"
    element={<Dashboard foundItems={foundItems} />}
  />
         
      </Routes>
    

    </>
  );
}

export default App;

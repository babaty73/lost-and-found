import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ReportLost from "./pages/ReportLost";
import FoundedItems from "./pages/FoundedItems";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [foundItems, setFoundItems] = useState(() => {
    try {
      const stored = localStorage.getItem("foundItems");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load found items from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("foundItems", JSON.stringify(foundItems));
    } catch (error) {
      console.error("Failed to save found items to localStorage:", error);
    }
  }, [foundItems]);

  return (
    <>
      {isLoggedIn && <Navbar setIsLoggedIn={setIsLoggedIn} />}

      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/home" /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />

        <Route path="/register" element={<Register />} />

        <Route
          path="/home"
          element={isLoggedIn ? <Home /> : <Navigate to="/login" />}
        />

        <Route
          path="/report-lost"
          element={
            isLoggedIn ? (
              <ReportLost
                foundItems={foundItems}
                setFoundItems={setFoundItems}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
  path="/report-found"
  element={
    isLoggedIn ? (
      <FoundedItems 
        foundItems={foundItems} 
        setFoundItems={setFoundItems} 
      />
    ) : (
      <Navigate to="/login" />
    )
  }
/>


        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <Dashboard foundItems={foundItems} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;

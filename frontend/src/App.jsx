import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import api from "./services/api"
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ReportLost from "./pages/ReportLost";
import FoundedItems from "./pages/FoundedItems";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem("isLoggedIn") === "true";
    } catch (error) {
      console.error("Failed to load login state from localStorage:", error);
      return false;
    }
  });
  const [userRole, setUserRole] = useState(() => {
    try {
      return localStorage.getItem("userRole") || "user";
    } catch (error) {
      console.error("Failed to load user role from localStorage:", error);
      return "user";
    }
  });
  const [foundItems, setFoundItems] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await api.get("/items");
        setFoundItems(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    getData();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("isLoggedIn", isLoggedIn ? "true" : "false");
      localStorage.setItem("userRole", userRole);
    } catch (error) {
      console.error("Failed to save login state to localStorage:", error);
    }
  }, [isLoggedIn, userRole]);

  return (
    <>
      {isLoggedIn && <Navbar setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} userRole={userRole} />} 

      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/home" /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />}
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

        <Route
          path="/admin"
          element={
            isLoggedIn && userRole === "admin" ? (
              <Admin foundItems={foundItems} setFoundItems={setFoundItems} />
            ) : (
              <Navigate to="/home" />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;

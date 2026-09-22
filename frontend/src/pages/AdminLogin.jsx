import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { saveAdminSession } from "../services/adminAuth";
import "./AdminLogin.css";

// This is the ONLY login in the application. Students never see a login
// screen at all — see the architecture notes for why. This page exists
// purely for the ASTU Student Union office staff.
function AdminLogin({ onLogin }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await api.post("/auth/login", form);
      saveAdminSession(res.data.token, res.data.user);
      onLogin?.(res.data.user);
      navigate("/admin");
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong while logging in. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Student Union Admin Login</h2>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          name="email"
          autoComplete="username"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;

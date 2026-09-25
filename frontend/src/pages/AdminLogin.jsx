import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { saveAdminSession } from "../services/adminAuth";
import { Button, Input, ErrorState } from "../components/ui";

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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12">
      <form
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-card"
        onSubmit={handleSubmit}
      >
        <h1 className="text-center text-xl font-bold text-slate-900">Student Union Admin Login</h1>

        {error && <ErrorState className="mt-5">{error}</ErrorState>}

        <div className="mt-6 space-y-4">
          <Input
            id="admin-email"
            label="Email"
            type="email"
            name="email"
            autoComplete="username"
            value={form.email}
            onChange={handleChange}
            required
          />

          <Input
            id="admin-password"
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit" loading={submitting} className="mt-6 w-full">
          {submitting ? "Logging in..." : "Login"}
        </Button>

        <p className="mt-5 text-center text-xs text-slate-500">
          This login is for ASTU Student Union staff only. Students do not need an
          account to report or search for items.
        </p>
      </form>
    </div>
  );
}

export default AdminLogin;

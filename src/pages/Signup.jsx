import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signup } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form);
      navigate("/login");
    } catch (err) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card border-0 shadow-xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-teal-600">Create account</h1>
            <p className="mt-1 text-sm text-slate-500">
              Discover scholarships tailored for you
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input-base"
                required
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="input-base"
                required
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="input-base"
                required
                minLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-semibold text-teal-600 hover:text-teal-700 hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          100% free · No agents · Secure data
        </p>
      </div>
    </div>
  );
}

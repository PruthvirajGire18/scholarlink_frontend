import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const role = await login(form);
      if (role === "STUDENT") navigate("/student");
      if (role === "MODERATOR") navigate("/moderator");
      if (role === "ADMIN") navigate("/admin");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card border-0 shadow-xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-teal-600">ScholarLink</h1>
            <p className="mt-1 text-sm text-slate-500">
              Verified scholarships · Trusted platform
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
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="login-email"
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
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input-base pr-24"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? "Signing in…" : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New student?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="font-semibold text-teal-600 hover:text-teal-700 hover:underline"
            >
              Create account
            </button>
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          Used by students across India
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const role = await login(form);
      if (role === "STUDENT") navigate("/student");
      if (role === "MODERATOR") navigate("/moderator");
      if (role === "ADMIN") navigate("/admin");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Branding */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-indigo-700">
            ScholarLink
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Verified Scholarships • Trusted Platform
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <span
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-3 text-sm text-indigo-600 cursor-pointer"
            >
              {showPass ? "Hide" : "Show"}
            </span>
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition 
              ${loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          New student?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            Create account
          </span>
        </div>

        <p className="text-xs text-center text-gray-400 mt-4">
          Used by students across India 🇮🇳
        </p>
      </div>
    </div>
  );
}

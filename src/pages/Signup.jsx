import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const submit = async () => {
    setLoading(true);
    await signup(form);
    setLoading(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-emerald-700">
            Student Registration
          </h1>
          <p className="text-sm text-gray-500">
            Discover scholarships tailored for you
          </p>
        </div>

        <div className="space-y-4">
          <input
            placeholder="Full Name"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Create strong password"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            onClick={submit}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition 
              ${loading ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          Already registered?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-emerald-600 font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </div>

        <p className="text-xs text-center text-gray-400 mt-4">
          100% Free • No agents • Secure data
        </p>
      </div>
    </div>
  );
}

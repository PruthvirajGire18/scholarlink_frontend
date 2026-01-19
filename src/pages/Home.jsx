import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      {/* HERO SECTION */}
      <section className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">

          {/* LEFT */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
              Find the <span className="text-indigo-600">Right Scholarships</span><br />
              Made Just For You 🎓
            </h1>

            <p className="mt-5 text-gray-600 text-lg">
              A smart platform that matches students with government, NGO and
              private scholarships based on eligibility, income, marks and category.
            </p>

            {!user && (
              <div className="mt-8 space-x-4">
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-indigo-700"
                >
                  Get Started
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg text-lg hover:bg-indigo-50"
                >
                  Login
                </button>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Why ScholarLink?
            </h3>

            <ul className="space-y-3 text-gray-600">
              <li>✅ Smart eligibility matching</li>
              <li>✅ Government & private scholarships</li>
              <li>✅ Deadline alerts & reminders</li>
              <li>✅ One profile – multiple applications</li>
              <li>✅ Special focus on needy students</li>
            </ul>
          </div>

        </div>
      </section>
    </>
  );
}

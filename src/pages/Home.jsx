import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-slate-100" />
      <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="absolute bottom-20 left-10 h-96 w-96 rounded-full bg-amber-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">
              Scholarship matching platform
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Find the right scholarships{" "}
              <span className="text-teal-600">made for you</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600 leading-relaxed">
              A trusted platform that matches students with government, NGO and private
              scholarships based on eligibility, income, marks and category.
            </p>

            {!user && (
              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/signup")}
                  className="btn-primary px-6 py-3 text-base"
                >
                  Get started
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="btn-secondary px-6 py-3 text-base"
                >
                  Log in
                </button>
              </div>
            )}
          </div>

          <div className="card relative border-0 bg-white/80 p-8 shadow-lg backdrop-blur sm:p-10">
            <h3 className="text-xl font-bold text-slate-900">
              Why ScholarLink?
            </h3>
            <ul className="mt-6 space-y-4 text-slate-600">
              {[
                "Smart eligibility matching so you only see relevant scholarships",
                "Government, NGO and private schemes in one place",
                "Deadline alerts and application guidance",
                "One profile — apply to multiple scholarships",
                "Special focus on needy and underrepresented students",
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600 text-sm font-bold">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../i18n";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const dashboardPath =
    user?.role === "ADMIN" ? "/admin" : user?.role === "MODERATOR" ? "/moderator" : "/student";

  return (
    <section className="relative overflow-hidden pb-12 pt-6 sm:pb-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,rgba(45,212,191,0.16),transparent_22%),radial-gradient(circle_at_90%_0%,rgba(251,191,36,0.18),transparent_21%)]" />
      <div className="page-container">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="card lg:col-span-7 lg:p-10">
            <p className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
              {t("home.tagline")}
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
              {t("home.title")} {" "}
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {t("home.titleHighlight")}
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {t("home.subtitle")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {!user && (
                <>
                  <button onClick={() => navigate("/signup")} className="btn-primary px-6 py-3 text-base">
                    {t("home.getStarted")}
                  </button>
                  <button onClick={() => navigate("/login")} className="btn-secondary px-6 py-3 text-base">
                    {t("nav.login")}
                  </button>
                </>
              )}
              {user && (
                <>
                  <button onClick={() => navigate(dashboardPath)} className="btn-primary px-6 py-3 text-base">
                    Open Dashboard
                  </button>
                  <button onClick={() => navigate("/student/profile")} className="btn-secondary px-6 py-3 text-base">
                    Update Profile
                  </button>
                </>
              )}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Smart Matching</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">Eligibility-first recommendations</p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">One Profile</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">Reuse data and documents instantly</p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Safer Process</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">Manual final submission on official portals</p>
              </article>
            </div>
          </div>

          <div className="card lg:col-span-5 lg:p-8">
            <h2 className="text-xl font-extrabold text-slate-900">{t("home.whyTitle")}</h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
              {[t("home.why1"), t("home.why2"), t("home.why3"), t("home.why4"), t("home.why5")].map((item, i) => (
                <li key={i} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                    OK
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Final submission and verification always happen on official scholarship portals.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

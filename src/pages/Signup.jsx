import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n";

export default function Signup() {
  const { t } = useTranslation();
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
      setError(err?.message || t("auth.registrationFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_90%_5%,rgba(20,184,166,0.18),transparent_22%),radial-gradient(circle_at_0%_20%,rgba(14,165,233,0.15),transparent_20%)]" />
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-12 lg:items-stretch">
        <aside className="card hidden lg:col-span-5 lg:block lg:p-8">
          <p className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
            Quick onboarding
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">Create your student account</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">Start with basic details now. Complete profile and documents inside dashboard for accurate eligibility.</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Save once, apply across multiple scholarships</li>
            <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Track notifications and deadlines in one place</li>
            <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Accessible interface with language and voice tools</li>
          </ul>
        </aside>

        <div className="card lg:col-span-7 lg:p-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">{t("auth.createAccountTitle")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("auth.createAccountSubtitle")}</p>
          </div>

          {error && (
            <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="signup-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {t("auth.fullName")}
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                placeholder={t("auth.namePlaceholder")}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input-base"
                required
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {t("auth.email")}
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder={t("auth.emailPlaceholder")}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="input-base"
                required
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {t("auth.password")}
              </label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                placeholder={t("auth.passwordPlaceholder")}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="input-base"
                required
                minLength={8}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? t("auth.creatingAccount") : t("auth.createAccount")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 lg:text-left">
            {t("auth.alreadyHave")}{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
            >
              {t("nav.login")}
            </button>
          </p>

          <p className="mt-6 text-center text-xs text-slate-400 lg:text-left">{t("auth.freeSecure")}</p>
        </div>
      </div>
    </div>
  );
}

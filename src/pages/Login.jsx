import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n";

export default function Login() {
  const { t } = useTranslation();
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
      const currentUser = await login(form);
      if (currentUser.role === "STUDENT") navigate("/student");
      if (currentUser.role === "MODERATOR") navigate("/moderator");
      if (currentUser.role === "ADMIN") navigate("/admin");
    } catch (currentError) {
      setError(currentError.message || t("auth.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_15%,rgba(20,184,166,0.17),transparent_24%),radial-gradient(circle_at_88%_6%,rgba(250,204,21,0.16),transparent_18%)]" />
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-12 lg:items-stretch">
        <aside className="auth-side-panel">
          <p className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
            Student-first platform
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">{t("nav.brand")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{t("auth.verifiedPlatform")}</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Priority-based scholarship matching and ranking</li>
            <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">One profile for multi-application workflows</li>
            <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Need-help threads with moderator collaboration</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="badge badge-neutral">Secure login</span>
            <span className="badge badge-neutral">Role-based dashboard</span>
            <span className="badge badge-neutral">Multilingual UX</span>
          </div>
        </aside>

        <div className="auth-form-panel">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">{t("nav.login")}</h2>
            <p className="mt-1 text-sm text-slate-500">Access your dashboard and continue applications.</p>
          </div>

          {error && (
            <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {t("auth.email")}
              </label>
              <input
                id="login-email"
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
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input-base pr-24"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wide text-teal-700 hover:text-teal-800"
                >
                  {showPass ? t("auth.hide") : t("auth.show")}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? t("auth.signingIn") : t("nav.login")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 lg:text-left">
            {t("auth.newStudent")}{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
            >
              {t("auth.createAccount")}
            </button>
          </p>

          <p className="mt-6 text-center text-xs text-slate-400 lg:text-left">{t("auth.usedBy")}</p>
        </div>
      </div>
    </div>
  );
}

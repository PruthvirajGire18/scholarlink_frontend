import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { getApprovedScholarships } from "../../services/studentService";
import { useTranslation } from "../../i18n";
import { useAccessibility } from "../../contexts/AccessibilityContext";
import { speakHint } from "../../utils/voiceHints";
import ScholarshipDetail from "./ScholarshipDetail";
import MyAssistance from "./MyAssistance";

function ScholarshipList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const { voiceHintsEnabled } = useAccessibility();

  useEffect(() => {
    getApprovedScholarships()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (voiceHintsEnabled && !loading && data.length > 0) {
      speakHint(t("voiceHints.viewingApproved"), lang);
    }
  }, [voiceHintsEnabled, loading, data.length, lang, t]);

  return (
    <div className="page-container">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t("student.availableScholarships")}</h1>
        <button
          onClick={() => navigate("/student/assistance")}
          className="btn-secondary shrink-0"
          aria-label={t("voiceHints.clickForDetails")}
        >
          {t("student.myAssistanceRequests")}
        </button>
      </div>

      {loading && (
        <div className="mt-8 flex justify-center py-12">
          <div className="loading-dots">
            <span /><span /><span />
          </div>
        </div>
      )}

      {!loading && data.length === 0 && (
        <div className="empty-state mt-8">
          <p className="font-medium">{t("student.noScholarships")}</p>
          <p className="mt-1 text-sm">{t("student.checkBack")}</p>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((s) => (
            <article
              key={s._id}
              onClick={() => navigate(`/student/scholarships/${s._id}`)}
              className="card-hover group"
              aria-label={t("voiceHints.clickForDetails")}
            >
              <div className="flex flex-col gap-3">
                <h2 className="font-semibold text-slate-900 group-hover:text-teal-700">
                  {s.title}
                </h2>
                <p className="text-lg font-bold text-teal-600">
                  ₹{s.amount?.toLocaleString?.() ?? s.amount}
                </p>
                <p className="text-sm text-slate-500">
                  {t("student.deadline")}: {new Date(s.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <p className="mt-3 text-sm font-medium text-teal-600 group-hover:underline">
                {t("student.viewDetails")} →
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <Routes>
      <Route index element={<ScholarshipList />} />
      <Route path="scholarships/:id" element={<ScholarshipDetail />} />
      <Route path="assistance" element={<MyAssistance />} />
    </Routes>
  );
}

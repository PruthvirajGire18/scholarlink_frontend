import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getScholarshipById, createAssistanceRequest, getMyAssistanceRequests } from "../../services/studentService";
import { useTranslation } from "../../i18n";
import { useAccessibility } from "../../contexts/AccessibilityContext";
import { speakHint } from "../../utils/voiceHints";
import { VoiceReader } from "../../components/accessibility";

function buildEligibilityText(s) {
  if (!s?.eligibility) return "";
  const e = s.eligibility;
  const parts = [];
  if (e.minMarks != null) parts.push(`Minimum marks: ${e.minMarks}%`);
  if (e.maxIncome != null) parts.push(`Max income: ₹${e.maxIncome.toLocaleString()}`);
  if (e.categories?.length) parts.push(`Categories: ${e.categories.join(", ")}`);
  if (e.gender && e.gender !== "ANY") parts.push(`Gender: ${e.gender}`);
  if (e.statesAllowed?.length) parts.push(`States: ${e.statesAllowed.join(", ")}`);
  if (e.educationLevel) parts.push(`Education: ${e.educationLevel}`);
  return parts.join(". ") || "";
}

export default function ScholarshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const { voiceHintsEnabled } = useAccessibility();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [helpMessage, setHelpMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [, setMyRequests] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const s = await getScholarshipById(id);
        setScholarship(s);
      } catch {
        setError(t("student.notFound"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const list = await getMyAssistanceRequests();
        setMyRequests(list);
        const open = list.find((r) => r.scholarshipId?._id === id || r.scholarshipId === id);
        setExistingRequest(open || null);
      } catch {
        setMyRequests([]);
      }
    })();
  }, [id, scholarship]);

  useEffect(() => {
    if (voiceHintsEnabled && scholarship) {
      speakHint(t("voiceHints.viewingScholarship"), lang);
    }
  }, [voiceHintsEnabled, scholarship, lang, t]);

  const handleRequestHelp = async () => {
    if (!helpMessage.trim()) return;
    try {
      setSubmitting(true);
      await createAssistanceRequest(id, helpMessage.trim());
      setHelpMessage("");
      setShowHelp(false);
      const list = await getMyAssistanceRequests();
      const open = list.find((r) => r.scholarshipId?._id === id || r.scholarshipId === id);
      setExistingRequest(open || null);
    } catch (e) {
      setError(e.response?.data?.message || t("student.requestFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex justify-center py-16">
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    );
  }
  if (error || !scholarship) {
    return (
      <div className="page-container py-12">
        <p className="text-red-600">{error || t("student.notFound")}</p>
        <button onClick={() => navigate("/student")} className="btn-secondary mt-4">
          ← {t("student.backToScholarships")}
        </button>
      </div>
    );
  }

  const eligibilityText = buildEligibilityText(scholarship);
  const deadlineText = new Date(scholarship.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="page-container max-w-3xl" aria-label={t("voiceHints.scrollEligibility")}>
      <button
        onClick={() => navigate("/student")}
        className="mb-6 text-sm font-medium text-slate-600 hover:text-teal-600"
      >
        ← {t("student.backToScholarships")}
      </button>

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="flex-1 text-2xl font-bold text-slate-900">{scholarship.title}</h1>
          <VoiceReader text={scholarship.title} className="shrink-0" />
        </div>
        <div className="mt-3 flex items-start gap-3">
          <p className="flex-1 text-slate-600 leading-relaxed">{scholarship.description}</p>
          <VoiceReader text={scholarship.description} className="shrink-0" />
        </div>
        <dl className="mt-6 grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-500">{t("student.amount")}</dt>
            <dd className="text-lg font-semibold text-teal-600">₹{scholarship.amount?.toLocaleString?.() ?? scholarship.amount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">{t("student.deadline")}</dt>
            <dd>{deadlineText}</dd>
            <VoiceReader text={`${t("student.deadline")}: ${deadlineText}`} className="mt-1" />
          </div>
          {scholarship.provider?.name && (
            <div>
              <dt className="text-sm font-medium text-slate-500">{t("student.provider")}</dt>
              <dd>{scholarship.provider.name}</dd>
            </div>
          )}
        </dl>
        {eligibilityText && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <dt className="text-sm font-medium text-slate-500">{t("student.eligibility")}</dt>
            <dd className="mt-1 text-slate-700">{eligibilityText}</dd>
            <VoiceReader text={`${t("student.eligibility")}: ${eligibilityText}`} className="mt-2" />
          </div>
        )}
        {scholarship.benefits && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <dt className="text-sm font-medium text-slate-500">{t("student.benefits")}</dt>
            <dd className="mt-1 text-slate-700">{scholarship.benefits}</dd>
            <VoiceReader text={`${t("student.importantNotice")}: ${scholarship.benefits}`} className="mt-2" />
          </div>
        )}
      </div>

      <div className="mt-8 card">
        <h2 className="text-lg font-semibold text-slate-900">{t("student.needHelp")}</h2>
        {existingRequest ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
            <p className="text-sm font-medium text-amber-800">
              {t("student.openRequest")} {existingRequest.status}
            </p>
            <div className="mt-3 space-y-2 border-t border-amber-200/80 pt-3">
              {(existingRequest.messages || []).map((m, i) => (
                <p key={i} className="text-sm text-slate-700">
                  <span className="font-medium text-slate-900">{m.from}:</span> {m.text}
                </p>
              ))}
            </div>
            <button
              onClick={() => navigate("/student/assistance")}
              className="mt-3 text-sm font-semibold text-teal-600 hover:underline"
            >
              {t("student.viewAllRequests")}
            </button>
          </div>
        ) : (
          <>
            {!showHelp ? (
              <button onClick={() => setShowHelp(true)} className="btn-accent mt-4">
                {t("student.needHelpButton")}
              </button>
            ) : (
              <div className="mt-4 space-y-4">
                <textarea
                  placeholder={t("student.describePlaceholder")}
                  value={helpMessage}
                  onChange={(e) => setHelpMessage(e.target.value)}
                  className="input-base min-h-[100px] resize-y"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    disabled={submitting || !helpMessage.trim()}
                    onClick={handleRequestHelp}
                    className="btn-primary"
                  >
                    {submitting ? t("student.sending") : t("student.sendRequest")}
                  </button>
                  <button
                    onClick={() => { setShowHelp(false); setHelpMessage(""); }}
                    className="btn-secondary"
                  >
                    {t("student.cancel")}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

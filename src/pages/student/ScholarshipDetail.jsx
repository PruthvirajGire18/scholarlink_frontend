import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getScholarshipById,
  createAssistanceRequest,
  getMyAssistanceRequests,
  submitScholarshipFeedback,
  startApplication
} from "../../services/studentService";
import { useTranslation } from "../../i18n";
import { useAccessibility } from "../../contexts/AccessibilityContext";
import { speakHint } from "../../utils/voiceHints";
import { VoiceReader } from "../../components/accessibility";
import AutoText from "../../components/i18n/AutoText";

function buildEligibilityText(s) {
  if (!s?.eligibility) return "";
  const e = s.eligibility;
  if (String(e.summary || "").trim()) return String(e.summary).trim();
  const parts = [];
  if (e.minMarks != null) parts.push(`Minimum marks: ${e.minMarks}%`);
  if (e.maxIncome != null) parts.push(`Max income: ₹${e.maxIncome.toLocaleString()}`);
  if (e.categories?.length) parts.push(`Categories: ${e.categories.join(", ")}`);
  if (e.gender && e.gender !== "ANY") parts.push(`Gender: ${e.gender}`);
  if (e.statesAllowed?.length) parts.push(`States: ${e.statesAllowed.join(", ")}`);
  if (e.educationLevel) parts.push(`Education: ${e.educationLevel}`);
  return parts.join(". ") || "";
}

function isExternalApplyLink(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

export default function ScholarshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const { voiceHintsEnabled } = useAccessibility();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [helpMessage, setHelpMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [starting, setStarting] = useState(false);
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

  const handleStartApplication = async () => {
    try {
      setStarting(true);
      await startApplication(id);
      navigate("/student/applications");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to start application assistant");
    } finally {
      setStarting(false);
    }
  };

  const handleDataFeedbackSubmit = async () => {
    if (!scholarship?._id) return;

    const missingFields = Array.isArray(scholarship?.dataCompleteness?.missingFields)
      ? scholarship.dataCompleteness.missingFields
      : [];
    const summary =
      missingFields.length > 0
        ? `Missing fields: ${missingFields.join(", ")}.`
        : "Student reported data quality issue.";
    const note = feedbackNote.trim();
    const message = note ? `${summary} Student note: ${note}` : summary;

    try {
      setSubmittingFeedback(true);
      setError("");
      const response = await submitScholarshipFeedback(scholarship._id, {
        message,
        missingFields
      });
      setNotice(response?.message || "Feedback sent to admin.");
      setFeedbackNote("");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to submit data feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex justify-center py-16">
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    );
  }
  if (!scholarship) {
    return (
      <div className="page-container py-12">
        <p className="text-red-600">{error || t("student.notFound")}</p>
        <button onClick={() => navigate("/student")} className="btn-secondary mt-4">
          Back to scholarships
        </button>
      </div>
    );
  }

  const eligibilityText = buildEligibilityText(scholarship);
  const deadlineText = new Date(scholarship.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const applyLink = isExternalApplyLink(scholarship.applicationProcess?.applyLink)
    ? scholarship.applicationProcess.applyLink
    : "";
  const completeness = scholarship?.dataCompleteness || {};
  const completenessScore = Number(completeness.score || 0);
  const missingFields = Array.isArray(completeness.missingFields) ? completeness.missingFields : [];

  return (
    <div className="page-container max-w-3xl" aria-label={t("voiceHints.scrollEligibility")}>
      <button
        onClick={() => navigate("/student")}
        className="mb-6 text-sm font-medium text-slate-600 hover:text-teal-600"
      >
        Back to scholarships
      </button>

      {notice && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="flex-1 text-2xl font-bold text-slate-900" data-scholarship-title="true"><AutoText text={scholarship.title} /></h1>
          <VoiceReader text={scholarship.title} className="shrink-0" />
        </div>
        <div className="mt-3 flex items-start gap-3">
          <p className="flex-1 text-slate-600 leading-relaxed"><AutoText text={scholarship.description} /></p>
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
              <dd><AutoText text={scholarship.provider.name} /></dd>
            </div>
          )}
        </dl>
        {eligibilityText && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <dt className="text-sm font-medium text-slate-500">{t("student.eligibility")}</dt>
            <dd className="mt-1 text-slate-700"><AutoText text={eligibilityText} /></dd>
            <VoiceReader text={`${t("student.eligibility")}: ${eligibilityText}`} className="mt-2" />
          </div>
        )}
        {scholarship.benefits && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <dt className="text-sm font-medium text-slate-500">{t("student.benefits")}</dt>
            <dd className="mt-1 text-slate-700"><AutoText text={scholarship.benefits} /></dd>
            <VoiceReader text={`${t("student.importantNotice")}: ${scholarship.benefits}`} className="mt-2" />
          </div>
        )}

        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Fetched Data Completeness</h2>
            <span className={`badge ${completenessScore >= 80 ? "badge-success" : completenessScore >= 50 ? "badge-warning" : "badge-danger"}`}>
              {completenessScore}%
            </span>
          </div>
          {missingFields.length > 0 ? (
            <p className="mt-2 text-sm text-amber-700">
              Missing data: <AutoText text={missingFields.join(" | ")} />
            </p>
          ) : (
            <p className="mt-2 text-sm text-emerald-700">No critical data fields are missing.</p>
          )}
          <div className="mt-3 space-y-2">
            <textarea
              className="input-base min-h-[90px] w-full resize-y"
              rows={3}
              placeholder="Optional note for admin about missing details"
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
            />
            <button
              className="btn-secondary"
              onClick={handleDataFeedbackSubmit}
              disabled={submittingFeedback}
            >
              {submittingFeedback ? "Sending..." : "Send feedback to admin"}
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <h2 className="text-lg font-semibold text-slate-900">Application Assistant</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-900">Required documents</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {(scholarship.documentsRequired || []).map((doc) => <li key={doc}>- <AutoText text={doc} /></li>)}
                {(scholarship.documentsRequired || []).length === 0 && <li>No document list provided.</li>}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-900">Step-by-step instructions</p>
              <ol className="mt-2 space-y-1 text-sm text-slate-700">
                {(scholarship.applicationProcess?.steps || []).map((step, idx) => <li key={`${step}-${idx}`}>{idx + 1}. <AutoText text={step} /></li>)}
                {(scholarship.applicationProcess?.steps || []).length === 0 && <li>No steps added yet.</li>}
              </ol>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-900">Common mistakes</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {(scholarship.commonMistakes || []).map((mistake, idx) => <li key={`${mistake}-${idx}`}>- <AutoText text={mistake} /></li>)}
              {(scholarship.commonMistakes || []).length === 0 && <li>No common mistakes listed.</li>}
            </ul>
          </div>
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AutoText text={scholarship.disclaimer || "Final submission and verification happens on official portals only."} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button disabled={starting} onClick={handleStartApplication} className="btn-primary">
              {starting ? "Starting..." : "Start application assistant"}
            </button>
            {applyLink && (
              <a href={applyLink} target="_blank" rel="noreferrer" className="btn-secondary">
                Open official application portal
              </a>
            )}
          </div>
        </div>
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

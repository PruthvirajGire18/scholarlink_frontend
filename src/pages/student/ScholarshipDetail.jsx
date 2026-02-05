import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getScholarshipById, createAssistanceRequest, getMyAssistanceRequests } from "../../services/studentService";

export default function ScholarshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
        setError("Scholarship not found");
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
      setError(e.response?.data?.message || "Failed to create request");
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
        <p className="text-red-600">{error || "Not found"}</p>
        <button onClick={() => navigate("/student")} className="btn-secondary mt-4">
          ← Back to scholarships
        </button>
      </div>
    );
  }

  return (
    <div className="page-container max-w-3xl">
      <button
        onClick={() => navigate("/student")}
        className="mb-6 text-sm font-medium text-slate-600 hover:text-teal-600"
      >
        ← Back to scholarships
      </button>

      <div className="card">
        <h1 className="text-2xl font-bold text-slate-900">{scholarship.title}</h1>
        <p className="mt-3 text-slate-600 leading-relaxed">{scholarship.description}</p>
        <dl className="mt-6 grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-500">Amount</dt>
            <dd className="text-lg font-semibold text-teal-600">₹{scholarship.amount?.toLocaleString?.() ?? scholarship.amount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Deadline</dt>
            <dd>{new Date(scholarship.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</dd>
          </div>
          {scholarship.provider?.name && (
            <div>
              <dt className="text-sm font-medium text-slate-500">Provider</dt>
              <dd>{scholarship.provider.name}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="mt-8 card">
        <h2 className="text-lg font-semibold text-slate-900">Need help with this scholarship?</h2>
        {existingRequest ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
            <p className="text-sm font-medium text-amber-800">
              You have an open assistance request · Status: {existingRequest.status}
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
              View all my assistance requests →
            </button>
          </div>
        ) : (
          <>
            {!showHelp ? (
              <button onClick={() => setShowHelp(true)} className="btn-accent mt-4">
                Need help?
              </button>
            ) : (
              <div className="mt-4 space-y-4">
                <textarea
                  placeholder="Describe your issue or question…"
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
                    {submitting ? "Sending…" : "Send request"}
                  </button>
                  <button
                    onClick={() => { setShowHelp(false); setHelpMessage(""); }}
                    className="btn-secondary"
                  >
                    Cancel
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

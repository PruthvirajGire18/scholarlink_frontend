import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMyAssistanceRequests, replyToMyAssistanceRequest } from "../../services/studentService";

const messageBadge = (from) =>
  from === "STUDENT" ? "border-teal-200 bg-teal-50" : "border-slate-200 bg-slate-50";

export default function AssistanceThread() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [request, setRequest] = useState(null);
  const [reply, setReply] = useState("");

  const isOpen = useMemo(() => request?.status === "OPEN", [request]);

  const loadThread = async () => {
    const list = await getMyAssistanceRequests();
    const found = list.find((item) => item._id === id);
    setRequest(found || null);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        await loadThread();
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load assistance thread");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const sendReply = async () => {
    if (!reply.trim() || !isOpen) return;
    try {
      setSending(true);
      setError("");
      await replyToMyAssistanceRequest(id, reply.trim());
      setReply("");
      await loadThread();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card text-center py-8">Loading...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="page-container">
        <div className="card">
          <p className="text-slate-600">Assistance request not found.</p>
          <button onClick={() => navigate("/student/assistance")} className="btn-secondary mt-3">
            Back to my assistance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-3xl space-y-4">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <button onClick={() => navigate("/student/assistance")} className="text-sm font-medium text-teal-600 hover:underline">
        Back to my assistance
      </button>

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{request.scholarshipId?.title || "Assistance"}</h1>
            <p className="text-sm text-slate-600">Moderator: {request.moderatorId?.name || "-"}</p>
          </div>
          <span className={isOpen ? "badge badge-warning" : "badge badge-success"}>{request.status}</span>
        </div>

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Moderator suggestions are guidance-only. Final submission/verification happens on official portals.
        </div>

        <div className="mt-4 space-y-2">
          {(request.messages || []).map((message) => (
            <div key={message._id || `${message.from}-${message.createdAt}`} className={`rounded-lg border p-3 ${messageBadge(message.from)}`}>
              <p className="text-xs font-semibold text-slate-700">{message.from}</p>
              <p className="mt-1 text-sm text-slate-800">{message.text}</p>
              <p className="mt-1 text-xs text-slate-500">
                {message.createdAt ? new Date(message.createdAt).toLocaleString("en-IN") : ""}
              </p>
            </div>
          ))}
          {(request.messages || []).length === 0 && (
            <p className="text-sm text-slate-500">No messages yet.</p>
          )}
        </div>

        <div className="mt-4 border-t border-slate-200 pt-4">
          {isOpen ? (
            <div className="space-y-2">
              <textarea
                className="input-base min-h-[100px] resize-y"
                placeholder="Type your message to moderator"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <button className="btn-primary" disabled={sending || !reply.trim()} onClick={sendReply}>
                {sending ? "Sending..." : "Send reply"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              This request is resolved. If you need more support, open a new help request from scholarship details.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

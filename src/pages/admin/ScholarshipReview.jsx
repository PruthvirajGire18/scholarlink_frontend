import { useEffect, useState } from "react";
import { getPendingScholarships, reviewScholarship } from "../../services/adminService";

export default function ScholarshipReview() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [remarksMap, setRemarksMap] = useState({});

  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await getPendingScholarships();
      setList(data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load pending scholarships");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const actOnScholarship = async (id, action) => {
    const remarks = remarksMap[id] || "";
    const status = action === "APPROVE" ? "APPROVED" : "REJECTED";
    const finalRemarks = action === "SEND_BACK" ? `Sent back for corrections. ${remarks}`.trim() : remarks;

    setBusy(true);
    setError("");
    try {
      await reviewScholarship(id, status, finalRemarks);
      await loadPending();
      setNotice(
        action === "APPROVE"
          ? "Scholarship approved."
          : action === "REJECT"
            ? "Scholarship rejected."
            : "Scholarship sent back to moderator for correction."
      );
      setRemarksMap((prev) => ({ ...prev, [id]: "" }));
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update scholarship review");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-container space-y-6">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

      <section>
        <h1 className="text-2xl font-bold text-slate-900">Scholarship Review Queue</h1>
        <p className="mt-1 text-sm text-slate-600">
          Admin-only authenticity review. Students only see approved scholarships.
        </p>
      </section>

      {loading && <div className="card text-center py-8">Loading pending scholarships...</div>}
      {!loading && list.length === 0 && <div className="empty-state">No pending scholarships.</div>}

      {!loading &&
        list.map((s) => (
          <article key={s._id} className="card space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{s.title}</h2>
                <p className="text-sm text-slate-600">{s.description}</p>
                <p className="mt-1 text-xs text-slate-500">
                  By {s.createdBy?.name || "Moderator"} | Deadline {new Date(s.deadline).toLocaleDateString("en-IN")}
                </p>
              </div>
              <span className="badge badge-warning">PENDING</span>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Provider</p>
                <p className="text-sm font-medium text-slate-900">{s.provider?.type} | {s.provider?.name || "-"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Amount</p>
                <p className="text-sm font-medium text-slate-900">INR {Number(s.amount || 0).toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Official link</p>
                {s.applicationProcess?.applyLink ? (
                  <a
                    href={s.applicationProcess.applyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-teal-600 hover:underline"
                  >
                    Open link
                  </a>
                ) : (
                  <p className="text-sm text-red-600">Missing</p>
                )}
              </div>
            </div>

            <textarea
              className="input-base min-h-[90px] resize-y"
              placeholder="Review remarks (required for reject/send back)"
              value={remarksMap[s._id] || ""}
              onChange={(e) => setRemarksMap((prev) => ({ ...prev, [s._id]: e.target.value }))}
            />

            <div className="flex flex-wrap gap-2">
              <button className="btn-primary !bg-emerald-600 hover:!bg-emerald-700" disabled={busy} onClick={() => actOnScholarship(s._id, "APPROVE")}>
                Approve
              </button>
              <button className="btn-secondary" disabled={busy || !(remarksMap[s._id] || "").trim()} onClick={() => actOnScholarship(s._id, "SEND_BACK")}>
                Send back
              </button>
              <button className="btn-danger" disabled={busy || !(remarksMap[s._id] || "").trim()} onClick={() => actOnScholarship(s._id, "REJECT")}>
                Reject
              </button>
            </div>
          </article>
        ))}
    </div>
  );
}

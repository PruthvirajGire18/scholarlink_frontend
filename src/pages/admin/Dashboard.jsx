import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  createModerator,
  getAdminAnalytics,
  getAllModerators,
  getAllStudents,
  getApplications,
  getCommonRejectionReasons,
  getPendingDocuments,
  reviewDocument,
  sendStudentReminder,
  updateApplicationStatus
} from "../../services/adminService";
import { API_ORIGIN } from "../../services/apiClient";

const appStatusOptions = ["PENDING", "APPROVED", "REJECTED"];

const statusBadge = (status) =>
  status === "APPROVED"
    ? "badge-success"
    : status === "REJECTED"
      ? "badge-danger"
      : status === "IN_PROGRESS"
        ? "badge-warning"
        : "badge-neutral";

const getView = (path) => {
  if (path.startsWith("/admin/students")) return "STUDENTS";
  if (path.startsWith("/admin/applications")) return "APPLICATIONS";
  if (path.startsWith("/admin/documents")) return "DOCUMENTS";
  if (path.startsWith("/admin/insights")) return "INSIGHTS";
  if (path.startsWith("/admin/moderators")) return "MODERATORS";
  return "OVERVIEW";
};

const buildDocumentLink = (fileUrl) => {
  if (!fileUrl) return "#";
  if (fileUrl.startsWith("http")) return fileUrl;
  const normalizedPath = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
  return `${API_ORIGIN}${normalizedPath}`;
};

export default function AdminDashboard() {
  const location = useLocation();
  const view = getView(location.pathname);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [moderatorForm, setModeratorForm] = useState({ name: "", email: "", password: "" });
  const [search, setSearch] = useState("");
  const [reminderForm, setReminderForm] = useState({});
  const [reviewDraft, setReviewDraft] = useState({});
  const [documentDraft, setDocumentDraft] = useState({});

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [students, search]);

  const reload = async () => {
    const [analyticsData, studentsData, applicationsData, pendingDocs, reasonData, moderatorData] =
      await Promise.all([
        getAdminAnalytics(),
        getAllStudents(),
        getApplications(),
        getPendingDocuments(),
        getCommonRejectionReasons(),
        getAllModerators()
      ]);
    setAnalytics(analyticsData);
    setStudents(studentsData);
    setApplications(applicationsData);
    setDocuments(pendingDocs);
    setReasons(reasonData);
    setModerators(moderatorData);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        await reload();
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const createNewModerator = async () => {
    if (!moderatorForm.name || !moderatorForm.email || !moderatorForm.password) {
      return setError("Name, email and password are required.");
    }
    setBusy(true);
    setError("");
    try {
      await createModerator(moderatorForm);
      setModeratorForm({ name: "", email: "", password: "" });
      await reload();
      setNotice("Moderator created");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create moderator");
    } finally {
      setBusy(false);
    }
  };

  const sendReminder = async (studentId) => {
    const message = reminderForm[studentId]?.trim();
    if (!message) return setError("Reminder message cannot be empty.");
    setBusy(true);
    setError("");
    try {
      await sendStudentReminder(studentId, { message });
      setReminderForm((prev) => ({ ...prev, [studentId]: "" }));
      setNotice("Reminder sent");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to send reminder");
    } finally {
      setBusy(false);
    }
  };

  const updateStatus = async (applicationId) => {
    const draft = reviewDraft[applicationId] || {};
    if (!draft.status) return setError("Select status first.");
    setBusy(true);
    setError("");
    try {
      await updateApplicationStatus(applicationId, {
        status: draft.status,
        reviewComment: draft.reviewComment || "",
        rejectionReason: draft.rejectionReason || ""
      });
      await reload();
      setNotice("Application status updated");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update application");
    } finally {
      setBusy(false);
    }
  };

  const reviewPendingDocument = async (documentId, status) => {
    const draft = documentDraft[documentId] || {};
    setBusy(true);
    setError("");
    try {
      await reviewDocument(documentId, status, draft.rejectionReason || "", draft.reviewComment || "");
      await reload();
      setNotice(`Document ${status.toLowerCase()}`);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to review document");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="page-container"><div className="card text-center py-10">Loading...</div></div>;

  return (
    <div className="page-container space-y-6">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

      {view === "OVERVIEW" && (
        <>
          <section className="grid gap-4 md:grid-cols-5">
            <article className="card"><p className="text-sm text-slate-500">Students</p><p className="mt-2 text-3xl font-bold text-teal-600">{analytics?.cards?.students || 0}</p></article>
            <article className="card"><p className="text-sm text-slate-500">Moderators</p><p className="mt-2 text-3xl font-bold text-slate-700">{analytics?.cards?.moderators || 0}</p></article>
            <article className="card"><p className="text-sm text-slate-500">Pending Scholarships</p><p className="mt-2 text-3xl font-bold text-amber-600">{analytics?.cards?.pendingScholarships || 0}</p></article>
            <article className="card"><p className="text-sm text-slate-500">Pending Documents</p><p className="mt-2 text-3xl font-bold text-orange-600">{analytics?.cards?.pendingDocuments || 0}</p></article>
            <article className="card"><p className="text-sm text-slate-500">Upcoming Deadlines</p><p className="mt-2 text-3xl font-bold text-red-600">{analytics?.cards?.upcomingDeadlines || 0}</p></article>
          </section>
          <section className="card">
            <h2 className="text-lg font-semibold">Application Funnel</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-5">
              {Object.entries(analytics?.applicationsByStatus || {}).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">{key}</p>
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {view === "STUDENTS" && (
        <section className="card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Students</h2>
            <input className="input-base max-w-sm" placeholder="Search student" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="mt-4 space-y-3">
            {filteredStudents.map((s) => (
              <article key={s._id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="text-sm text-slate-600">{s.email}</p>
                    <p className="text-xs text-slate-500">
                      Profile: {s.profile?.profileCompletion || 0}% | Income: INR {(s.profile?.annualIncome || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className="badge badge-neutral">{s.profile?.education?.educationLevel || "N/A"}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    className="input-base flex-1 min-w-[220px]"
                    placeholder="Reminder message"
                    value={reminderForm[s._id] || ""}
                    onChange={(e) => setReminderForm((prev) => ({ ...prev, [s._id]: e.target.value }))}
                  />
                  <button className="btn-primary" disabled={busy} onClick={() => sendReminder(s._id)}>Send reminder</button>
                </div>
              </article>
            ))}
            {filteredStudents.length === 0 && <div className="empty-state">No students found.</div>}
          </div>
        </section>
      )}

      {view === "APPLICATIONS" && (
        <section className="card">
          <h2 className="text-lg font-semibold">Application Tracking</h2>
          <div className="mt-4 space-y-3">
            {applications.map((a) => (
              <article key={a._id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{a.scholarshipId?.title}</h3>
                    <p className="text-sm text-slate-600">{a.studentId?.name} ({a.studentId?.email})</p>
                    <p className="text-xs text-slate-500">Progress: {a.progressPercent || 0}%</p>
                  </div>
                  <span className={`badge ${statusBadge(a.status)}`}>{a.status}</span>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <select
                    className="input-base"
                    value={reviewDraft[a._id]?.status || ""}
                    onChange={(e) => setReviewDraft((prev) => ({ ...prev, [a._id]: { ...prev[a._id], status: e.target.value } }))}
                  >
                    <option value="">Select status</option>
                    {appStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <input
                    className="input-base"
                    placeholder="Review comment"
                    value={reviewDraft[a._id]?.reviewComment || ""}
                    onChange={(e) => setReviewDraft((prev) => ({ ...prev, [a._id]: { ...prev[a._id], reviewComment: e.target.value } }))}
                  />
                  <input
                    className="input-base"
                    placeholder="Rejection reason"
                    value={reviewDraft[a._id]?.rejectionReason || ""}
                    onChange={(e) => setReviewDraft((prev) => ({ ...prev, [a._id]: { ...prev[a._id], rejectionReason: e.target.value } }))}
                  />
                </div>
                <button className="btn-primary mt-3" disabled={busy} onClick={() => updateStatus(a._id)}>Update</button>
              </article>
            ))}
            {applications.length === 0 && <div className="empty-state">No applications available.</div>}
          </div>
        </section>
      )}

      {view === "DOCUMENTS" && (
        <section className="card">
          <h2 className="text-lg font-semibold">Document Verification Queue</h2>
          <div className="mt-4 space-y-3">
            {documents.map((d) => (
              <article key={d._id} className="rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold">{d.documentType} | {d.userId?.name}</h3>
                <p className="text-sm text-slate-600">{d.scholarshipId?.title}</p>
                <a href={buildDocumentLink(d.fileUrl)} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm font-medium text-teal-600 hover:underline">Open document</a>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <input className="input-base" placeholder="Review comment" value={documentDraft[d._id]?.reviewComment || ""} onChange={(e) => setDocumentDraft((prev) => ({ ...prev, [d._id]: { ...prev[d._id], reviewComment: e.target.value } }))} />
                  <input className="input-base" placeholder="Rejection reason" value={documentDraft[d._id]?.rejectionReason || ""} onChange={(e) => setDocumentDraft((prev) => ({ ...prev, [d._id]: { ...prev[d._id], rejectionReason: e.target.value } }))} />
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="btn-primary" disabled={busy} onClick={() => reviewPendingDocument(d._id, "APPROVED")}>Approve</button>
                  <button className="btn-danger" disabled={busy} onClick={() => reviewPendingDocument(d._id, "REJECTED")}>Reject</button>
                </div>
              </article>
            ))}
            {documents.length === 0 && <div className="empty-state">No pending documents.</div>}
          </div>
        </section>
      )}

      {view === "INSIGHTS" && (
        <section className="grid gap-4 md:grid-cols-2">
          <article className="card">
            <h2 className="text-lg font-semibold">Common Rejection Reasons</h2>
            <div className="mt-4 space-y-2">
              {reasons.map((r, idx) => (
                <div key={`${r.reason}-${idx}`} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">{r.reason}</p>
                  <p className="text-sm text-slate-500">{r.source} | Count: {r.count}</p>
                </div>
              ))}
              {reasons.length === 0 && <div className="empty-state">No rejection data available.</div>}
            </div>
          </article>
          <article className="card">
            <h2 className="text-lg font-semibold">Top Dashboard Insights</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="rounded-lg bg-slate-50 p-3">Use reminders to reduce missed deadlines for active applications.</li>
              <li className="rounded-lg bg-slate-50 p-3">Rejected document trends can guide student training and checklist UX.</li>
              <li className="rounded-lg bg-slate-50 p-3">Monitor pending queue daily to shorten scholarship cycle time.</li>
            </ul>
          </article>
        </section>
      )}

      {view === "MODERATORS" && (
        <section className="grid gap-4 md:grid-cols-2">
          <article className="card">
            <h2 className="text-lg font-semibold">Create Moderator</h2>
            <div className="mt-4 space-y-2">
              <input className="input-base" placeholder="Name" value={moderatorForm.name} onChange={(e) => setModeratorForm((p) => ({ ...p, name: e.target.value }))} />
              <input className="input-base" placeholder="Email" value={moderatorForm.email} onChange={(e) => setModeratorForm((p) => ({ ...p, email: e.target.value }))} />
              <input className="input-base" type="password" placeholder="Password (min 8 chars)" value={moderatorForm.password} onChange={(e) => setModeratorForm((p) => ({ ...p, password: e.target.value }))} />
              <button className="btn-primary" disabled={busy} onClick={createNewModerator}>Create moderator</button>
            </div>
          </article>
          <article className="card">
            <h2 className="text-lg font-semibold">Moderator List</h2>
            <div className="mt-4 space-y-2">
              {moderators.map((m) => (
                <div key={m._id} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">{m.name}</p>
                  <p className="text-sm text-slate-600">{m.email}</p>
                </div>
              ))}
              {moderators.length === 0 && <div className="empty-state">No moderators available.</div>}
            </div>
          </article>
        </section>
      )}
    </div>
  );
}

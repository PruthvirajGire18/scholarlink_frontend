import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createScholarship,
  deleteScholarship,
  getAssistanceRequestDetail,
  getAssistanceRequests,
  getMyScholarships,
  getScholarshipApplications,
  replyToAssistance,
  resolveAssistance,
  updateScholarship
} from "../../services/moderatorService";

const emptyForm = {
  title: "",
  description: "",
  providerType: "GOVERNMENT",
  providerName: "",
  providerWebsite: "",
  amount: "",
  minMarks: "",
  maxIncome: "",
  statesAllowed: "",
  documentsRequired: "",
  commonMistakes: "",
  applicationMode: "ONLINE",
  applyLink: "",
  applicationSteps: "",
  deadline: ""
};

const parseList = (value) =>
  String(value || "")
    .split(/\n|,|;|\|/g)
    .map((item) => item.trim())
    .filter(Boolean);

const getView = (path) => {
  if (path.startsWith("/moderator/my-scholarships")) return "MY";
  if (path.startsWith("/moderator/assistance")) return "ASSISTANCE";
  if (path.startsWith("/moderator/applications")) return "APPLICATIONS";
  return "CREATE";
};

const statusBadge = (status) =>
  status === "APPROVED" ? "badge-success" : status === "REJECTED" ? "badge-danger" : "badge-warning";

const buildPayload = (form) => ({
  title: form.title.trim(),
  description: form.description.trim(),
  provider: {
    type: form.providerType,
    name: form.providerName || undefined,
    website: form.providerWebsite || undefined
  },
  amount: Number(form.amount || 0),
  eligibility: {
    minMarks: form.minMarks === "" ? undefined : Number(form.minMarks),
    maxIncome: form.maxIncome === "" ? undefined : Number(form.maxIncome),
    statesAllowed: parseList(form.statesAllowed)
  },
  documentsRequired: parseList(form.documentsRequired),
  commonMistakes: parseList(form.commonMistakes),
  applicationProcess: {
    mode: form.applicationMode,
    applyLink: form.applyLink.trim(),
    steps: parseList(form.applicationSteps)
  },
  deadline: form.deadline
});

const valueOrDash = (value) => {
  if (value === null || value === undefined) return "-";
  const normalized = String(value).trim();
  return normalized ? normalized : "-";
};

const formatDateOnly = (value) => {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("en-IN");
};

export default function ModeratorDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const view = getView(location.pathname);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [myScholarships, setMyScholarships] = useState([]);
  const [assistanceFilter, setAssistanceFilter] = useState("");
  const [assistance, setAssistance] = useState([]);
  const [selectedAssistanceId, setSelectedAssistanceId] = useState("");
  const [assistanceDetail, setAssistanceDetail] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [applicationsScholarshipId, setApplicationsScholarshipId] = useState("");
  const [applications, setApplications] = useState([]);

  const loadMyScholarships = async () => setMyScholarships(await getMyScholarships());
  const loadAssistance = async () => setAssistance(await getAssistanceRequests(assistanceFilter || undefined));
  const loadApplications = async (id) => setApplications(id ? await getScholarshipApplications(id) : []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (view === "MY" || view === "APPLICATIONS") await loadMyScholarships();
        if (view === "ASSISTANCE") await loadAssistance();
      } catch (e) {
        setError(e?.response?.data?.msg || e?.response?.data?.message || "Failed to load moderator dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [view, assistanceFilter]);

  useEffect(() => {
    if (view === "APPLICATIONS") {
      loadApplications(applicationsScholarshipId).catch(() => setApplications([]));
    }
  }, [applicationsScholarshipId, view]);

  const fillForm = (s) => {
    setEditingId(s._id);
    setForm({
      title: s.title || "",
      description: s.description || "",
      providerType: s.provider?.type || "GOVERNMENT",
      providerName: s.provider?.name || "",
      providerWebsite: s.provider?.website || "",
      amount: s.amount || "",
      minMarks: s.eligibility?.minMarks ?? "",
      maxIncome: s.eligibility?.maxIncome ?? "",
      statesAllowed: Array.isArray(s.eligibility?.statesAllowed) ? s.eligibility.statesAllowed.join(", ") : "",
      documentsRequired: Array.isArray(s.documentsRequired) ? s.documentsRequired.join(", ") : "",
      commonMistakes: Array.isArray(s.commonMistakes) ? s.commonMistakes.join("\n") : "",
      applicationMode: s.applicationProcess?.mode || "ONLINE",
      applyLink: s.applicationProcess?.applyLink || "",
      applicationSteps: Array.isArray(s.applicationProcess?.steps) ? s.applicationProcess.steps.join("\n") : "",
      deadline: s.deadline ? new Date(s.deadline).toISOString().slice(0, 10) : ""
    });
  };

  const resetForm = () => {
    setEditingId("");
    setForm(emptyForm);
  };

  const handleCreateOrUpdate = async () => {
    if (!form.title || !form.description || !form.amount || !form.deadline || !form.applyLink) {
      setError("Title, description, amount, deadline and official apply link are required.");
      return;
    }
    try {
      setLoading(true);
      const payload = buildPayload(form);
      if (editingId) await updateScholarship(editingId, payload);
      else await createScholarship(payload);
      setNotice(editingId ? "Scholarship updated and re-submitted." : "Scholarship submitted for review.");
      resetForm();
      await loadMyScholarships();
      if (!editingId) navigate("/moderator/my-scholarships");
    } catch (e) {
      setError(e?.response?.data?.msg || e?.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm("Withdraw this scholarship?")) return;
    try {
      setLoading(true);
      await deleteScholarship(id);
      await loadMyScholarships();
      setNotice("Scholarship withdrawn.");
    } catch (e) {
      setError(e?.response?.data?.msg || e?.response?.data?.message || "Withdraw failed");
    } finally {
      setLoading(false);
    }
  };

  const openAssistance = async (id) => {
    try {
      setLoading(true);
      setSelectedAssistanceId(id);
      setAssistanceDetail(await getAssistanceRequestDetail(id));
    } catch (e) {
      setError(e?.response?.data?.msg || e?.response?.data?.message || "Failed to load request");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      setLoading(true);
      await replyToAssistance(id, replyText.trim());
      setReplyText("");
      await loadAssistance();
      if (selectedAssistanceId === id) await openAssistance(id);
    } catch (e) {
      setError(e?.response?.data?.msg || e?.response?.data?.message || "Reply failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      setLoading(true);
      await resolveAssistance(id);
      await loadAssistance();
      if (selectedAssistanceId === id) await openAssistance(id);
    } catch (e) {
      setError(e?.response?.data?.msg || e?.response?.data?.message || "Resolve failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container space-y-6">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

      <section>
        <h1 className="text-2xl font-bold text-slate-900">Moderator Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Add verified scholarships and guide students. Final submission and verification happens on official portals only.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-secondary py-1.5" onClick={() => navigate("/moderator")}>Create</button>
          <button className="btn-secondary py-1.5" onClick={() => navigate("/moderator/my-scholarships")}>My scholarships</button>
          <button className="btn-secondary py-1.5" onClick={() => navigate("/moderator/assistance")}>Assistance</button>
          <button className="btn-secondary py-1.5" onClick={() => navigate("/moderator/applications")}>Applications</button>
        </div>
      </section>

      {(view === "CREATE" || editingId) && (
        <section className="card space-y-3">
          <h2 className="text-lg font-semibold">{editingId ? "Edit scholarship" : "Create scholarship"}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input-base md:col-span-2" placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            <textarea className="input-base md:col-span-2 min-h-[110px] resize-y" placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            <select className="input-base" value={form.providerType} onChange={(e) => setForm((p) => ({ ...p, providerType: e.target.value }))}>
              <option value="GOVERNMENT">Government</option><option value="NGO">NGO</option><option value="CSR">CSR</option><option value="PRIVATE">Private</option>
            </select>
            <input className="input-base" placeholder="Provider name" value={form.providerName} onChange={(e) => setForm((p) => ({ ...p, providerName: e.target.value }))} />
            <input className="input-base" placeholder="Provider website" value={form.providerWebsite} onChange={(e) => setForm((p) => ({ ...p, providerWebsite: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Amount (INR)" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Min marks (%)" value={form.minMarks} onChange={(e) => setForm((p) => ({ ...p, minMarks: e.target.value }))} />
            <input className="input-base" type="number" placeholder="Max income" value={form.maxIncome} onChange={(e) => setForm((p) => ({ ...p, maxIncome: e.target.value }))} />
            <input className="input-base" placeholder="States allowed" value={form.statesAllowed} onChange={(e) => setForm((p) => ({ ...p, statesAllowed: e.target.value }))} />
            <textarea className="input-base min-h-[90px] resize-y" placeholder="Documents required" value={form.documentsRequired} onChange={(e) => setForm((p) => ({ ...p, documentsRequired: e.target.value }))} />
            <textarea className="input-base min-h-[90px] resize-y" placeholder="Common mistakes students make" value={form.commonMistakes} onChange={(e) => setForm((p) => ({ ...p, commonMistakes: e.target.value }))} />
            <select className="input-base" value={form.applicationMode} onChange={(e) => setForm((p) => ({ ...p, applicationMode: e.target.value }))}>
              <option value="ONLINE">Online</option><option value="OFFLINE">Offline</option><option value="BOTH">Both</option>
            </select>
            <input className="input-base" placeholder="Official apply link (required)" value={form.applyLink} onChange={(e) => setForm((p) => ({ ...p, applyLink: e.target.value }))} />
            <textarea className="input-base md:col-span-2 min-h-[90px] resize-y" placeholder="Application steps" value={form.applicationSteps} onChange={(e) => setForm((p) => ({ ...p, applicationSteps: e.target.value }))} />
            <input className="input-base" type="date" min={new Date().toISOString().split("T")[0]} value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} />
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            Guidance only: students must submit and verify on official portals.
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" disabled={loading} onClick={handleCreateOrUpdate}>{editingId ? "Update and re-submit" : "Submit for review"}</button>
            {editingId && <button className="btn-secondary" onClick={resetForm}>Cancel edit</button>}
          </div>
        </section>
      )}

      {view === "MY" && !editingId && (
        <section className="card">
          <h2 className="text-lg font-semibold">My scholarships</h2>
          {loading && <p className="mt-3 text-sm text-slate-500">Loading...</p>}
          {!loading && myScholarships.length === 0 && <div className="empty-state mt-4">No scholarships yet.</div>}
          <div className="mt-4 space-y-3">
            {myScholarships.map((s) => (
              <article key={s._id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{s.title}</p>
                    <p className="text-sm text-slate-600">INR {Number(s.amount || 0).toLocaleString("en-IN")} | Deadline {new Date(s.deadline).toLocaleDateString("en-IN")}</p>
                  </div>
                  <span className={`badge ${statusBadge(s.status)}`}>{s.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["PENDING", "REJECTED"].includes(s.status) && <button className="btn-secondary py-1.5 text-sm" onClick={() => fillForm(s)}>Edit</button>}
                  {s.status === "PENDING" && <button className="btn-danger py-1.5 text-sm" disabled={loading} onClick={() => handleWithdraw(s._id)}>Withdraw</button>}
                </div>
                {s.reviewRemarks && s.status === "REJECTED" && <p className="mt-2 text-sm text-red-700">Admin feedback: {s.reviewRemarks}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      {view === "ASSISTANCE" && (
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="card space-y-3">
            <div className="flex gap-2">
              <button className="btn-secondary py-1.5 text-sm" onClick={() => setAssistanceFilter("")}>All</button>
              <button className="btn-secondary py-1.5 text-sm" onClick={() => setAssistanceFilter("OPEN")}>Open</button>
              <button className="btn-secondary py-1.5 text-sm" onClick={() => setAssistanceFilter("RESOLVED")}>Resolved</button>
            </div>
            {assistance.map((a) => (
              <button key={a._id} onClick={() => openAssistance(a._id)} className={`w-full rounded-lg border p-3 text-left ${selectedAssistanceId === a._id ? "border-teal-300 bg-teal-50" : "border-slate-200"}`}>
                <p className="font-semibold text-slate-900">{a.scholarshipId?.title || "Scholarship"}</p>
                <p className="text-sm text-slate-600">{a.studentId?.name || "-"}</p>
                <span className={`badge mt-1 ${statusBadge(a.status)}`}>{a.status}</span>
              </button>
            ))}
            {assistance.length === 0 && <div className="empty-state">No assistance requests.</div>}
          </div>

          <div className="card lg:col-span-2">
            {!assistanceDetail && <div className="empty-state">Select a request to view student profile and documents.</div>}
            {assistanceDetail && (
              <div className="space-y-3">
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{assistanceDetail.disclaimer}</div>
                <h3 className="text-lg font-semibold text-slate-900">{assistanceDetail.assistanceRequest?.scholarshipId?.title}</h3>
                <p className="text-sm text-slate-600">Student: {assistanceDetail.assistanceRequest?.studentId?.name} ({assistanceDetail.assistanceRequest?.studentId?.email})</p>
                <p className="text-sm text-slate-600">Application status: {assistanceDetail.application?.status || "No application found"}</p>
                <div className="rounded-lg border border-slate-200 p-3 text-sm space-y-1">
                  <p className="font-semibold text-slate-800">Student Profile Data</p>
                  <p>Mobile: {valueOrDash(assistanceDetail.studentProfile?.mobile)}</p>
                  <p>DOB: {formatDateOnly(assistanceDetail.studentProfile?.dateOfBirth)}</p>
                  <p>Category: {valueOrDash(assistanceDetail.studentProfile?.category)}</p>
                  <p>Gender: {valueOrDash(assistanceDetail.studentProfile?.gender)}</p>
                  <p>Annual Income: INR {Number(assistanceDetail.studentProfile?.annualIncome || 0).toLocaleString("en-IN")}</p>
                  <p>Course: {valueOrDash(assistanceDetail.studentProfile?.education?.course)}</p>
                  <p>Institute: {valueOrDash(assistanceDetail.studentProfile?.education?.institute)}</p>
                  <p>Branch: {valueOrDash(assistanceDetail.studentProfile?.education?.branch)}</p>
                  <p>Year: {valueOrDash(assistanceDetail.studentProfile?.education?.currentYear)}</p>
                  <p>Marks: {assistanceDetail.studentProfile?.education?.percentage ?? "-"}%</p>
                  <p>
                    Address: {valueOrDash(assistanceDetail.studentProfile?.address?.line1)},{" "}
                    {valueOrDash(assistanceDetail.studentProfile?.address?.city)},{" "}
                    {valueOrDash(assistanceDetail.studentProfile?.address?.district)},{" "}
                    {valueOrDash(assistanceDetail.studentProfile?.address?.state)} -{" "}
                    {valueOrDash(assistanceDetail.studentProfile?.address?.pincode)}
                  </p>
                  <p>Bank A/C: {valueOrDash(assistanceDetail.studentProfile?.bankDetails?.accountNumber)}</p>
                  <p>IFSC: {valueOrDash(assistanceDetail.studentProfile?.bankDetails?.ifscCode)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-800">Profile Uploaded Documents</p>
                  {(assistanceDetail.profileDocuments || []).map((doc) => (
                    <div key={`${doc.key}-${doc.fileUrl || doc.fileName}`} className="rounded border border-slate-200 p-2 text-sm">
                      <p className="font-medium">{doc.label}</p>
                      <p className="text-slate-600">File: {doc.fileName || "Unknown file"}</p>
                      {doc.uploadedAt && <p className="text-slate-500">Uploaded: {new Date(doc.uploadedAt).toLocaleString("en-IN")}</p>}
                      {doc.fileUrl && <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">Open profile document</a>}
                    </div>
                  ))}
                  {(assistanceDetail.profileDocuments || []).length === 0 && <p className="text-sm text-slate-500">No profile documents uploaded.</p>}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-800">Application Guidance Documents</p>
                  {(assistanceDetail.documents || []).map((doc) => (
                    <div key={doc._id} className="rounded border border-slate-200 p-2 text-sm">
                      <p className="font-medium">{doc.documentType}</p>
                      {doc.fileUrl && <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">Open document</a>}
                    </div>
                  ))}
                  {(assistanceDetail.documents || []).length === 0 && <p className="text-sm text-slate-500">No uploaded documents.</p>}
                </div>
                <div className="space-y-2">
                  {(assistanceDetail.assistanceRequest?.messages || []).map((m) => (
                    <p key={m._id || `${m.from}-${m.createdAt}`} className="rounded border border-slate-200 p-2 text-sm"><b>{m.from}:</b> {m.text}</p>
                  ))}
                </div>
                {assistanceDetail.assistanceRequest?.status === "OPEN" && (
                  <div className="flex gap-2">
                    <input className="input-base" placeholder="Reply with guidance" value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                    <button className="btn-primary" disabled={loading || !replyText.trim()} onClick={() => handleReply(assistanceDetail.assistanceRequest._id)}>Send</button>
                    <button className="btn-secondary" disabled={loading} onClick={() => handleResolve(assistanceDetail.assistanceRequest._id)}>Resolve</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {view === "APPLICATIONS" && (
        <section className="card">
          <h2 className="text-lg font-semibold">Scholarship applications (read-only)</h2>
          <select className="input-base mt-3 max-w-md" value={applicationsScholarshipId} onChange={(e) => setApplicationsScholarshipId(e.target.value)}>
            <option value="">Select scholarship</option>
            {myScholarships.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
          </select>
          <div className="mt-4 space-y-2">
            {applications.map((a) => (
              <article key={a._id} className="rounded-lg border border-slate-200 p-3">
                <p className="font-medium text-slate-900">{a.studentId?.name} ({a.studentId?.email})</p>
                <p className="text-sm text-slate-600">Status: {a.status} | Progress: {a.progressPercent || 0}%</p>
              </article>
            ))}
            {applicationsScholarshipId && applications.length === 0 && <div className="empty-state">No applications found.</div>}
            {!applicationsScholarshipId && <div className="empty-state">Select a scholarship to view applications.</div>}
          </div>
        </section>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  discoverScholarships,
  getMyApplications,
  getMyNotifications,
  getMyProfile,
  getStudentDashboard,
  markNotificationAsRead,
  saveMyProfile,
  submitScholarshipFeedback,
  startApplication,
  submitApplication,
  updateMyApplicationStatus,
  updateApplicationStep,
  uploadApplicationDocument
} from "../../services/studentService";

const profileSeed = {
  gender: "",
  mobile: "",
  dateOfBirth: "",
  category: "OPEN",
  annualIncome: "",
  address: { state: "", district: "", pincode: "" },
  education: { educationLevel: "DIPLOMA", course: "", currentYear: "", percentage: "" }
};

const statusClass = {
  IN_PROGRESS: "badge-warning",
  APPLIED: "badge-neutral",
  PENDING: "badge-neutral",
  APPROVED: "badge-success",
  REJECTED: "badge-danger"
};

const eligibilityBadgeClass = {
  ELIGIBLE: "badge-success",
  PARTIALLY_ELIGIBLE: "badge-warning",
  NOT_ELIGIBLE: "badge-danger"
};

const eligibilityLabel = {
  ELIGIBLE: "Eligible",
  PARTIALLY_ELIGIBLE: "Partially Eligible",
  NOT_ELIGIBLE: "Not Eligible"
};

const fileOk = (file) =>
  file &&
  ["application/pdf", "image/jpeg", "image/png"].includes(file.type) &&
  file.size <= 5 * 1024 * 1024;
const isExternalApplyLink = (value) => /^https?:\/\//i.test(String(value || "").trim());

const getView = (path) => {
  if (path.startsWith("/student/profile")) return "PROFILE";
  if (path.startsWith("/student/applications")) return "APPLICATIONS";
  if (path.startsWith("/student/notifications")) return "NOTIFICATIONS";
  return "DASHBOARD";
};

const mapProfile = (p) =>
  !p
    ? profileSeed
    : {
        gender: p.gender || "",
        mobile: p.mobile || "",
        dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().slice(0, 10) : "",
        category: p.category || "OPEN",
        annualIncome: p.annualIncome || "",
        address: {
          state: p.address?.state || "",
          district: p.address?.district || "",
          pincode: p.address?.pincode || ""
        },
        education: {
          educationLevel: p.education?.educationLevel || "DIPLOMA",
          course: p.education?.course || "",
          currentYear: p.education?.currentYear || "",
          percentage: p.education?.percentage || ""
        }
      };

const money = (n) => `INR ${(n || 0).toLocaleString("en-IN")}`;
const getCompleteness = (scholarship) => Number(scholarship?.dataCompleteness?.score || 0);
const getMissingFields = (scholarship) =>
  Array.isArray(scholarship?.dataCompleteness?.missingFields)
    ? scholarship.dataCompleteness.missingFields
    : [];

export default function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const view = getView(location.pathname);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(profileSeed);
  const [filters, setFilters] = useState({ search: "", providerType: "" });
  const [discover, setDiscover] = useState([]);
  const [apps, setApps] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeAppId, setActiveAppId] = useState(null);

  const activeApp = useMemo(() => apps.find((a) => a._id === activeAppId) || apps[0] || null, [apps, activeAppId]);
  const activeApplyLink = isExternalApplyLink(activeApp?.scholarshipId?.applicationProcess?.applyLink)
    ? activeApp.scholarshipId.applicationProcess.applyLink
    : "";

  const loadAll = async () => {
    const [dash, pf, dc, ap, nt] = await Promise.all([
      getStudentDashboard(),
      getMyProfile(),
      discoverScholarships(filters),
      getMyApplications(),
      getMyNotifications()
    ]);
    setDashboard(dash);
    setProfile(mapProfile(pf));
    setDiscover(dc);
    setApps(ap);
    setNotifications(nt);
    setActiveAppId((prev) => (prev && ap.some((a) => a._id === prev) ? prev : ap[0]?._id || null));
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await loadAll();
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const startApply = async (id) => {
    setBusy(true);
    setError("");
    try {
      const res = await startApplication(id);
      await loadAll();
      setNotice(res.message || "Application started");
      setActiveAppId(res.application?._id || null);
      navigate("/student/applications");
    } catch (e) {
      setError(e?.response?.data?.message || "Cannot start application");
    } finally {
      setBusy(false);
    }
  };

  const saveProfileNow = async () => {
    setBusy(true);
    setError("");
    try {
      await saveMyProfile({
        ...profile,
        annualIncome: Number(profile.annualIncome || 0),
        education: {
          ...profile.education,
          currentYear: Number(profile.education.currentYear || 0),
          percentage: Number(profile.education.percentage || 0)
        }
      });
      await loadAll();
      setNotice("Profile saved");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save profile");
    } finally {
      setBusy(false);
    }
  };

  const toggleStep = async (appId, stepKey, done) => {
    setBusy(true);
    try {
      await updateApplicationStep(appId, stepKey, done);
      await loadAll();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update step");
    } finally {
      setBusy(false);
    }
  };

  const uploadDoc = async (appId, docType, file) => {
    if (!fileOk(file)) return setError("Only PDF/JPG/PNG up to 5MB are allowed.");
    setBusy(true);
    try {
      await uploadApplicationDocument(appId, docType, file);
      await loadAll();
      setNotice(`${docType} uploaded`);
    } catch (e) {
      setError(e?.response?.data?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const finalSubmit = async (appId) => {
    setBusy(true);
    try {
      await submitApplication(appId);
      await loadAll();
      setNotice("Marked as applied on official portal");
    } catch (e) {
      setError(e?.response?.data?.message || "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  const updateTrackedStatus = async (appId, status) => {
    if (!status) return;
    setBusy(true);
    setError("");
    try {
      await updateMyApplicationStatus(appId, { status });
      await loadAll();
      setNotice(`Status updated to ${status}`);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update status");
    } finally {
      setBusy(false);
    }
  };

  const runFilter = async () => {
    setBusy(true);
    setError("");
    try {
      setDiscover(await discoverScholarships(filters));
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to filter scholarships");
    } finally {
      setBusy(false);
    }
  };

  const submitDataFeedbackNow = async (scholarship) => {
    if (!scholarship?._id) return;
    const missingFields = getMissingFields(scholarship);
    const message =
      missingFields.length > 0
        ? `Student reported missing data: ${missingFields.join(", ")}.`
        : "Student reported scholarship data quality issue.";

    setBusy(true);
    setError("");
    try {
      const response = await submitScholarshipFeedback(scholarship._id, {
        message,
        missingFields
      });
      setNotice(response?.message || "Feedback sent to admin.");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to submit feedback");
    } finally {
      setBusy(false);
    }
  };

  const markRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(await getMyNotifications());
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to mark notification");
    }
  };

  if (loading) return <div className="page-container"><div className="card text-center py-10">Loading...</div></div>;

  return (
    <div className="page-container space-y-6">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

      {view === "DASHBOARD" && (
        <>
          <section className="grid gap-4 md:grid-cols-5">
            <article className="card"><p className="text-sm text-slate-500">Profile</p><p className="mt-2 text-3xl font-bold text-teal-600">{dashboard?.profileCompletion || 0}%</p></article>
            <article className="card"><p className="text-sm text-slate-500">Eligible</p><p className="mt-2 text-3xl font-bold text-teal-600">{dashboard?.metrics?.eligibleScholarships || 0}</p></article>
            <article className="card"><p className="text-sm text-slate-500">Partially Eligible</p><p className="mt-2 text-3xl font-bold text-amber-600">{dashboard?.metrics?.partiallyEligibleScholarships || 0}</p></article>
            <article className="card"><p className="text-sm text-slate-500">In Progress</p><p className="mt-2 text-3xl font-bold text-amber-600">{dashboard?.metrics?.inProgressApplications || 0}</p></article>
            <article className="card"><p className="text-sm text-slate-500">Approved</p><p className="mt-2 text-3xl font-bold text-emerald-600">{dashboard?.metrics?.approvedCount || 0}</p></article>
          </section>

          <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {dashboard?.portalDisclaimer || "Final submission and verification happens on official portals only."}
          </section>

          <section className="card">
            <div className="flex items-center justify-between gap-2"><h2 className="text-lg font-semibold">Recommended Scholarships</h2><button className="btn-secondary" onClick={() => navigate("/student/profile")}>Edit profile</button></div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {(dashboard?.recommendedScholarships || []).map((item) => (
                <article key={item.scholarship._id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{item.scholarship.title}</h3><span className="badge badge-success">{item.score}% match</span></div>
                  <p className="mt-1 text-sm text-slate-600">{money(item.scholarship.amount)} | {new Date(item.scholarship.deadline).toLocaleDateString("en-IN")}</p>
                  <p className="mt-2 text-xs text-emerald-700">{item.passes.join(" | ")}</p>
                  <p className="mt-1 text-xs text-slate-600">Data completeness: {getCompleteness(item.scholarship)}%</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button disabled={busy} onClick={() => startApply(item.scholarship._id)} className="btn-primary">Start application</button>
                    <button className="btn-secondary" onClick={() => navigate(`/student/scholarships/${item.scholarship._id}`)}>View details</button>
                    <button
                      className="btn-secondary"
                      disabled={busy}
                      onClick={() => submitDataFeedbackNow(item.scholarship)}
                    >
                      Feedback
                    </button>
                  </div>
                </article>
              ))}
              {(dashboard?.recommendedScholarships || []).length === 0 && (
                <div className="empty-state lg:col-span-2">No fully eligible scholarships yet. Check partially eligible options below.</div>
              )}
            </div>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold">Partially Eligible (Action Required)</h2>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {(dashboard?.partiallyEligibleScholarships || []).map((item) => (
                <article key={item.scholarship._id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{item.scholarship.title}</h3>
                    <span className="badge badge-warning">{item.score}% match</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{money(item.scholarship.amount)} | {new Date(item.scholarship.deadline).toLocaleDateString("en-IN")}</p>
                  <p className="mt-2 text-xs text-amber-700">Missing: {(item.missingDocuments || []).join(" | ") || "Update profile/documents"}</p>
                  <p className="mt-1 text-xs text-slate-600">Data completeness: {getCompleteness(item.scholarship)}%</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button disabled={busy} onClick={() => startApply(item.scholarship._id)} className="btn-secondary">Start with guidance</button>
                    <button className="btn-secondary" onClick={() => navigate(`/student/scholarships/${item.scholarship._id}`)}>View details</button>
                    <button
                      className="btn-secondary"
                      disabled={busy}
                      onClick={() => submitDataFeedbackNow(item.scholarship)}
                    >
                      Feedback
                    </button>
                  </div>
                </article>
              ))}
              {(dashboard?.partiallyEligibleScholarships || []).length === 0 && (
                <div className="empty-state lg:col-span-2">No partially eligible scholarships right now.</div>
              )}
            </div>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold">Upcoming Deadlines</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(dashboard?.upcomingDeadlines || []).map((d) => (
                <article key={d.applicationId} className="rounded-xl border border-slate-200 p-4">
                  <h3 className="font-semibold">{d.title}</h3>
                  <p className="text-sm text-slate-600">
                    Deadline: {new Date(d.deadline).toLocaleDateString("en-IN")}
                  </p>
                  <p className="mt-1 text-sm text-amber-700">{d.daysLeft} day(s) left</p>
                  <button className="btn-secondary mt-3" onClick={() => navigate("/student/applications")}>
                    Continue application
                  </button>
                </article>
              ))}
              {(dashboard?.upcomingDeadlines || []).length === 0 && (
                <div className="empty-state md:col-span-2">No upcoming deadlines.</div>
              )}
            </div>
          </section>

          <section className="card">
            <div className="grid gap-3 md:grid-cols-3">
              <input className="input-base" placeholder="Search scholarships" value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
              <select className="input-base" value={filters.providerType} onChange={(e) => setFilters((p) => ({ ...p, providerType: e.target.value }))}>
                <option value="">All providers</option><option value="GOVERNMENT">Government</option><option value="NGO">NGO</option><option value="CSR">CSR</option><option value="PRIVATE">Private</option>
              </select>
              <button className="btn-secondary" disabled={busy} onClick={runFilter}>Filter</button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {discover.map((item) => (
                <article key={item.scholarship._id} className="rounded-xl border border-slate-200 p-4">
                  <h3 className="font-semibold">{item.scholarship.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{money(item.scholarship.amount)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`badge ${eligibilityBadgeClass[item.eligibilityStatus] || "badge-neutral"}`}>
                      {eligibilityLabel[item.eligibilityStatus] || "Unknown"}
                    </span>
                    <span className="text-xs text-slate-500">{item.score}% match</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Data completeness: {getCompleteness(item.scholarship)}%
                  </p>
                  {item.fails?.length > 0 && <p className="mt-1 text-xs text-amber-700">Reasons: {item.fails.join(" | ")}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="btn-secondary disabled:opacity-50"
                      disabled={item.eligibilityStatus === "NOT_ELIGIBLE" || busy}
                      onClick={() => startApply(item.scholarship._id)}
                    >
                      {item.eligibilityStatus === "ELIGIBLE" ? "Start application" : "Start with guidance"}
                    </button>
                    <button className="btn-secondary" onClick={() => navigate(`/student/scholarships/${item.scholarship._id}`)}>
                      View details
                    </button>
                    <button
                      className="btn-secondary"
                      disabled={busy}
                      onClick={() => submitDataFeedbackNow(item.scholarship)}
                    >
                      Feedback
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {view === "PROFILE" && (
        <section className="card space-y-3">
          <h2 className="text-lg font-semibold">Student Profile</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <select className="input-base" value={profile.gender} onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}><option value="">Gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select>
            <input className="input-base" type="date" value={profile.dateOfBirth} onChange={(e) => setProfile((p) => ({ ...p, dateOfBirth: e.target.value }))} />
            <input className="input-base" placeholder="Mobile" value={profile.mobile} onChange={(e) => setProfile((p) => ({ ...p, mobile: e.target.value }))} />
            <input className="input-base" placeholder="State" value={profile.address.state} onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, state: e.target.value } }))} />
            <input className="input-base" placeholder="District" value={profile.address.district} onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, district: e.target.value } }))} />
            <input className="input-base" placeholder="Pincode" value={profile.address.pincode} onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, pincode: e.target.value } }))} />
            <select className="input-base" value={profile.education.educationLevel} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, educationLevel: e.target.value } }))}><option value="DIPLOMA">Diploma</option><option value="UG">UG</option><option value="PG">PG</option><option value="PHD">PHD</option></select>
            <input className="input-base" placeholder="Course" value={profile.education.course} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, course: e.target.value } }))} />
            <input className="input-base" type="number" placeholder="Year" value={profile.education.currentYear} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, currentYear: e.target.value } }))} />
            <input className="input-base" type="number" placeholder="Percentage" value={profile.education.percentage} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, percentage: e.target.value } }))} />
            <select className="input-base" value={profile.category} onChange={(e) => setProfile((p) => ({ ...p, category: e.target.value }))}><option value="OPEN">OPEN</option><option value="OBC">OBC</option><option value="SC">SC</option><option value="ST">ST</option><option value="EWS">EWS</option><option value="SEBC">SEBC</option><option value="VJNT">VJNT</option></select>
            <input className="input-base" type="number" placeholder="Annual income" value={profile.annualIncome} onChange={(e) => setProfile((p) => ({ ...p, annualIncome: e.target.value }))} />
          </div>
          <button disabled={busy} onClick={saveProfileNow} className="btn-primary">Save profile</button>
        </section>
      )}

      {view === "APPLICATIONS" && (
        <section className="grid gap-4 lg:grid-cols-3">
          <aside className="card">
            {apps.map((a) => (
              <button
                key={a._id}
                onClick={() => setActiveAppId(a._id)}
                className={`mb-2 w-full rounded-lg border p-3 text-left ${activeApp?._id === a._id ? "border-teal-300 bg-teal-50" : "border-slate-200"}`}
              >
                <p className="font-semibold">{a.scholarshipId?.title}</p>
                <span className={`badge ${statusClass[a.status] || "badge-neutral"}`}>{a.status}</span>
                <p className="mt-1 text-xs text-slate-500">{a.progressPercent}%</p>
              </button>
            ))}
          </aside>
          <div className="card lg:col-span-2">
            {!activeApp && <div className="empty-state">No applications yet.</div>}
            {activeApp && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">{activeApp.scholarshipId?.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => finalSubmit(activeApp._id)}
                      disabled={busy || activeApp.status === "APPROVED" || !activeApplyLink}
                      className="btn-primary"
                    >
                      Mark applied on official portal
                    </button>
                    {activeApplyLink && (
                      <a
                        href={activeApplyLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                      >
                        Open official portal
                      </a>
                    )}
                  </div>
                </div>
                {!activeApplyLink && (
                  <p className="text-sm text-red-600">Official application link missing. Contact moderator before continuing.</p>
                )}

                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Final submission and verification happens on official government/NGO portals only.
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Track official status</p>
                    <select
                      className="input-base mt-2"
                      value={["APPLIED", "PENDING", "APPROVED", "REJECTED"].includes(activeApp.status) ? activeApp.status : ""}
                      onChange={(e) => updateTrackedStatus(activeApp._id, e.target.value)}
                      disabled={busy}
                    >
                      <option value="">Select status update</option>
                      <option value="APPLIED">APPLIED</option>
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Common mistakes</p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                      {(activeApp.scholarshipId?.commonMistakes || []).map((m, idx) => (
                        <li key={`${m}-${idx}`}>- {m}</li>
                      ))}
                      {(activeApp.scholarshipId?.commonMistakes || []).length === 0 && (
                        <li>No common mistake notes available.</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="h-3 rounded-full bg-slate-200"><div className="h-full rounded-full bg-teal-500" style={{ width: `${activeApp.progressPercent || 0}%` }} /></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 font-semibold">Roadmap</p>
                    {(activeApp.roadmapSteps || []).map((s) => (
                      <label key={s.key} className="mb-2 flex items-start gap-2 rounded-lg border border-slate-200 p-2">
                        <input type="checkbox" checked={!!s.isDone} disabled={busy || ["documents", "submit"].includes(s.key)} onChange={(e) => toggleStep(activeApp._id, s.key, e.target.checked)} />
                        <span><b>{s.title}</b><br /><small className="text-slate-500">{s.description}</small></span>
                      </label>
                    ))}
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">
                      {(activeApp.scholarshipId?.applicationProcess?.steps || []).length > 0
                        ? activeApp.scholarshipId.applicationProcess.steps.map((step, idx) => (
                            <p key={`${step}-${idx}`}>{idx + 1}. {step}</p>
                          ))
                        : "No step-by-step instructions added."}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 font-semibold">Document Checklist</p>
                    {(activeApp.documentChecklist || []).map((d) => (
                      <div key={d.documentType} className="mb-2 rounded-lg border border-slate-200 p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{d.label || d.documentType}</span>
                          <span className={`badge ${d.isUploaded ? "badge-success" : "badge-warning"}`}>
                            {d.isUploaded ? (d.isVerified ? "Verified" : "Uploaded") : "Pending"}
                          </span>
                        </div>
                        {d.comment && <p className="mt-1 text-xs text-amber-700">{d.comment}</p>}
                        <input type="file" className="mt-2 text-xs" onChange={(e) => uploadDoc(activeApp._id, d.documentType, e.target.files?.[0])} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {view === "NOTIFICATIONS" && (
        <section className="card space-y-3">
          <h2 className="text-lg font-semibold">Notifications</h2>
          {notifications.map((n) => (
            <article key={n._id} className={`rounded-lg border p-3 ${n.isRead ? "border-slate-200" : "border-teal-200 bg-teal-50/40"}`}>
              <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{n.title}</h3>{!n.isRead && <button className="btn-secondary py-1 text-xs" onClick={() => markRead(n._id)}>Mark read</button>}</div>
              <p className="text-sm text-slate-600">{n.message}</p>
              <p className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
            </article>
          ))}
          {notifications.length === 0 && <div className="empty-state">No notifications.</div>}
        </section>
      )}
    </div>
  );
}

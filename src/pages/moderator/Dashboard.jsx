import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createScholarship,
  getMyScholarships,
  updateScholarship,
  deleteScholarship,
  getAssistanceRequests,
  replyToAssistance,
  resolveAssistance,
  getScholarshipApplications
} from "../../services/moderatorService";

export default function ModeratorDashboard() {
  const [view, setView] = useState("CREATE");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/moderator/my-scholarships") setView("MY_SCHOLARSHIPS");
    else if (location.pathname === "/moderator/assistance") setView("ASSISTANCE");
    else if (location.pathname === "/moderator/applications") setView("APPLICATIONS");
    else setView("CREATE");
  }, [location.pathname]);

  const [assistanceList, setAssistanceList] = useState([]);
  const [assistanceFilter, setAssistanceFilter] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingId, setReplyingId] = useState(null);
  const [applicationsScholarshipId, setApplicationsScholarshipId] = useState(null);
  const [applicationsList, setApplicationsList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  /* =========================
     FORM STATE (SCHEMA COMPLETE)
  ========================= */
  const [form, setForm] = useState({
    // BASIC
    title: "",
    description: "",

    // PROVIDER
    providerType: "GOVERNMENT",
    providerName: "",
    providerWebsite: "",

    // FINANCIAL
    amount: "",
    benefits: "",

    // ELIGIBILITY
    minMarks: "",
    maxIncome: "",
    gender: "ANY",
    educationLevel: "DIPLOMA",
    statesAllowed: "",

    // DOCUMENTS
    documentsRequired: "",

    // APPLICATION
    applicationMode: "ONLINE",
    applyLink: "",
    applicationSteps: "",

    // DEADLINE
    deadline: ""
  });

  /* =========================
     DATA STATE
  ========================= */
  const [myScholarships, setMyScholarships] = useState([]);

  /* =========================
     CREATE SCHOLARSHIP
  ========================= */
  const handleCreate = async () => {
    if (!form.title || !form.amount || !form.deadline) {
      return alert("Title, Amount and Deadline are required");
    }

    try {
      setLoading(true);

      const payload = {
        title: form.title,
        description: form.description,

        provider: {
          type: form.providerType,
          name: form.providerName || undefined,
          website: form.providerWebsite || undefined
        },

        amount: Number(form.amount),
        benefits: form.benefits || undefined,

        eligibility: {
          minMarks: form.minMarks || undefined,
          maxIncome: form.maxIncome || undefined,
          gender: form.gender,
          educationLevel: form.educationLevel,
          statesAllowed: form.statesAllowed
            ? form.statesAllowed.split(",").map(s => s.trim())
            : []
        },

        documentsRequired: form.documentsRequired
          ? form.documentsRequired.split(",").map(d => d.trim())
          : [],

        applicationProcess: {
          mode: form.applicationMode,
          applyLink: form.applyLink || undefined,
          steps: form.applicationSteps
            ? form.applicationSteps.split("\n")
            : []
        },

        deadline: form.deadline
      };

      await createScholarship(payload);

      alert("Scholarship submitted for admin review");
      setView("MY_SCHOLARSHIPS");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to create scholarship");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FETCH MY SCHOLARSHIPS
  ========================= */
  const fetchMyScholarships = async () => {
    try {
      setLoading(true);
      const data = await getMyScholarships();
      setMyScholarships(data);
    } catch {
      alert("Failed to fetch scholarships");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssistance = async () => {
    try {
      setLoading(true);
      const data = await getAssistanceRequests(assistanceFilter || undefined);
      setAssistanceList(data);
    } catch {
      alert("Failed to load assistance requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (sid) => {
    if (!sid) return;
    try {
      setLoading(true);
      const data = await getScholarshipApplications(sid);
      setApplicationsList(data);
    } catch {
      alert("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "MY_SCHOLARSHIPS") fetchMyScholarships();
    if (view === "ASSISTANCE") fetchAssistance();
    if (view === "APPLICATIONS") {
      if (applicationsScholarshipId) fetchApplications(applicationsScholarshipId);
      else if (myScholarships.length === 0) fetchMyScholarships();
    }
  }, [view, assistanceFilter, applicationsScholarshipId]);

  const handleUpdateScholarship = async () => {
    if (!editingId || !form.title || !form.amount || !form.deadline) {
      alert("Title, Amount and Deadline are required");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        title: form.title,
        description: form.description,
        provider: {
          type: form.providerType,
          name: form.providerName || undefined,
          website: form.providerWebsite || undefined
        },
        amount: Number(form.amount),
        benefits: form.benefits || undefined,
        eligibility: {
          minMarks: form.minMarks || undefined,
          maxIncome: form.maxIncome || undefined,
          gender: form.gender,
          educationLevel: form.educationLevel,
          statesAllowed: form.statesAllowed ? form.statesAllowed.split(",").map((s) => s.trim()) : []
        },
        documentsRequired: form.documentsRequired ? form.documentsRequired.split(",").map((d) => d.trim()) : [],
        applicationProcess: {
          mode: form.applicationMode,
          applyLink: form.applyLink || undefined,
          steps: form.applicationSteps ? form.applicationSteps.split("\n") : []
        },
        deadline: form.deadline
      };
      await updateScholarship(editingId, payload);
      alert("Scholarship updated; resubmitted for review");
      setEditingId(null);
      fetchMyScholarships();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (!confirm("Withdraw this scholarship?")) return;
    try {
      await deleteScholarship(id);
      fetchMyScholarships();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to withdraw");
    }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      await replyToAssistance(id, replyText.trim());
      setReplyText("");
      setReplyingId(null);
      fetchAssistance();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to reply");
    }
  };

  const handleResolve = async (id) => {
    try {
      await resolveAssistance(id);
      fetchAssistance();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to resolve");
    }
  };

  const fillFormFromScholarship = (s) => {
    setForm({
      title: s.title || "",
      description: s.description || "",
      providerType: s.provider?.type || "GOVERNMENT",
      providerName: s.provider?.name || "",
      providerWebsite: s.provider?.website || "",
      amount: s.amount ?? "",
      benefits: s.benefits || "",
      minMarks: s.eligibility?.minMarks ?? "",
      maxIncome: s.eligibility?.maxIncome ?? "",
      gender: s.eligibility?.gender || "ANY",
      educationLevel: s.eligibility?.educationLevel || "DIPLOMA",
      statesAllowed: Array.isArray(s.eligibility?.statesAllowed) ? s.eligibility.statesAllowed.join(", ") : "",
      documentsRequired: Array.isArray(s.documentsRequired) ? s.documentsRequired.join(", ") : "",
      applicationMode: s.applicationProcess?.mode || "ONLINE",
      applyLink: s.applicationProcess?.applyLink || "",
      applicationSteps: Array.isArray(s.applicationProcess?.steps) ? s.applicationProcess.steps.join("\n") : "",
      deadline: s.deadline ? new Date(s.deadline).toISOString().slice(0, 10) : ""
    });
  };

  useEffect(() => {
    if (view === "MY_SCHOLARSHIPS") {
      fetchMyScholarships();
    }
  }, [view]);

  const tabClass = (v) =>
    view === v ? "bg-teal-600 text-white shadow-sm" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50";

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold text-slate-900">Moderator Dashboard</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => navigate("/moderator")} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${tabClass("CREATE")}`}>
          Create scholarship
        </button>
        <button onClick={() => navigate("/moderator/my-scholarships")} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${tabClass("MY_SCHOLARSHIPS")}`}>
          My scholarships
        </button>
        <button onClick={() => navigate("/moderator/assistance")} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${tabClass("ASSISTANCE")}`}>
          Assistance
        </button>
        <button onClick={() => navigate("/moderator/applications")} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${tabClass("APPLICATIONS")}`}>
          Applications
        </button>
      </div>

      {view === "CREATE" && (
        <div className="card mt-8 max-w-2xl">
          <h2 className="text-lg font-semibold text-slate-900">Create scholarship</h2>

          <input type="text" placeholder="Scholarship title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-base mt-4 mb-2" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-base min-h-[100px] resize-y mb-4" />

          {/* PROVIDER */}
          <h3 className="font-semibold mb-2">Provider</h3>

          <input
            type="text"
            placeholder="Provider Name"
            value={form.providerName}
            onChange={e =>
              setForm({ ...form, providerName: e.target.value })
            }
            className="input-base mb-2"
          />

          <input
            type="text"
            placeholder="Provider Website"
            value={form.providerWebsite}
            onChange={e =>
              setForm({ ...form, providerWebsite: e.target.value })
            }
            className="input-base mb-2"
          />

          <select
            value={form.providerType}
            onChange={e =>
              setForm({ ...form, providerType: e.target.value })
            }
            className="input-base mb-4"
          >
            <option value="GOVERNMENT">Government</option>
            <option value="NGO">NGO</option>
            <option value="CSR">CSR</option>
            <option value="PRIVATE">Private</option>
          </select>

          {/* FINANCIAL */}
          <h3 className="font-semibold mb-2">Financial</h3>

          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={e =>
              setForm({ ...form, amount: e.target.value })
            }
            className="input-base mb-2"
          />

          <input
            type="text"
            placeholder="Benefits (tuition, stipend, etc)"
            value={form.benefits}
            onChange={e =>
              setForm({ ...form, benefits: e.target.value })
            }
            className="input-base mb-4"
          />

          {/* ELIGIBILITY */}
          <h3 className="font-semibold mb-2">Eligibility</h3>

          <input
            type="number"
            placeholder="Minimum Marks (%)"
            value={form.minMarks}
            onChange={e =>
              setForm({ ...form, minMarks: e.target.value })
            }
            className="input-base mb-2"
          />

          <input
            type="number"
            placeholder="Maximum Income"
            value={form.maxIncome}
            onChange={e =>
              setForm({ ...form, maxIncome: e.target.value })
            }
            className="input-base mb-2"
          />

          <select
            value={form.gender}
            onChange={e =>
              setForm({ ...form, gender: e.target.value })
            }
            className="input-base mb-2"
          >
            <option value="ANY">Any</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>

          <select
            value={form.educationLevel}
            onChange={e =>
              setForm({ ...form, educationLevel: e.target.value })
            }
            className="input-base mb-2"
          >
            <option value="DIPLOMA">Diploma</option>
            <option value="UG">UG</option>
            <option value="PG">PG</option>
            <option value="PHD">PhD</option>
          </select>

          <input
            type="text"
            placeholder="States Allowed (comma separated)"
            value={form.statesAllowed}
            onChange={e =>
              setForm({ ...form, statesAllowed: e.target.value })
            }
            className="input-base mb-4"
          />

          {/* DOCUMENTS */}
          <h3 className="font-semibold mb-2">Documents Required</h3>

          <input
            type="text"
            placeholder="Aadhaar, Income Certificate, Caste Certificate"
            value={form.documentsRequired}
            onChange={e =>
              setForm({ ...form, documentsRequired: e.target.value })
            }
            className="input-base mb-4"
          />

          {/* APPLICATION */}
          <h3 className="font-semibold mb-2">Application Process</h3>

          <select
            value={form.applicationMode}
            onChange={e =>
              setForm({ ...form, applicationMode: e.target.value })
            }
            className="input-base mb-2"
          >
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="BOTH">Both</option>
          </select>

          <input
            type="text"
            placeholder="Apply Link"
            value={form.applyLink}
            onChange={e =>
              setForm({ ...form, applyLink: e.target.value })
            }
            className="input-base mb-2"
          />

          <textarea
            placeholder="Application steps (one per line)"
            value={form.applicationSteps}
            onChange={e =>
              setForm({ ...form, applicationSteps: e.target.value })
            }
            className="input-base mb-4"
          />

          {/* DEADLINE */}
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={form.deadline}
            onChange={e =>
              setForm({ ...form, deadline: e.target.value })
            }
            className="input-base mb-4"
          />

          <button disabled={loading} onClick={handleCreate} className="btn-primary mt-4">
            {loading ? "Submitting…" : "Submit for review"}
          </button>
        </div>
      )}

      {view === "MY_SCHOLARSHIPS" && (
        <div className="card mt-8">
          <h2 className="text-lg font-semibold text-slate-900">My scholarships</h2>
          {loading && <div className="mt-6 flex justify-center py-8"><div className="loading-dots"><span /><span /><span /></div></div>}
          {!loading && myScholarships.length === 0 && <div className="empty-state mt-6">No scholarships created yet.</div>}
          {!loading && myScholarships.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="p-3 text-left text-sm font-semibold text-slate-700">Title</th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-700">Provider</th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-700">Amount</th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-700">Deadline</th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myScholarships.map((s) => (
                    <tr key={s._id} className="border-b border-slate-100 last:border-0">
                      <td className="p-3 font-medium text-slate-900">{s.title}</td>
                      <td className="p-3 text-slate-600">{s.provider?.type}</td>
                      <td className="p-3">₹{s.amount?.toLocaleString?.() ?? s.amount}</td>
                      <td className="p-3 text-slate-600">{new Date(s.deadline).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={s.status === "PENDING" ? "badge-warning" : s.status === "APPROVED" ? "badge-success" : "badge-danger"}>{s.status}</span>
                      </td>
                      <td className="p-3">
                        {s.status === "REJECTED" && (
                          <button onClick={() => { setEditingId(s._id); fillFormFromScholarship(s); setView("EDIT"); }} className="btn-accent mr-1 py-1.5 text-sm">Edit & re-submit</button>
                        )}
                        {s.status === "PENDING" && (
                          <>
                            <button onClick={() => { setEditingId(s._id); fillFormFromScholarship(s); setView("EDIT"); }} className="btn-secondary mr-1 py-1.5 text-sm">Edit</button>
                            <button onClick={() => handleWithdraw(s._id)} className="btn-danger py-1.5 text-sm">Withdraw</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {myScholarships.some((s) => s.status === "REJECTED") && (
            <div className="mt-6 space-y-2 border-t border-slate-200 pt-6">
              <h3 className="font-semibold text-slate-900">Rejection reasons</h3>
              {myScholarships.filter((s) => s.status === "REJECTED" && s.reviewRemarks).map((s) => (
                <div key={s._id} className="rounded-lg border border-red-200 bg-red-50/80 p-3 text-sm">
                  <strong className="text-slate-900">{s.title}</strong>: <span className="text-red-800">{s.reviewRemarks}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "EDIT" && editingId && (
        <div className="card mt-8 max-w-2xl">
          <h2 className="text-lg font-semibold text-slate-900">Edit scholarship (resubmit for review)</h2>
          <input type="text" placeholder="Scholarship title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-base mt-4 mb-2" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-base min-h-[80px] mb-4" />
          <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-base mb-2" />
          <input type="date" min={new Date().toISOString().split("T")[0]} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-base mb-4" />
          <div className="flex gap-3">
            <button disabled={loading} onClick={handleUpdateScholarship} className="btn-primary">Update & re-submit</button>
            <button onClick={() => { setEditingId(null); setView("MY_SCHOLARSHIPS"); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {view === "ASSISTANCE" && (
        <div className="card mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Assistance inbox</h2>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setAssistanceFilter("")} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${!assistanceFilter ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>All</button>
            <button onClick={() => setAssistanceFilter("OPEN")} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${assistanceFilter === "OPEN" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>Open</button>
            <button onClick={() => setAssistanceFilter("RESOLVED")} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${assistanceFilter === "RESOLVED" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>Resolved</button>
          </div>
          {loading && <div className="mt-6 flex justify-center py-8"><div className="loading-dots"><span /><span /><span /></div></div>}
          {!loading && assistanceList.length === 0 && <div className="empty-state mt-6">No assistance requests.</div>}
          {!loading && assistanceList.length > 0 && (
            <div className="mt-6 space-y-4">
              {assistanceList.map((ar) => (
                <div key={ar._id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-900">{ar.scholarshipId?.title}</p>
                      <p className="text-sm text-slate-500">Student: {ar.studentId?.name} ({ar.studentId?.email})</p>
                      <span className={ar.status === "OPEN" ? "badge-warning" : "badge-success"}>{ar.status}</span>
                    </div>
                    {ar.status === "OPEN" && <button onClick={() => handleResolve(ar._id)} className="btn-primary !bg-emerald-600 hover:!bg-emerald-700 py-1.5 text-sm">Resolve</button>}
                  </div>
                  <div className="mt-3 border-t border-slate-200 pt-3 space-y-1">
                    {(ar.messages || []).map((m, i) => (
                      <p key={i} className="text-sm text-slate-700"><span className="font-medium">{m.from}:</span> {m.text}</p>
                    ))}
                  </div>
                  {ar.status === "OPEN" && (
                    <div className="mt-3 flex gap-2">
                      <input type="text" placeholder="Reply…" value={replyingId === ar._id ? replyText : ""} onChange={(e) => { setReplyingId(ar._id); setReplyText(e.target.value); }} onFocus={() => setReplyingId(ar._id)} className="input-base flex-1" />
                      <button onClick={() => handleReply(ar._id)} disabled={!(replyingId === ar._id && replyText.trim())} className="btn-primary disabled:opacity-50">Send</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "APPLICATIONS" && (
        <div className="card mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Application progress</h2>
          {!applicationsScholarshipId ? (
            <>
              <p className="mt-2 text-slate-600">Select a scholarship:</p>
              <ul className="mt-3 space-y-1">
                {myScholarships.map((s) => (
                  <li key={s._id}>
                    <button onClick={() => { setApplicationsScholarshipId(s._id); fetchApplications(s._id); }} className="text-teal-600 font-medium hover:underline">
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <button onClick={() => { setApplicationsScholarshipId(null); setApplicationsList([]); }} className="mt-2 text-sm text-slate-500 hover:text-slate-700">← Back</button>
              {loading && <div className="mt-6 flex justify-center py-8"><div className="loading-dots"><span /><span /><span /></div></div>}
              {!loading && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80">
                        <th className="p-3 text-left text-sm font-semibold text-slate-700">Student</th>
                        <th className="p-3 text-left text-sm font-semibold text-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicationsList.map((a) => (
                        <tr key={a._id} className="border-b border-slate-100 last:border-0">
                          <td className="p-3">{a.studentId?.name} ({a.studentId?.email})</td>
                          <td className="p-3"><span className="badge-neutral">{a.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!loading && applicationsList.length === 0 && <p className="mt-6 text-slate-500">No applications for this scholarship.</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

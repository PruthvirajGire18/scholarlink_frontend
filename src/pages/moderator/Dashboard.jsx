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

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Moderator Dashboard</h1>

      {/* VIEW SWITCH */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => navigate("/moderator")}
          className={`px-4 py-2 rounded ${
            view === "CREATE"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Create Scholarship
        </button>

        <button
          onClick={() => navigate("/moderator/my-scholarships")}
          className={`px-4 py-2 rounded ${view === "MY_SCHOLARSHIPS" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
        >
          My Scholarships
        </button>
        <button
          onClick={() => navigate("/moderator/assistance")}
          className={`px-4 py-2 rounded ${view === "ASSISTANCE" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
        >
          Assistance
        </button>
        <button
          onClick={() => navigate("/moderator/applications")}
          className={`px-4 py-2 rounded ${view === "APPLICATIONS" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
        >
          Application Progress
        </button>
      </div>

      {/* =========================
         CREATE SCHOLARSHIP
      ========================= */}
      {view === "CREATE" && (
        <div className="bg-white p-6 rounded shadow max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">
            Create Scholarship
          </h2>

          {/* BASIC */}
          <input
            type="text"
            placeholder="Scholarship Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="border p-2 w-full mb-2"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={e =>
              setForm({ ...form, description: e.target.value })
            }
            className="border p-2 w-full mb-4"
          />

          {/* PROVIDER */}
          <h3 className="font-semibold mb-2">Provider</h3>

          <input
            type="text"
            placeholder="Provider Name"
            value={form.providerName}
            onChange={e =>
              setForm({ ...form, providerName: e.target.value })
            }
            className="border p-2 w-full mb-2"
          />

          <input
            type="text"
            placeholder="Provider Website"
            value={form.providerWebsite}
            onChange={e =>
              setForm({ ...form, providerWebsite: e.target.value })
            }
            className="border p-2 w-full mb-2"
          />

          <select
            value={form.providerType}
            onChange={e =>
              setForm({ ...form, providerType: e.target.value })
            }
            className="border p-2 w-full mb-4"
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
            className="border p-2 w-full mb-2"
          />

          <input
            type="text"
            placeholder="Benefits (tuition, stipend, etc)"
            value={form.benefits}
            onChange={e =>
              setForm({ ...form, benefits: e.target.value })
            }
            className="border p-2 w-full mb-4"
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
            className="border p-2 w-full mb-2"
          />

          <input
            type="number"
            placeholder="Maximum Income"
            value={form.maxIncome}
            onChange={e =>
              setForm({ ...form, maxIncome: e.target.value })
            }
            className="border p-2 w-full mb-2"
          />

          <select
            value={form.gender}
            onChange={e =>
              setForm({ ...form, gender: e.target.value })
            }
            className="border p-2 w-full mb-2"
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
            className="border p-2 w-full mb-2"
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
            className="border p-2 w-full mb-4"
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
            className="border p-2 w-full mb-4"
          />

          {/* APPLICATION */}
          <h3 className="font-semibold mb-2">Application Process</h3>

          <select
            value={form.applicationMode}
            onChange={e =>
              setForm({ ...form, applicationMode: e.target.value })
            }
            className="border p-2 w-full mb-2"
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
            className="border p-2 w-full mb-2"
          />

          <textarea
            placeholder="Application steps (one per line)"
            value={form.applicationSteps}
            onChange={e =>
              setForm({ ...form, applicationSteps: e.target.value })
            }
            className="border p-2 w-full mb-4"
          />

          {/* DEADLINE */}
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={form.deadline}
            onChange={e =>
              setForm({ ...form, deadline: e.target.value })
            }
            className="border p-2 w-full mb-4"
          />

          <button
            disabled={loading}
            onClick={handleCreate}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      )}

      {/* =========================
         MY SCHOLARSHIPS
      ========================= */}
      {view === "MY_SCHOLARSHIPS" && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">
            My Scholarships
          </h2>

          {loading && <p>Loading...</p>}

          {!loading && myScholarships.length === 0 && (
            <p>No scholarships created yet</p>
          )}

          {!loading && myScholarships.length > 0 && (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2 text-left">Provider</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Deadline</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myScholarships.map((s) => (
                  <tr key={s._id} className="border-t">
                    <td className="p-2">{s.title}</td>
                    <td className="p-2">{s.provider?.type}</td>
                    <td className="p-2">₹{s.amount}</td>
                    <td className="p-2">{new Date(s.deadline).toLocaleDateString()}</td>
                    <td className="p-2 font-semibold">
                      {s.status === "PENDING" && <span className="text-yellow-600">Pending</span>}
                      {s.status === "APPROVED" && <span className="text-green-600">Approved</span>}
                      {s.status === "REJECTED" && <span className="text-red-600">Rejected</span>}
                    </td>
                    <td className="p-2">
                      {s.status === "REJECTED" && (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(s._id);
                              fillFormFromScholarship(s);
                              setView("EDIT");
                            }}
                            className="bg-amber-600 text-white px-2 py-1 rounded text-sm mr-1"
                          >
                            Edit &amp; Re-submit
                          </button>
                        </>
                      )}
                      {s.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(s._id);
                              fillFormFromScholarship(s);
                              setView("EDIT");
                            }}
                            className="bg-gray-600 text-white px-2 py-1 rounded text-sm mr-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleWithdraw(s._id)}
                            className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                          >
                            Withdraw
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {myScholarships.some((s) => s.status === "REJECTED") && (
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold">Rejection reasons</h3>
              {myScholarships
                .filter((s) => s.status === "REJECTED" && s.reviewRemarks)
                .map((s) => (
                  <div key={s._id} className="border p-2 rounded bg-red-50">
                    <strong>{s.title}</strong>: {s.reviewRemarks}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {view === "EDIT" && editingId && (
        <div className="bg-white p-6 rounded shadow max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Edit scholarship (resubmit for review)</h2>
          <input
            type="text"
            placeholder="Scholarship Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border p-2 w-full mb-2"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border p-2 w-full mb-4"
          />
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="border p-2 w-full mb-2"
          />
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="border p-2 w-full mb-4"
          />
          <div className="flex gap-2">
            <button
              disabled={loading}
              onClick={handleUpdateScholarship}
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Update &amp; Re-submit
            </button>
            <button
              onClick={() => { setEditingId(null); setView("MY_SCHOLARSHIPS"); }}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {view === "ASSISTANCE" && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Assistance inbox</h2>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setAssistanceFilter("")}
              className={`px-3 py-1 rounded ${!assistanceFilter ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
            >
              All
            </button>
            <button
              onClick={() => setAssistanceFilter("OPEN")}
              className={`px-3 py-1 rounded ${assistanceFilter === "OPEN" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
            >
              Open
            </button>
            <button
              onClick={() => setAssistanceFilter("RESOLVED")}
              className={`px-3 py-1 rounded ${assistanceFilter === "RESOLVED" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
            >
              Resolved
            </button>
          </div>
          {loading && <p>Loading...</p>}
          {!loading && assistanceList.length === 0 && <p className="text-gray-500">No assistance requests.</p>}
          {!loading && assistanceList.length > 0 && (
            <div className="space-y-4">
              {assistanceList.map((ar) => (
                <div key={ar._id} className="border rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{ar.scholarshipId?.title}</p>
                      <p className="text-sm text-gray-600">Student: {ar.studentId?.name} ({ar.studentId?.email})</p>
                      <p className={`text-sm font-medium ${ar.status === "OPEN" ? "text-amber-600" : "text-green-600"}`}>
                        {ar.status}
                      </p>
                    </div>
                    {ar.status === "OPEN" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolve(ar._id)}
                          className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 border-t pt-2 space-y-1">
                    {(ar.messages || []).map((m, i) => (
                      <p key={i} className="text-sm">
                        <span className="font-medium">{m.from}:</span> {m.text}
                      </p>
                    ))}
                  </div>
                  {ar.status === "OPEN" && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        placeholder="Reply..."
                        value={replyingId === ar._id ? replyText : ""}
                        onChange={(e) => {
                          setReplyingId(ar._id);
                          setReplyText(e.target.value);
                        }}
                        onFocus={() => setReplyingId(ar._id)}
                        className="border p-2 flex-1 rounded"
                      />
                      <button
                        onClick={() => handleReply(ar._id)}
                        disabled={!(replyingId === ar._id && replyText.trim())}
                        className="bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "APPLICATIONS" && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Application progress</h2>
          {!applicationsScholarshipId ? (
            <>
              <p className="text-gray-600 mb-2">Select a scholarship:</p>
              <ul className="list-disc list-inside">
                {myScholarships.map((s) => (
                  <li key={s._id}>
                    <button
                      onClick={() => { setApplicationsScholarshipId(s._id); fetchApplications(s._id); }}
                      className="text-indigo-600 underline"
                    >
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <button
                onClick={() => { setApplicationsScholarshipId(null); setApplicationsList([]); }}
                className="text-gray-500 text-sm mb-2"
              >
                ← Back
              </button>
              {loading && <p>Loading...</p>}
              {!loading && (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 text-left">Student</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicationsList.map((a) => (
                      <tr key={a._id} className="border-t">
                        <td className="p-2">{a.studentId?.name} ({a.studentId?.email})</td>
                        <td className="p-2">{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!loading && applicationsList.length === 0 && <p className="text-gray-500">No applications for this scholarship.</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getAllModerators,
  createModerator,
  getPendingScholarships,
  getAllScholarships,
  reviewScholarship,
  getVerificationQueue,
  getPendingDocuments,
  getFraudAlerts
} from "../../services/adminService";
import VerificationQueue from "./VerificationQueue";
import DocumentReview from "./DocumentReview";
import AuditLogs from "./AuditLogs";
import FraudPanel from "./FraudPanel";

// URL se view derive karo - taaki "View list" / Moderators pe click karte hi sahi content dikhe
function getViewFromPathname(pathname) {
  const path = pathname || "";
  if (path === "/admin/scholarships" || path.startsWith("/admin/scholarships/")) return "PENDING";
  if (path === "/admin/moderators" || path.startsWith("/admin/moderators")) return "MODERATORS";
  if (path === "/admin/verification" || path.startsWith("/admin/verification")) return "VERIFICATION";
  if (path === "/admin/documents" || path.startsWith("/admin/documents")) return "DOCUMENTS";
  if (path === "/admin/audit-logs" || path.startsWith("/admin/audit-logs")) return "AUDIT";
  if (path === "/admin/fraud" || path.startsWith("/admin/fraud")) return "FRAUD";
  if (path === "/admin/all-scholarships" || path.startsWith("/admin/all-scholarships")) return "ALL";
  if (path === "/admin" || path === "/admin/") return "OVERVIEW";
  return "OVERVIEW";
}

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const view = getViewFromPathname(location.pathname);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState({ pendingScholarships: 0, pendingDocuments: 0, fraudAlerts: 0, moderatorsCount: 0 });

  useEffect(() => {
    if (view !== "OVERVIEW") return;
    (async () => {
      try {
        const [sch, docs, fraud, mods] = await Promise.all([
          getPendingScholarships(),
          getPendingDocuments(),
          getFraudAlerts(false),
          getAllModerators()
        ]);
        setOverview({
          pendingScholarships: sch.length,
          pendingDocuments: docs.length,
          fraudAlerts: fraud.length,
          moderatorsCount: mods.length
        });
      } catch {
        setOverview({ pendingScholarships: 0, pendingDocuments: 0, fraudAlerts: 0, moderatorsCount: 0 });
      }
    })();
  }, [view]);

  /* =========================
     MODERATOR STATE
  ========================= */
  const [moderators, setModerators] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  /* =========================
     SCHOLARSHIP STATE
  ========================= */
  const [pendingScholarships, setPendingScholarships] = useState([]);
  const [allScholarships, setAllScholarships] = useState([]);

  /* =========================
     FETCH MODERATORS
  ========================= */
  const fetchModerators = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllModerators();
      setModerators(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load moderators");
      setModerators([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CREATE MODERATOR
  ========================= */
  const handleCreateModerator = async () => {
    if (!form.name || !form.email || !form.password) {
      return alert("All fields required");
    }

    await createModerator(form);
    setForm({ name: "", email: "", password: "" });
    fetchModerators();
  };

  /* =========================
     FETCH PENDING SCHOLARSHIPS
  ========================= */
  const fetchPendingScholarships = async () => {
    try {
      setLoading(true);
      const data = await getPendingScholarships();
      setPendingScholarships(data);
    } catch {
      setError("Failed to load pending scholarships");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FETCH ALL SCHOLARSHIPS
  ========================= */
  const fetchAllScholarships = async () => {
    try {
      setLoading(true);
      const data = await getAllScholarships();
      setAllScholarships(data);
    } catch {
      setError("Failed to load scholarships");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     REVIEW SCHOLARSHIP
  ========================= */
  const handleReview = async (id, status, remarks = "") => {
    await reviewScholarship(id, status, remarks);
    fetchPendingScholarships();
    fetchAllScholarships();
  };

  /* =========================
     ON VIEW CHANGE
  ========================= */
  useEffect(() => {
    setError("");
    if (view === "MODERATORS") fetchModerators();
    if (view === "PENDING") fetchPendingScholarships();
    if (view === "ALL") fetchAllScholarships();
  }, [view]);

  const navClass = (v) =>
    view === v
      ? "bg-teal-600 text-white shadow-sm"
      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50";

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => navigate("/admin")} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${navClass("OVERVIEW")}`}>
          Overview
        </button>
        <button onClick={() => navigate("/admin/moderators")} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${navClass("MODERATORS")}`}>
          Moderators
        </button>
        <button onClick={() => navigate("/admin/scholarships")} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${navClass("PENDING")}`}>
          Pending Scholarships
        </button>
        <button onClick={() => navigate("/admin/all-scholarships")} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${navClass("ALL")}`}>
          All Scholarships
        </button>
        <button onClick={() => navigate("/admin/verification")} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${navClass("VERIFICATION")}`}>
          Verification
        </button>
        <button onClick={() => navigate("/admin/documents")} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${navClass("DOCUMENTS")}`}>
          Documents
        </button>
        <button onClick={() => navigate("/admin/audit-logs")} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${navClass("AUDIT")}`}>
          Audit
        </button>
        <button onClick={() => navigate("/admin/fraud")} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${navClass("FRAUD")}`}>
          Fraud
        </button>
      </div>

      {loading && (
        <div className="mt-8 flex justify-center py-12">
          <div className="loading-dots"><span /><span /><span /></div>
        </div>
      )}
      {error && (
        <div role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {view === "OVERVIEW" && (
        <>
          {/* Create Moderator form - sabse upar Overview pe */}
          <div className="card mt-8">
            <h2 className="text-lg font-bold text-slate-900">Create moderator</h2>
            <p className="mt-1 text-sm text-slate-500">Add a new moderator. They can create and manage scholarships.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                <input
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-base w-full"
                />
              </div>
              <div className="flex items-end">
                <button onClick={handleCreateModerator} className="btn-primary w-full sm:w-auto">
                  Create moderator
                </button>
              </div>
            </div>
          </div>

          <h3 className="mt-10 text-base font-semibold text-slate-800">Quick stats</h3>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Pending Scholarships</h3>
              <p className="mt-2 text-3xl font-bold text-teal-600">{overview.pendingScholarships}</p>
              <button onClick={() => navigate("/admin/scholarships")} className="btn-secondary mt-4 text-sm">
                View
              </button>
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Pending Documents</h3>
              <p className="mt-2 text-3xl font-bold text-amber-600">{overview.pendingDocuments}</p>
              <button onClick={() => navigate("/admin/documents")} className="btn-secondary mt-4 text-sm">
                View
              </button>
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Fraud alerts (open)</h3>
              <p className="mt-2 text-3xl font-bold text-red-600">{overview.fraudAlerts}</p>
              <button onClick={() => navigate("/admin/fraud")} className="btn-secondary mt-4 text-sm">
                View
              </button>
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Moderators</h3>
              <p className="mt-2 text-3xl font-bold text-slate-700">{overview.moderatorsCount}</p>
              <button onClick={() => navigate("/admin/moderators")} className="btn-secondary mt-4 text-sm">
                View list
              </button>
            </div>
          </div>
        </>
      )}

      {view === "VERIFICATION" && <VerificationQueue />}
      {view === "DOCUMENTS" && <DocumentReview />}
      {view === "AUDIT" && <AuditLogs />}
      {view === "FRAUD" && <FraudPanel />}

      {view === "MODERATORS" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Moderators</h2>

          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900">Create moderator</h3>
            <p className="mt-1 text-sm text-slate-500">Add a new moderator. They will get access to create and manage scholarships.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                <input
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e)=>setForm({...form,name:e.target.value})}
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e)=>setForm({...form,email:e.target.value})}
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e)=>setForm({...form,password:e.target.value})}
                  className="input-base w-full"
                />
              </div>
              <div className="flex items-end">
                <button onClick={handleCreateModerator} className="btn-primary w-full sm:w-auto">
                  Create moderator
                </button>
              </div>
            </div>
          </div>

          <div className="card mt-6 min-h-[200px]">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Moderator list ({(moderators || []).length})</h3>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="loading-dots"><span /><span /><span /></div>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-slate-200">
                {(moderators || []).length === 0 ? (
                  <li className="py-8 text-center text-slate-500">No moderators yet. Create one using the form above.</li>
                ) : (
                  (moderators || []).map(m=>(
                    <li key={m._id || m.email} className="py-3 first:pt-0">{m.name} <span className="text-slate-400">·</span> {m.email}</li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      )}

      {view === "PENDING" && (
        <div className="mt-8 space-y-4">
          {pendingScholarships.map(s=>(
            <div key={s._id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.status}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>handleReview(s._id,"APPROVED")} className="btn-primary !bg-emerald-600 hover:!bg-emerald-700">
                  Approve
                </button>
                <button onClick={()=>handleReview(s._id,"REJECTED")} className="btn-danger py-2">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "ALL" && (
        <div className="mt-8 space-y-4">
          {allScholarships.map(s=>(
            <div key={s._id} className="card">
              <h3 className="font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-slate-600">₹{s.amount?.toLocaleString?.() ?? s.amount}</p>
              <span className={s.status === "APPROVED" ? "badge-success" : s.status === "REJECTED" ? "badge-danger" : "badge-warning"}>{s.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

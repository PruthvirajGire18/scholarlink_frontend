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

export default function AdminDashboard() {
  const [view, setView] = useState("MODERATORS");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState({ pendingScholarships: 0, pendingDocuments: 0, fraudAlerts: 0 });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/admin/scholarships") setView("PENDING");
    else if (location.pathname === "/admin/moderators") setView("MODERATORS");
    else if (location.pathname === "/admin/verification") setView("VERIFICATION");
    else if (location.pathname === "/admin/documents") setView("DOCUMENTS");
    else if (location.pathname === "/admin/audit-logs") setView("AUDIT");
    else if (location.pathname === "/admin/fraud") setView("FRAUD");
    else if (location.pathname === "/admin" || location.pathname === "/admin/") setView("OVERVIEW");
    else setView("OVERVIEW");
  }, [location.pathname]);

  useEffect(() => {
    if (view !== "OVERVIEW") return;
    (async () => {
      try {
        const [sch, docs, fraud] = await Promise.all([
          getPendingScholarships(),
          getPendingDocuments(),
          getFraudAlerts(false)
        ]);
        setOverview({
          pendingScholarships: sch.length,
          pendingDocuments: docs.length,
          fraudAlerts: fraud.length
        });
      } catch {
        setOverview({ pendingScholarships: 0, pendingDocuments: 0, fraudAlerts: 0 });
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
      const data = await getAllModerators();
      setModerators(data);
    } catch {
      setError("Failed to load moderators");
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
    view === v ? "bg-indigo-600 text-white" : "bg-gray-200";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => navigate("/admin")} className={`px-4 py-2 rounded ${navClass("OVERVIEW")}`}>
          Overview
        </button>
        <button onClick={() => navigate("/admin/moderators")} className={`px-4 py-2 rounded ${navClass("MODERATORS")}`}>
          Moderators
        </button>
        <button onClick={() => navigate("/admin/scholarships")} className={`px-4 py-2 rounded ${navClass("PENDING")}`}>
          Pending Scholarships
        </button>
        <button onClick={() => setView("ALL")} className={`px-4 py-2 rounded ${navClass("ALL")}`}>
          All Scholarships
        </button>
        <button onClick={() => navigate("/admin/verification")} className={`px-4 py-2 rounded ${navClass("VERIFICATION")}`}>
          Verification Queue
        </button>
        <button onClick={() => navigate("/admin/documents")} className={`px-4 py-2 rounded ${navClass("DOCUMENTS")}`}>
          Document Review
        </button>
        <button onClick={() => navigate("/admin/audit-logs")} className={`px-4 py-2 rounded ${navClass("AUDIT")}`}>
          Audit Logs
        </button>
        <button onClick={() => navigate("/admin/fraud")} className={`px-4 py-2 rounded ${navClass("FRAUD")}`}>
          Fraud Panel
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {view === "OVERVIEW" && (
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-semibold text-gray-600">Pending Scholarships</h3>
            <p className="text-3xl font-bold text-indigo-600">{overview.pendingScholarships}</p>
            <button onClick={() => navigate("/admin/scholarships")} className="mt-2 text-indigo-600 text-sm">View</button>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-semibold text-gray-600">Pending Documents</h3>
            <p className="text-3xl font-bold text-amber-600">{overview.pendingDocuments}</p>
            <button onClick={() => navigate("/admin/documents")} className="mt-2 text-amber-600 text-sm">View</button>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-semibold text-gray-600">Fraud Alerts (open)</h3>
            <p className="text-3xl font-bold text-red-600">{overview.fraudAlerts}</p>
            <button onClick={() => navigate("/admin/fraud")} className="mt-2 text-red-600 text-sm">View</button>
          </div>
        </div>
      )}

      {view === "VERIFICATION" && <VerificationQueue />}
      {view === "DOCUMENTS" && <DocumentReview />}
      {view === "AUDIT" && <AuditLogs />}
      {view === "FRAUD" && <FraudPanel />}

      {view === "MODERATORS" && (
        <>
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="font-semibold mb-3">Create Moderator</h2>

            <div className="flex gap-3 flex-wrap">
              <input placeholder="Name" value={form.name}
                onChange={(e)=>setForm({...form,name:e.target.value})}
                className="border p-2 rounded w-60"/>

              <input placeholder="Email" value={form.email}
                onChange={(e)=>setForm({...form,email:e.target.value})}
                className="border p-2 rounded w-60"/>

              <input type="password" placeholder="Password" value={form.password}
                onChange={(e)=>setForm({...form,password:e.target.value})}
                className="border p-2 rounded w-60"/>

              <button onClick={handleCreateModerator}
                className="bg-indigo-600 text-white px-4 py-2 rounded">
                Create
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            {moderators.map(m=>(
              <p key={m._id}>{m.name} – {m.email}</p>
            ))}
          </div>
        </>
      )}

      {/* =========================
         PENDING SCHOLARSHIPS VIEW
      ========================= */}
      {view === "PENDING" && (
        <div className="bg-white p-4 rounded shadow">
          {pendingScholarships.map(s=>(
            <div key={s._id} className="border p-3 mb-3">
              <h3>{s.title}</h3>
              <p>Status: {s.status}</p>
              <button onClick={()=>handleReview(s._id,"APPROVED")}
                className="bg-green-600 text-white px-3 py-1 mr-2 rounded">
                Approve
              </button>
              <button onClick={()=>handleReview(s._id,"REJECTED")}
                className="bg-red-600 text-white px-3 py-1 rounded">
                Reject
              </button>
            </div>
          ))}
        </div>
      )}

      {/* =========================
         ALL SCHOLARSHIPS VIEW
      ========================= */}
      {view === "ALL" && (
        <div className="bg-white p-4 rounded shadow">
          {allScholarships.map(s=>(
            <div key={s._id} className="border p-3 mb-3">
              <h3>{s.title}</h3>
              <p>Amount: ₹{s.amount}</p>
              <p>Status: {s.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

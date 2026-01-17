import { useEffect, useState } from "react";
import {
  getAllModerators,
  createModerator,
  getPendingScholarships,
  getAllScholarships,
  reviewScholarship
} from "../../services/adminService";

export default function AdminDashboard() {
  /* =========================
     VIEW STATE
  ========================= */
  const [view, setView] = useState("MODERATORS");
  // MODERATORS | PENDING | ALL

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
  const handleReview = async (id, status) => {
    await reviewScholarship(id, status);
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

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">
        Admin Dashboard
      </h1>

      {/* VIEW SWITCH */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setView("MODERATORS")}
          className={`px-4 py-2 rounded ${view==="MODERATORS"?"bg-indigo-600 text-white":"bg-gray-200"}`}>
          Moderators
        </button>

        <button onClick={() => setView("PENDING")}
          className={`px-4 py-2 rounded ${view==="PENDING"?"bg-indigo-600 text-white":"bg-gray-200"}`}>
          Pending Scholarships
        </button>

        <button onClick={() => setView("ALL")}
          className={`px-4 py-2 rounded ${view==="ALL"?"bg-indigo-600 text-white":"bg-gray-200"}`}>
          All Scholarships
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* =========================
         MODERATORS VIEW
      ========================= */}
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

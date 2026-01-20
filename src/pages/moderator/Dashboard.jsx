import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createScholarship,
  getMyScholarships
} from "../../services/moderatorService";

export default function ModeratorDashboard() {
  /* =========================
     VIEW STATE
  ========================= */
  const [view, setView] = useState("CREATE");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/moderator/my-scholarships") {
      setView("MY_SCHOLARSHIPS");
    } else {
      setView("CREATE");
    }
  }, [location.pathname]);

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
          className={`px-4 py-2 rounded ${
            view === "MY_SCHOLARSHIPS"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200"
          }`}
        >
          My Scholarships
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
                </tr>
              </thead>
              <tbody>
                {myScholarships.map(s => (
                  <tr key={s._id} className="border-t">
                    <td className="p-2">{s.title}</td>
                    <td className="p-2">{s.provider?.type}</td>
                    <td className="p-2">₹{s.amount}</td>
                    <td className="p-2">
                      {new Date(s.deadline).toLocaleDateString()}
                    </td>
                    <td className="p-2 font-semibold">
                      {s.status === "PENDING" && (
                        <span className="text-yellow-600">Pending</span>
                      )}
                      {s.status === "APPROVED" && (
                        <span className="text-green-600">Approved</span>
                      )}
                      {s.status === "REJECTED" && (
                        <span className="text-red-600">Rejected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

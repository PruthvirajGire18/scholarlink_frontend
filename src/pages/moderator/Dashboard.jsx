import { useEffect, useState } from "react";
import {
  createScholarship,
  getMyScholarships
} from "../../services/moderatorService";

export default function ModeratorDashboard() {
  /* =========================
     VIEW STATE
  ========================= */
  const [view, setView] = useState("CREATE");
  // CREATE | MY_SCHOLARSHIPS

  /* =========================
     FORM STATE (SCHEMA ALIGNED)
  ========================= */
  const [form, setForm] = useState({
    title: "",
    description: "",
    providerType: "GOVERNMENT",
    amount: "",
    deadline: ""
  });

  /* =========================
     DATA STATE
  ========================= */
  const [myScholarships, setMyScholarships] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =========================
     CREATE SCHOLARSHIP
  ========================= */
  const handleCreate = async () => {
    if (!form.title || !form.amount || !form.deadline) {
      return alert("Title, Amount and Deadline are required");
    }

    await createScholarship({
      title: form.title,
      description: form.description,
      provider: {
        type: form.providerType
      },
      amount: form.amount,
      deadline: form.deadline
    });

    alert("Scholarship submitted for admin review");

    setForm({
      title: "",
      description: "",
      providerType: "GOVERNMENT",
      amount: "",
      deadline: ""
    });

    setView("MY_SCHOLARSHIPS");
  };

  /* =========================
     FETCH MY SCHOLARSHIPS
  ========================= */
  const fetchMyScholarships = async () => {
    setLoading(true);
    const data = await getMyScholarships();
    setMyScholarships(data);
    setLoading(false);
  };

  /* =========================
     ON VIEW CHANGE
  ========================= */
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
      <h1 className="text-2xl font-bold mb-6">
        Moderator Dashboard
      </h1>

      {/* VIEW SWITCH */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setView("CREATE")}
          className={`px-4 py-2 rounded ${
            view === "CREATE"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Create Scholarship
        </button>

        <button
          onClick={() => setView("MY_SCHOLARSHIPS")}
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
         CREATE SCHOLARSHIP VIEW
      ========================= */}
      {view === "CREATE" && (
        <div className="bg-white p-6 rounded shadow max-w-xl">
          <h2 className="text-lg font-semibold mb-4">
            Create Scholarship
          </h2>

          <input
            type="text"
            placeholder="Scholarship Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="border p-2 w-full mb-3"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="border p-2 w-full mb-3"
          />

          <select
            value={form.providerType}
            onChange={(e) =>
              setForm({ ...form, providerType: e.target.value })
            }
            className="border p-2 w-full mb-3"
          >
            <option value="GOVERNMENT">Government</option>
            <option value="NGO">NGO</option>
            <option value="CSR">CSR</option>
            <option value="PRIVATE">Private</option>
          </select>

          <input
            type="number"
            placeholder="Scholarship Amount"
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: e.target.value })
            }
            className="border p-2 w-full mb-3"
          />

          <input
            type="date"
            value={form.deadline}
            onChange={(e) =>
              setForm({ ...form, deadline: e.target.value })
            }
            className="border p-2 w-full mb-4"
          />

          <button
            onClick={handleCreate}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Submit for Review
          </button>
        </div>
      )}

      {/* =========================
         MY SCHOLARSHIPS VIEW
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
                <tr className="bg-gray-200 text-left">
                  <th className="p-2">Title</th>
                  <th className="p-2">Provider</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Deadline</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {myScholarships.map((s) => (
                  <tr key={s._id} className="border-t">
                    <td className="p-2">{s.title}</td>
                    <td className="p-2">
                      {s.provider?.type || "-"}
                    </td>
                    <td className="p-2">₹{s.amount}</td>
                    <td className="p-2">
                      {new Date(s.deadline).toLocaleDateString()}
                    </td>
                    <td className="p-2 font-semibold">
                      {s.status === "PENDING" && (
                        <span className="text-yellow-600">
                          Pending
                        </span>
                      )}
                      {s.status === "APPROVED" && (
                        <span className="text-green-600">
                          Approved
                        </span>
                      )}
                      {s.status === "REJECTED" && (
                        <span className="text-red-600">
                          Rejected
                        </span>
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

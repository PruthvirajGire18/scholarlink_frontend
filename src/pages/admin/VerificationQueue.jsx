import { useEffect, useState } from "react";
import {
  getVerificationQueue,
  verifyScholarship,
  flagScholarship,
  addInternalNote
} from "../../services/adminService";

export default function VerificationQueue() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [note, setNote] = useState("");
  const [flagReason, setFlagReason] = useState("");

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await getVerificationQueue();
      setList(data);
    } catch {
      setError("Failed to load verification queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleVerify = async (id) => {
    try {
      await verifyScholarship(id);
      fetchQueue();
      setSelectedId(null);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to verify");
    }
  };

  const handleFlag = async (id) => {
    try {
      await flagScholarship(id, flagReason);
      fetchQueue();
      setSelectedId(null);
      setFlagReason("");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to flag");
    }
  };

  const handleAddNote = async (id) => {
    if (!note.trim()) return;
    try {
      await addInternalNote(id, note);
      setNote("");
      fetchQueue();
      const s = list.find((x) => x._id === id);
      if (s) s.internalNotes = s.internalNotes || []; // refresh
    } catch (e) {
      setError(e.response?.data?.message || "Failed to add note");
    }
  };

  const selected = list.find((s) => s._id === selectedId);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Scholarship Verification Queue</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && list.length === 0 && (
        <p className="text-gray-500">No scholarships in verification queue.</p>
      )}

      {!loading && list.length > 0 && (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Risk</th>
                <th className="p-2 text-left">Created By</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s._id} className="border-b">
                  <td className="p-2">{s.title}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        (s.riskScore || 0) >= 50
                          ? "bg-red-100 text-red-800"
                          : (s.riskScore || 0) >= 25
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {s.riskScore ?? 0}
                    </span>
                  </td>
                  <td className="p-2">{s.createdBy?.name ?? "-"}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => handleVerify(s._id)}
                      className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => setSelectedId(s._id)}
                      className="bg-amber-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Flag / Note
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedId && selected && (
        <div className="bg-white p-4 rounded shadow border">
          <h3 className="font-semibold mb-2">Internal notes &amp; flag: {selected.title}</h3>
          <div className="space-y-2">
            <textarea
              placeholder="Flag reason"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              className="border p-2 w-full rounded"
              rows={2}
            />
            <button
              onClick={() => handleFlag(selectedId)}
              className="bg-amber-600 text-white px-3 py-1 rounded text-sm"
            >
              Flag listing
            </button>
          </div>
          <div className="mt-4">
            <textarea
              placeholder="Internal note (not visible to students)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border p-2 w-full rounded"
              rows={2}
            />
            <button
              onClick={() => handleAddNote(selectedId)}
              className="mt-2 bg-gray-700 text-white px-3 py-1 rounded text-sm"
            >
              Add note
            </button>
          </div>
          <button
            onClick={() => {
              setSelectedId(null);
              setFlagReason("");
              setNote("");
            }}
            className="mt-2 text-gray-500 text-sm"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

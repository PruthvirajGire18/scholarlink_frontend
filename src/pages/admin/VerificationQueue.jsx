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
    <div className="mt-8 space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Verification queue</h2>
      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading && <div className="flex justify-center py-12"><div className="loading-dots"><span /><span /><span /></div></div>}

      {!loading && list.length === 0 && (
        <div className="empty-state">No scholarships in verification queue.</div>
      )}

      {!loading && list.length > 0 && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Title</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Risk</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Created by</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s._id} className="border-b border-slate-100 last:border-0">
                    <td className="p-3 font-medium text-slate-900">{s.title}</td>
                    <td className="p-3">
                      <span className={(s.riskScore || 0) >= 50 ? "badge-danger" : (s.riskScore || 0) >= 25 ? "badge-warning" : "badge-success"}>
                        {s.riskScore ?? 0}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{s.createdBy?.name ?? "—"}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleVerify(s._id)} className="btn-primary !bg-emerald-600 hover:!bg-emerald-700 py-1.5 text-sm">Verify</button>
                        <button onClick={() => setSelectedId(s._id)} className="btn-accent py-1.5 text-sm">Flag / Note</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedId && selected && (
        <div className="card">
          <h3 className="font-semibold text-slate-900">Internal notes & flag: {selected.title}</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Flag reason</label>
              <textarea placeholder="Flag reason" value={flagReason} onChange={(e) => setFlagReason(e.target.value)} className="input-base min-h-[80px]" rows={2} />
              <button onClick={() => handleFlag(selectedId)} className="btn-accent mt-2">Flag listing</button>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Internal note (not visible to students)</label>
              <textarea placeholder="Note…" value={note} onChange={(e) => setNote(e.target.value)} className="input-base min-h-[80px]" rows={2} />
              <button onClick={() => handleAddNote(selectedId)} className="btn-secondary mt-2">Add note</button>
            </div>
            <button onClick={() => { setSelectedId(null); setFlagReason(""); setNote(""); }} className="text-sm text-slate-500 hover:text-slate-700">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

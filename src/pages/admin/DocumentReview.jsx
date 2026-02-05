import { useEffect, useState } from "react";
import { getPendingDocuments, reviewDocument } from "../../services/adminService";

export default function DocumentReview() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingId, setReviewingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await getPendingDocuments();
      setList(data);
    } catch {
      setError("Failed to load pending documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleReview = async (id, status) => {
    try {
      await reviewDocument(id, status, rejectionReason);
      setReviewingId(null);
      setRejectionReason("");
      fetchPending();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to review");
    }
  };

  const doc = list.find((d) => d._id === reviewingId);

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Document review</h2>
      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading && <div className="flex justify-center py-12"><div className="loading-dots"><span /><span /><span /></div></div>}

      {!loading && list.length === 0 && <div className="empty-state">No pending documents.</div>}

      {!loading && list.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="p-3 text-left text-sm font-semibold text-slate-700">Type</th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-700">User</th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-700">Scholarship</th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((d) => (
                    <tr key={d._id} className="border-b border-slate-100 last:border-0">
                      <td className="p-3 font-medium">{d.documentType}</td>
                      <td className="p-3 text-slate-600">{d.userId?.name ?? "—"}</td>
                      <td className="p-3 text-slate-600">{d.scholarshipId?.title ?? "—"}</td>
                      <td className="p-3">
                        <button onClick={() => setReviewingId(d._id)} className="btn-primary py-1.5 text-sm">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            {doc ? (
              <>
                <h3 className="font-semibold text-slate-900">Review: {doc.documentType}</h3>
                <p className="mt-1 text-sm text-slate-500">User: {doc.userId?.name} · {doc.scholarshipId?.title}</p>
                {doc.fileUrl && (
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium text-teal-600 hover:underline">Open file →</a>
                )}
                <input type="text" placeholder="Rejection reason (if rejecting)" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="input-base mt-4" />
                <div className="mt-4 flex gap-2">
                  <button onClick={() => handleReview(doc._id, "APPROVED")} className="btn-primary !bg-emerald-600 hover:!bg-emerald-700">Approve</button>
                  <button onClick={() => handleReview(doc._id, "REJECTED")} className="btn-danger py-2">Reject</button>
                  <button onClick={() => { setReviewingId(null); setRejectionReason(""); }} className="btn-secondary">Cancel</button>
                </div>
              </>
            ) : (
              <p className="text-slate-500">Select a document to review.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

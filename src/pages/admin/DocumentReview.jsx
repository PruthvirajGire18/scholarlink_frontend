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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Document Review Panel</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && list.length === 0 && (
        <p className="text-gray-500">No pending documents.</p>
      )}

      {!loading && list.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">User</th>
                  <th className="p-2 text-left">Scholarship</th>
                  <th className="p-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map((d) => (
                  <tr key={d._id} className="border-b">
                    <td className="p-2">{d.documentType}</td>
                    <td className="p-2">{d.userId?.name ?? "-"}</td>
                    <td className="p-2">{d.scholarshipId?.title ?? "-"}</td>
                    <td className="p-2">
                      <button
                        onClick={() => setReviewingId(d._id)}
                        className="bg-indigo-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded shadow p-4">
            {doc ? (
              <>
                <h3 className="font-semibold mb-2">Review: {doc.documentType}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  User: {doc.userId?.name} | Scholarship: {doc.scholarshipId?.title}
                </p>
                {doc.fileUrl && (
                  <div className="mb-4">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 underline"
                    >
                      Open file
                    </a>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Rejection reason (if rejecting)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="border p-2 w-full rounded mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview(doc._id, "APPROVED")}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(doc._id, "REJECTED")}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setReviewingId(null);
                      setRejectionReason("");
                    }}
                    className="text-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Select a document to review.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getScholarshipById, createAssistanceRequest, getMyAssistanceRequests } from "../../services/studentService";

export default function ScholarshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [helpMessage, setHelpMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const s = await getScholarshipById(id);
        setScholarship(s);
      } catch {
        setError("Scholarship not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const list = await getMyAssistanceRequests();
        setMyRequests(list);
        const open = list.find((r) => r.scholarshipId?._id === id || r.scholarshipId === id);
        setExistingRequest(open || null);
      } catch {
        setMyRequests([]);
      }
    })();
  }, [id, scholarship]);

  const handleRequestHelp = async () => {
    if (!helpMessage.trim()) return;
    try {
      setSubmitting(true);
      await createAssistanceRequest(id, helpMessage.trim());
      setHelpMessage("");
      setShowHelp(false);
      const list = await getMyAssistanceRequests();
      setMyRequests(list);
      const open = list.find((r) => r.scholarshipId?._id === id || r.scholarshipId === id);
      setExistingRequest(open || null);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error || !scholarship) return <p className="p-6 text-red-600">{error || "Not found"}</p>;

  return (
    <div className="p-6 max-w-3xl">
      <button onClick={() => navigate("/student")} className="text-indigo-600 text-sm mb-4">
        ← Back to scholarships
      </button>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-2">{scholarship.title}</h2>
        <p className="text-gray-600 mb-4">{scholarship.description}</p>
        <p className="font-semibold">Amount: ₹{scholarship.amount}</p>
        <p className="text-sm text-gray-600">
          Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
        </p>
        {scholarship.provider?.name && (
          <p className="text-sm text-gray-600">Provider: {scholarship.provider.name}</p>
        )}
      </div>

      <div className="mt-6 bg-white p-6 rounded shadow">
        <h3 className="font-semibold mb-2">Need help with this scholarship?</h3>
        {existingRequest ? (
          <div className="border rounded p-4">
            <p className="text-sm font-medium text-amber-600 mb-2">
              You have an open assistance request for this scholarship. Status: {existingRequest.status}
            </p>
            <div className="space-y-2">
              {(existingRequest.messages || []).map((m, i) => (
                <p key={i} className="text-sm">
                  <span className="font-medium">{m.from}:</span> {m.text}
                </p>
              ))}
            </div>
            <button
              onClick={() => navigate("/student/assistance")}
              className="mt-2 text-indigo-600 text-sm"
            >
              View all my assistance requests →
            </button>
          </div>
        ) : (
          <>
            {!showHelp ? (
              <button
                onClick={() => setShowHelp(true)}
                className="bg-amber-500 text-white px-4 py-2 rounded"
              >
                Need Help?
              </button>
            ) : (
              <div>
                <textarea
                  placeholder="Describe your issue or question..."
                  value={helpMessage}
                  onChange={(e) => setHelpMessage(e.target.value)}
                  className="border p-2 w-full rounded mb-2"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    disabled={submitting || !helpMessage.trim()}
                    onClick={handleRequestHelp}
                    className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {submitting ? "Sending..." : "Send request"}
                  </button>
                  <button
                    onClick={() => { setShowHelp(false); setHelpMessage(""); }}
                    className="bg-gray-200 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

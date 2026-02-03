import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAssistanceRequests, replyToAssistance, resolveAssistance } from "../../services/moderatorService";

export default function ModeratorAssistanceThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const list = await getAssistanceRequests();
      const found = list.find((r) => r._id === id);
      setRequest(found || null);
    } catch {
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleReply = async () => {
    if (!replyText.trim() || !request) return;
    try {
      await replyToAssistance(request._id, replyText.trim());
      setReplyText("");
      fetchRequest();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to reply");
    }
  };

  const handleResolve = async () => {
    if (!request) return;
    try {
      await resolveAssistance(request._id);
      fetchRequest();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to resolve");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!request)
    return (
      <div className="p-6">
        <p className="text-gray-500">Request not found.</p>
        <button onClick={() => navigate("/moderator/assistance")} className="text-indigo-600 mt-2">
          ← Assistance inbox
        </button>
      </div>
    );

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => navigate("/moderator/assistance")} className="text-indigo-600 text-sm mb-4">
        ← Assistance inbox
      </button>
      <div className="bg-white p-6 rounded shadow border">
        <h2 className="text-lg font-bold mb-2">{request.scholarshipId?.title || "Assistance"}</h2>
        <p className="text-sm text-gray-600 mb-2">
          Student: {request.studentId?.name} ({request.studentId?.email})
        </p>
        <p className="text-sm font-medium mb-4">Status: {request.status}</p>
        <div className="space-y-2 border-t pt-4 mb-4">
          {(request.messages || []).map((m, i) => (
            <p key={i} className="text-sm">
              <span className="font-medium">{m.from}:</span> {m.text}
            </p>
          ))}
        </div>
        {request.status === "OPEN" && (
          <>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="border p-2 flex-1 rounded"
              />
              <button onClick={handleReply} disabled={!replyText.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50">
                Send
              </button>
            </div>
            <button onClick={handleResolve} className="bg-green-600 text-white px-4 py-2 rounded">
              Mark resolved
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAssistanceRequests,
  replyToAssistance,
  resolveAssistance
} from "../../services/moderatorService";

export default function ModeratorAssistanceInbox() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingId, setReplyingId] = useState(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      const data = await getAssistanceRequests(filter || undefined);
      setList(data);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [filter]);

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      await replyToAssistance(id, replyText.trim());
      setReplyText("");
      setReplyingId(null);
      fetchList();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to reply");
    }
  };

  const handleResolve = async (id) => {
    try {
      await resolveAssistance(id);
      fetchList();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to resolve");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button onClick={() => navigate("/moderator")} className="text-indigo-600 mb-4">
        ← Dashboard
      </button>
      <h2 className="text-xl font-bold mb-4">Assistance inbox</h2>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter("")}
          className={`px-3 py-1 rounded ${!filter ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("OPEN")}
          className={`px-3 py-1 rounded ${filter === "OPEN" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
        >
          Open
        </button>
        <button
          onClick={() => setFilter("RESOLVED")}
          className={`px-3 py-1 rounded ${filter === "RESOLVED" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
        >
          Resolved
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {!loading && list.length === 0 && <p className="text-gray-500">No assistance requests.</p>}
      {!loading && list.length > 0 && (
        <div className="space-y-4">
          {list.map((ar) => (
            <div key={ar._id} className="bg-white border rounded p-4 shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{ar.scholarshipId?.title}</p>
                  <p className="text-sm text-gray-600">
                    Student: {ar.studentId?.name} ({ar.studentId?.email})
                  </p>
                  <p className={`text-sm font-medium ${ar.status === "OPEN" ? "text-amber-600" : "text-green-600"}`}>
                    {ar.status}
                  </p>
                </div>
                {ar.status === "OPEN" && (
                  <button
                    onClick={() => handleResolve(ar._id)}
                    className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Resolve
                  </button>
                )}
              </div>
              <div className="mt-2 border-t pt-2 space-y-1">
                {(ar.messages || []).map((m, i) => (
                  <p key={i} className="text-sm">
                    <span className="font-medium">{m.from}:</span> {m.text}
                  </p>
                ))}
              </div>
              {ar.status === "OPEN" && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Reply..."
                    value={replyingId === ar._id ? replyText : ""}
                    onChange={(e) => {
                      setReplyingId(ar._id);
                      setReplyText(e.target.value);
                    }}
                    onFocus={() => setReplyingId(ar._id)}
                    className="border p-2 flex-1 rounded"
                  />
                  <button
                    onClick={() => handleReply(ar._id)}
                    disabled={!(replyingId === ar._id && replyText.trim())}
                    className="bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

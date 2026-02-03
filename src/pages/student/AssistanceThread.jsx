import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMyAssistanceRequests } from "../../services/studentService";

export default function AssistanceThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await getMyAssistanceRequests();
        const found = list.find((r) => r._id === id);
        setRequest(found || null);
      } catch {
        setRequest(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!request)
    return (
      <div className="p-6">
        <p className="text-gray-500">Request not found.</p>
        <button onClick={() => navigate("/student/assistance")} className="text-indigo-600 mt-2">
          ← My assistance
        </button>
      </div>
    );

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => navigate("/student/assistance")} className="text-indigo-600 text-sm mb-4">
        ← My assistance
      </button>
      <div className="bg-white p-6 rounded shadow border">
        <h2 className="text-lg font-bold mb-2">{request.scholarshipId?.title || "Assistance"}</h2>
        <p className="text-sm text-gray-600 mb-4">
          Moderator: {request.moderatorId?.name ?? "-"} | Status: {request.status}
        </p>
        <div className="space-y-2 border-t pt-4">
          {(request.messages || []).map((m, i) => (
            <p key={i} className="text-sm">
              <span className="font-medium">{m.from}:</span> {m.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

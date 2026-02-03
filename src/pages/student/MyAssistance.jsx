import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyAssistanceRequests } from "../../services/studentService";

export default function MyAssistance() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getMyAssistanceRequests();
        setList(data);
      } catch {
        setList([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-6">
      <button onClick={() => navigate("/student")} className="text-indigo-600 text-sm mb-4">
        ← Back to scholarships
      </button>
      <h2 className="text-xl font-bold mb-4">My assistance requests</h2>
      {loading && <p>Loading...</p>}
      {!loading && list.length === 0 && (
        <p className="text-gray-500">You have no assistance requests.</p>
      )}
      {!loading && list.length > 0 && (
        <div className="space-y-4">
          {list.map((ar) => (
            <div key={ar._id} className="bg-white p-4 rounded shadow border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{ar.scholarshipId?.title || "Scholarship"}</p>
                  <p className="text-sm text-gray-600">
                    Moderator: {ar.moderatorId?.name ?? "-"} | Status: {ar.status}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    ar.status === "OPEN" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {ar.status}
                </span>
              </div>
              <div className="mt-2 border-t pt-2 space-y-1">
                {(ar.messages || []).map((m, i) => (
                  <p key={i} className="text-sm">
                    <span className="font-medium">{m.from}:</span> {m.text}
                  </p>
                ))}
              </div>
              <button
                onClick={() => navigate(`/student/scholarships/${ar.scholarshipId?._id || ar.scholarshipId}`)}
                className="mt-2 text-indigo-600 text-sm"
              >
                View scholarship →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyAssistanceRequests } from "../../services/studentService";

export default function MyAssistance() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAssistanceRequests()
      .then(setList)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <button
        onClick={() => navigate("/student")}
        className="mb-6 text-sm font-medium text-slate-600 hover:text-teal-600"
      >
        ← Back to scholarships
      </button>
      <h1 className="text-2xl font-bold text-slate-900">My assistance requests</h1>

      {loading && (
        <div className="mt-8 flex justify-center py-12">
          <div className="loading-dots"><span /><span /><span /></div>
        </div>
      )}

      {!loading && list.length === 0 && (
        <div className="empty-state mt-8">
          <p className="font-medium">No assistance requests yet</p>
          <p className="mt-1 text-sm">Request help from a scholarship detail page when you need it.</p>
        </div>
      )}

      {!loading && list.length > 0 && (
        <div className="mt-8 space-y-5">
          {list.map((ar) => (
            <div key={ar._id} className="card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">{ar.scholarshipId?.title || "Scholarship"}</h2>
                  <p className="text-sm text-slate-500">
                    Moderator: {ar.moderatorId?.name ?? "—"} · {ar.status}
                  </p>
                </div>
                <span className={ar.status === "OPEN" ? "badge-warning" : "badge-success"}>
                  {ar.status}
                </span>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4 space-y-2">
                {(ar.messages || []).map((m, i) => (
                  <p key={i} className="text-sm text-slate-700">
                    <span className="font-medium text-slate-900">{m.from}:</span> {m.text}
                  </p>
                ))}
              </div>
              <button
                onClick={() => navigate(`/student/scholarships/${ar.scholarshipId?._id || ar.scholarshipId}`)}
                className="mt-4 text-sm font-semibold text-teal-600 hover:underline"
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

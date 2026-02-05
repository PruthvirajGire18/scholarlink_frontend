import { useEffect, useState } from "react";
import { getAuditLogs } from "../../services/adminService";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actorId, setActorId] = useState("");
  const [actionType, setActionType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (actorId) params.actorId = actorId;
      if (actionType) params.actionType = actionType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const data = await getAuditLogs(params);
      setLogs(data);
    } catch {
      setError("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Audit logs</h2>
      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="card flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Actor ID</label>
          <input type="text" value={actorId} onChange={(e) => setActorId(e.target.value)} placeholder="User ID" className="input-base w-40" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Action type</label>
          <input type="text" value={actionType} onChange={(e) => setActionType(e.target.value)} placeholder="e.g. CREATE_MODERATOR" className="input-base w-48" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">From date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-base w-40" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">To date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-base w-40" />
        </div>
        <button onClick={fetchLogs} className="btn-primary self-end">Apply filters</button>
      </div>

      {loading && <div className="flex justify-center py-12"><div className="loading-dots"><span /><span /><span /></div></div>}

      {!loading && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Time</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Actor</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Action</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Entity</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Entity ID</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-slate-100 last:border-0">
                    <td className="p-3 text-sm text-slate-600">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}</td>
                    <td className="p-3">{log.actorId?.name ?? log.actorId ?? "—"} <span className="text-slate-400">({log.actorRole})</span></td>
                    <td className="p-3 font-mono text-sm">{log.actionType}</td>
                    <td className="p-3">{log.entityType}</td>
                    <td className="p-3 truncate max-w-[140px] text-sm text-slate-500">{log.entityId?.toString?.() ?? String(log.entityId)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {logs.length === 0 && <p className="p-6 text-center text-slate-500">No audit logs match the filters.</p>}
        </div>
      )}
    </div>
  );
}

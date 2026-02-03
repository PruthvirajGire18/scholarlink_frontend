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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Audit Log Viewer</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="bg-white p-4 rounded shadow flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Actor ID</label>
          <input
            type="text"
            value={actorId}
            onChange={(e) => setActorId(e.target.value)}
            placeholder="User ID"
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Action type</label>
          <input
            type="text"
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            placeholder="e.g. CREATE_MODERATOR"
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">From date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={fetchLogs}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Apply filters
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 text-left">Time</th>
                <th className="p-2 text-left">Actor</th>
                <th className="p-2 text-left">Action</th>
                <th className="p-2 text-left">Entity</th>
                <th className="p-2 text-left">Entity ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b">
                  <td className="p-2 text-sm text-gray-600">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                  </td>
                  <td className="p-2">
                    {log.actorId?.name ?? log.actorId ?? "-"} ({log.actorRole})
                  </td>
                  <td className="p-2 font-mono text-sm">{log.actionType}</td>
                  <td className="p-2">{log.entityType}</td>
                  <td className="p-2 text-sm truncate max-w-[120px]">
                    {log.entityId?.toString?.() ?? String(log.entityId)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <p className="p-4 text-gray-500">No audit logs match the filters.</p>
          )}
        </div>
      )}
    </div>
  );
}

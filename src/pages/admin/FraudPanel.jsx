import { useEffect, useState } from "react";
import { getFraudAlerts, markFraudAlertReviewed } from "../../services/adminService";

export default function FraudPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterResolved, setFilterResolved] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getFraudAlerts(filterResolved);
      setAlerts(data);
    } catch {
      setError("Failed to load fraud alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterResolved]);

  const handleMarkReviewed = async (id) => {
    try {
      await markFraudAlertReviewed(id);
      fetchAlerts();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to mark reviewed");
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Fraud monitoring</h2>
      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={filterResolved} onChange={(e) => setFilterResolved(e.target.checked)} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
        Show resolved only
      </label>

      {loading && <div className="flex justify-center py-12"><div className="loading-dots"><span /><span /><span /></div></div>}

      {!loading && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Severity</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Signal</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Entity</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Detected</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a._id} className="border-b border-slate-100 last:border-0">
                    <td className="p-3">
                      <span className={a.severity === "HIGH" ? "badge-danger" : a.severity === "MEDIUM" ? "badge-warning" : "badge-neutral"}>{a.severity}</span>
                    </td>
                    <td className="p-3 font-mono text-sm">{a.signalType}</td>
                    <td className="p-3 text-sm">{a.entityType} {a.entityId?.toString?.()?.slice(-6)}</td>
                    <td className="p-3 text-sm text-slate-600">{a.detectedAt ? new Date(a.detectedAt).toLocaleString() : "—"}</td>
                    <td className="p-3">{a.isResolved ? <span className="badge-success">Resolved</span> : <span className="badge-warning">Open</span>}</td>
                    <td className="p-3">
                      {!a.isResolved && (
                        <button onClick={() => handleMarkReviewed(a._id)} className="btn-secondary py-1.5 text-sm">Mark reviewed</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {alerts.length === 0 && <p className="p-6 text-center text-slate-500">No fraud alerts.</p>}
        </div>
      )}
    </div>
  );
}

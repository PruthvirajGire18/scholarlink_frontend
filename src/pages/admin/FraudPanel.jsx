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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Fraud Monitoring Panel</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filterResolved}
            onChange={(e) => setFilterResolved(e.target.checked)}
          />
          Show resolved only
        </label>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 text-left">Severity</th>
                <th className="p-2 text-left">Signal</th>
                <th className="p-2 text-left">Entity</th>
                <th className="p-2 text-left">Detected</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a._id} className="border-b">
                  <td className="p-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        a.severity === "HIGH"
                          ? "bg-red-100 text-red-800"
                          : a.severity === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {a.severity}
                    </span>
                  </td>
                  <td className="p-2 font-mono text-sm">{a.signalType}</td>
                  <td className="p-2 text-sm">
                    {a.entityType} {a.entityId?.toString?.()?.slice(-6)}
                  </td>
                  <td className="p-2 text-sm text-gray-600">
                    {a.detectedAt ? new Date(a.detectedAt).toLocaleString() : "-"}
                  </td>
                  <td className="p-2">
                    {a.isResolved ? (
                      <span className="text-green-600">Resolved</span>
                    ) : (
                      <span className="text-amber-600">Open</span>
                    )}
                  </td>
                  <td className="p-2">
                    {!a.isResolved && (
                      <button
                        onClick={() => handleMarkReviewed(a._id)}
                        className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                      >
                        Mark reviewed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {alerts.length === 0 && (
            <p className="p-4 text-gray-500">No fraud alerts.</p>
          )}
        </div>
      )}
    </div>
  );
}

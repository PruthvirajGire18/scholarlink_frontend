import { useEffect, useMemo, useState } from "react";
import { getIngestionRuns, getIngestionStatus, runIngestionNow } from "../../services/adminService";

const fmtDateTime = (value) => (value ? new Date(value).toLocaleString("en-IN") : "N/A");

const fmtDuration = (ms) => {
  const value = Number(ms || 0);
  if (!value) return "0s";
  if (value < 1000) return `${value}ms`;
  const seconds = Math.round(value / 1000);
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return rem ? `${mins}m ${rem}s` : `${mins}m`;
};

export default function IngestionPage() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [statusData, setStatusData] = useState(null);
  const [runs, setRuns] = useState([]);

  const latestRun = statusData?.latestRun || null;

  const load = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError("");

    try {
      const [statusResponse, runsResponse] = await Promise.all([getIngestionStatus(), getIngestionRuns(25)]);
      setStatusData(statusResponse);
      setRuns(Array.isArray(runsResponse) ? runsResponse : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load ingestion status");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      load({ silent: true }).catch(() => {});
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const runNow = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await runIngestionNow();
      if (response?.accepted === false) {
        setNotice(response?.message || "A run is already in progress.");
      } else {
        setNotice("Ingestion run started.");
      }
      await load({ silent: true });
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to start ingestion run");
    } finally {
      setBusy(false);
    }
  };

  const runStateLabel = useMemo(() => {
    if (statusData?.isRunning) return "Running";
    if (!latestRun) return "Never run";
    return latestRun.status;
  }, [latestRun, statusData?.isRunning]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="card text-center py-10">Loading ingestion dashboard...</div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Scholarship Ingestion</h1>
            <p className="text-sm text-slate-600">Fetch, normalize, dedupe and upsert scholarships into DB.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" disabled={busy} onClick={() => load()}>
              Refresh
            </button>
            <button className="btn-primary" disabled={busy || statusData?.isRunning} onClick={runNow}>
              {statusData?.isRunning ? "Run in progress" : "Run now"}
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <article className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Current state</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{runStateLabel}</p>
          </article>
          <article className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Latest trigger</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{latestRun?.trigger || "N/A"}</p>
          </article>
          <article className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Inserted / Updated</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {latestRun ? `${latestRun?.totals?.inserted || 0} / ${latestRun?.totals?.updated || 0}` : "0 / 0"}
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Finished at</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{fmtDateTime(latestRun?.finishedAt)}</p>
          </article>
        </div>

        {latestRun && (
          <div className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
            <p>
              Fetched: <b>{latestRun?.totals?.fetched || 0}</b> | Normalized:{" "}
              <b>{latestRun?.totals?.normalized || 0}</b> | Skipped: <b>{latestRun?.totals?.skipped || 0}</b>
            </p>
            <p>
              Started: <b>{fmtDateTime(latestRun?.startedAt)}</b> | Duration:{" "}
              <b>{fmtDuration(latestRun?.durationMs)}</b>
            </p>
            {latestRun?.errorMessage && (
              <p className="mt-1 text-red-700">
                Error: <b>{latestRun.errorMessage}</b>
              </p>
            )}
          </div>
        )}

        {latestRun?.sourceSummaries?.length > 0 && (
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Latest Source-wise Summary</p>
            <div className="space-y-2 text-sm">
              {latestRun.sourceSummaries.map((s, idx) => (
                <div key={`${s.name}-${idx}`} className="rounded border border-slate-200 p-2">
                  <p className="font-medium text-slate-900">
                    {s.name} <span className="text-xs text-slate-500">({s.adapter || "n/a"})</span>
                  </p>
                  <p className="text-slate-600 break-all">{s.url}</p>
                  <p className="text-slate-700">
                    Fetched: <b>{s.fetched || 0}</b> | Normalized: <b>{s.normalized || 0}</b> | Inserted:{" "}
                    <b>{s.inserted || 0}</b> | Updated: <b>{s.updated || 0}</b> | Skipped: <b>{s.skipped || 0}</b>
                  </p>
                  {Array.isArray(s.errors) && s.errors.length > 0 && (
                    <div className="mt-1 rounded bg-red-50 px-2 py-1 text-red-700">
                      {s.errors.slice(0, 3).map((msg, i) => (
                        <p key={i}>{msg}</p>
                      ))}
                      {s.errors.length > 3 && <p>+ {s.errors.length - 3} more errors</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-slate-900">Recent Runs</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="p-3 text-left text-sm font-semibold text-slate-700">Started</th>
                <th className="p-3 text-left text-sm font-semibold text-slate-700">Trigger</th>
                <th className="p-3 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="p-3 text-left text-sm font-semibold text-slate-700">Fetched</th>
                <th className="p-3 text-left text-sm font-semibold text-slate-700">Normalized</th>
                <th className="p-3 text-left text-sm font-semibold text-slate-700">Inserted</th>
                <th className="p-3 text-left text-sm font-semibold text-slate-700">Updated</th>
                <th className="p-3 text-left text-sm font-semibold text-slate-700">Skipped</th>
                <th className="p-3 text-left text-sm font-semibold text-slate-700">Duration</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run._id} className="border-b border-slate-100 last:border-0">
                  <td className="p-3 text-sm text-slate-700">{fmtDateTime(run.startedAt)}</td>
                  <td className="p-3 text-sm text-slate-700">{run.trigger}</td>
                  <td className="p-3 text-sm font-semibold text-slate-900">{run.status}</td>
                  <td className="p-3 text-sm text-slate-700">{run?.totals?.fetched || 0}</td>
                  <td className="p-3 text-sm text-slate-700">{run?.totals?.normalized || 0}</td>
                  <td className="p-3 text-sm text-slate-700">{run?.totals?.inserted || 0}</td>
                  <td className="p-3 text-sm text-slate-700">{run?.totals?.updated || 0}</td>
                  <td className="p-3 text-sm text-slate-700">{run?.totals?.skipped || 0}</td>
                  <td className="p-3 text-sm text-slate-700">{fmtDuration(run.durationMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {runs.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No ingestion runs found.</p>}
        </div>
      </section>
    </div>
  );
}

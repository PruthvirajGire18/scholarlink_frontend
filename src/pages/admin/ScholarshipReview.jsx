import { useEffect, useMemo, useState } from "react";
import {
  getPendingScholarships,
  getScholarshipFeedback,
  reviewScholarship
} from "../../services/adminService";

const PROVIDER_TYPES = ["GOVERNMENT", "NGO", "CSR", "PRIVATE"];
const APPLICATION_MODES = ["ONLINE", "OFFLINE", "BOTH"];

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "-");
const formatDateTime = (value) => (value ? new Date(value).toLocaleString("en-IN") : "-");

const parseList = (value) =>
  String(value || "")
    .split(/\n|,|;|\|/g)
    .map((item) => item.trim())
    .filter(Boolean);

const listToText = (value) => (Array.isArray(value) ? value.filter(Boolean).join("\n") : "");
const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

function buildEnrichmentForm(scholarship) {
  return {
    description: scholarship?.description || "",
    benefits: scholarship?.benefits || "",
    providerType: scholarship?.provider?.type || "GOVERNMENT",
    providerName: scholarship?.provider?.name || "",
    providerWebsite: scholarship?.provider?.website || "",
    amount: scholarship?.amount ?? "",
    deadline: toDateInput(scholarship?.deadline),
    eligibilitySummary: scholarship?.eligibility?.summary || "",
    documentsRequired: listToText(scholarship?.documentsRequired),
    commonMistakes: listToText(scholarship?.commonMistakes),
    applicationMode: scholarship?.applicationProcess?.mode || "ONLINE",
    applyLink: scholarship?.applicationProcess?.applyLink || "",
    applicationSteps: listToText(scholarship?.applicationProcess?.steps),
    tags: listToText(scholarship?.tags)
  };
}

function buildEnrichmentPayload(form) {
  return {
    description: form.description,
    benefits: form.benefits,
    amount: form.amount,
    deadline: form.deadline,
    tags: parseList(form.tags),
    provider: {
      type: form.providerType,
      name: form.providerName,
      website: form.providerWebsite
    },
    eligibility: {
      summary: form.eligibilitySummary
    },
    documentsRequired: parseList(form.documentsRequired),
    commonMistakes: parseList(form.commonMistakes),
    applicationProcess: {
      mode: form.applicationMode,
      applyLink: form.applyLink,
      steps: parseList(form.applicationSteps)
    }
  };
}

function groupFeedbackByScholarship(list = []) {
  const grouped = new Map();

  list.forEach((item) => {
    const scholarship = item?.scholarshipId;
    const scholarshipId = scholarship?._id;
    if (!scholarshipId) return;

    if (!grouped.has(scholarshipId)) {
      grouped.set(scholarshipId, {
        scholarship,
        items: [],
        missingFields: new Set(),
        latestReportedAt: item.createdAt || null,
        scoreTotal: 0
      });
    }

    const bucket = grouped.get(scholarshipId);
    bucket.items.push(item);
    (item.missingFields || []).forEach((field) => {
      const trimmed = String(field || "").trim();
      if (trimmed) bucket.missingFields.add(trimmed);
    });

    if (!bucket.latestReportedAt || new Date(item.createdAt) > new Date(bucket.latestReportedAt)) {
      bucket.latestReportedAt = item.createdAt;
    }

    bucket.scoreTotal += Number(item.dataCompletenessScore || 0);
  });

  return Array.from(grouped.values())
    .map((group) => ({
      scholarship: group.scholarship,
      items: group.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      missingFields: Array.from(group.missingFields),
      latestReportedAt: group.latestReportedAt,
      avgScore: group.items.length ? Math.round(group.scoreTotal / group.items.length) : 0
    }))
    .sort((a, b) => new Date(b.latestReportedAt || 0) - new Date(a.latestReportedAt || 0));
}

export default function ScholarshipReview() {
  const [list, setList] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [remarksMap, setRemarksMap] = useState({});
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState([]);
  const [enrichmentMap, setEnrichmentMap] = useState({});

  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await getPendingScholarships();
      setList(data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load pending scholarships");
    } finally {
      setLoading(false);
    }
  };

  const loadFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const data = await getScholarshipFeedback("OPEN", 200);
      setFeedbackList(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load scholarship feedback");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const loadQueues = async () => {
    await Promise.all([loadPending(), loadFeedback()]);
  };

  useEffect(() => {
    loadQueues();
  }, []);

  const feedbackGroups = useMemo(() => groupFeedbackByScholarship(feedbackList), [feedbackList]);

  const openScholarship = (scholarship, feedbackContext = []) => {
    setSelectedScholarship(scholarship);
    setSelectedFeedback(feedbackContext);
    setEnrichmentMap((prev) => {
      if (prev[scholarship._id]) return prev;
      return {
        ...prev,
        [scholarship._id]: buildEnrichmentForm(scholarship)
      };
    });
  };

  const selectedId = selectedScholarship?._id || "";
  const selectedRemarks = selectedId ? remarksMap[selectedId] || "" : "";
  const selectedFeedbackIds = useMemo(
    () => selectedFeedback.map((item) => item?._id).filter(Boolean),
    [selectedFeedback]
  );

  const selectedForm = useMemo(() => {
    if (!selectedId || !selectedScholarship) return null;
    return enrichmentMap[selectedId] || buildEnrichmentForm(selectedScholarship);
  }, [enrichmentMap, selectedId, selectedScholarship]);

  const updateSelectedForm = (patch) => {
    if (!selectedId || !selectedScholarship) return;
    setEnrichmentMap((prev) => ({
      ...prev,
      [selectedId]: {
        ...(prev[selectedId] || buildEnrichmentForm(selectedScholarship)),
        ...patch
      }
    }));
  };

  const actOnScholarship = async (id, action) => {
    const remarks = remarksMap[id] || "";
    const status = action === "APPROVE" ? "APPROVED" : "REJECTED";
    const finalRemarks = action === "SEND_BACK" ? `Sent back for corrections. ${remarks}`.trim() : remarks;
    const enrichment = selectedForm && selectedId === id ? buildEnrichmentPayload(selectedForm) : null;
    const feedbackIds = selectedId === id ? selectedFeedbackIds : [];

    setBusy(true);
    setError("");
    try {
      await reviewScholarship(id, status, finalRemarks, enrichment, feedbackIds);
      await loadQueues();
      setSelectedScholarship(null);
      setSelectedFeedback([]);
      setNotice(
        action === "APPROVE"
          ? feedbackIds.length > 0
            ? "Scholarship updated, approved, and linked feedback resolved."
            : "Scholarship enriched and approved."
          : action === "REJECT"
            ? "Scholarship rejected."
            : "Scholarship sent back to moderator for correction."
      );
      setRemarksMap((prev) => ({ ...prev, [id]: "" }));
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update scholarship review");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-container space-y-6">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

      <section>
        <h1 className="text-2xl font-bold text-slate-900">Scholarship Review Queue</h1>
        <p className="mt-1 text-sm text-slate-600">
          Auto-fetched scholarships are student-visible; use feedback queue to fix missing data and save.
        </p>
      </section>

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Student Data Feedback Queue</h2>
          <span className="badge badge-warning">{feedbackGroups.length} scholarships</span>
        </div>

        {feedbackLoading && <div className="mt-4 rounded-lg border border-slate-200 p-4 text-sm">Loading feedback queue...</div>}
        {!feedbackLoading && feedbackGroups.length === 0 && (
          <div className="mt-4 rounded-lg border border-slate-200 p-4 text-sm text-slate-600">
            No open data feedback from students.
          </div>
        )}

        {!feedbackLoading && feedbackGroups.length > 0 && (
          <div className="mt-4 grid gap-3">
            {feedbackGroups.map((group) => (
              <article key={group.scholarship._id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{group.scholarship.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Provider: {group.scholarship.provider?.name || "-"} | Amount: INR {Number(group.scholarship.amount || 0).toLocaleString("en-IN")}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {group.items.length} feedback item(s) | Avg reported completeness {group.avgScore}% | Last report {formatDateTime(group.latestReportedAt)}
                    </p>
                  </div>
                  <button
                    className="btn-secondary"
                    onClick={() => openScholarship(group.scholarship, group.items)}
                  >
                    Review scholarship
                  </button>
                </div>
                {group.missingFields.length > 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    Missing fields reported: {group.missingFields.join(" | ")}
                  </p>
                )}
                <p className="mt-2 text-sm text-slate-700">{group.items[0]?.message || "No message"}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Pending Moderation Queue</h2>
      </section>

      {loading && <div className="card text-center py-8">Loading pending scholarships...</div>}
      {!loading && list.length === 0 && <div className="empty-state">No pending scholarships.</div>}

      {!loading &&
        list.map((s) => (
          <article key={s._id} className="card">
            <button
              type="button"
              onClick={() => openScholarship(s, [])}
              className="w-full text-left"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{s.title}</h2>
                  <p className="text-sm text-slate-600 line-clamp-2">{s.description}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    By {s.createdBy?.name || "Moderator"} | Deadline {formatDate(s.deadline)}
                  </p>
                </div>
                <span className="badge badge-warning">PENDING</span>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Provider</p>
                  <p className="text-sm font-medium text-slate-900">{s.provider?.type} | {s.provider?.name || "-"}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Amount</p>
                  <p className="text-sm font-medium text-slate-900">INR {Number(s.amount || 0).toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Official link</p>
                  <p className={`text-sm font-medium ${s.applicationProcess?.applyLink ? "text-emerald-700" : "text-red-600"}`}>
                    {s.applicationProcess?.applyLink ? "Available" : "Missing"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm font-semibold text-teal-700">Click to enrich and review</p>
            </button>
          </article>
        ))}

      {selectedScholarship && selectedForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Detailed Review + Enrichment</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">{selectedScholarship.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Submitted by {selectedScholarship.createdBy?.name || "Moderator"} on {formatDateTime(selectedScholarship.createdAt)}
                </p>
              </div>
              <button className="btn-secondary" onClick={() => setSelectedScholarship(null)} disabled={busy}>
                Close
              </button>
            </div>

            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Before approval, fill at least: official apply link, documents, common mistakes, eligibility details, and application steps.
            </div>

            {selectedFeedback.length > 0 && (
              <section className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Linked student feedback ({selectedFeedback.length})
                </h3>
                <div className="mt-2 space-y-2">
                  {selectedFeedback.map((item) => (
                    <article key={item._id} className="rounded-lg border border-blue-100 bg-white p-3">
                      <p className="text-xs text-slate-500">
                        {item.studentId?.name || "Student"} | {item.studentId?.email || "-"} | {formatDateTime(item.createdAt)}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{item.message || "No message"}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Reported completeness: {Number(item.dataCompletenessScore || 0)}%
                      </p>
                      {(item.missingFields || []).length > 0 && (
                        <p className="mt-1 text-xs text-amber-700">
                          Missing fields: {(item.missingFields || []).join(" | ")}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-4 rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Description & Benefits</h3>
              <textarea
                className="input-base mt-2 min-h-[100px] w-full resize-y"
                value={selectedForm.description}
                onChange={(e) => updateSelectedForm({ description: e.target.value })}
                placeholder="Scholarship description"
              />
              <textarea
                className="input-base mt-2 min-h-[70px] w-full resize-y"
                value={selectedForm.benefits}
                onChange={(e) => updateSelectedForm({ benefits: e.target.value })}
                placeholder="Benefits"
              />
            </section>

            <section className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Provider</h3>
                <select
                  className="input-base mt-2"
                  value={selectedForm.providerType}
                  onChange={(e) => updateSelectedForm({ providerType: e.target.value })}
                >
                  {PROVIDER_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <input
                  className="input-base mt-2"
                  value={selectedForm.providerName}
                  onChange={(e) => updateSelectedForm({ providerName: e.target.value })}
                  placeholder="Provider name"
                />
                <input
                  className="input-base mt-2"
                  value={selectedForm.providerWebsite}
                  onChange={(e) => updateSelectedForm({ providerWebsite: e.target.value })}
                  placeholder="Provider website"
                />
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Amount & Deadline</h3>
                <input
                  className="input-base mt-2"
                  type="number"
                  value={selectedForm.amount}
                  onChange={(e) => updateSelectedForm({ amount: e.target.value })}
                  placeholder="Amount"
                />
                <input
                  className="input-base mt-2"
                  type="date"
                  value={selectedForm.deadline}
                  onChange={(e) => updateSelectedForm({ deadline: e.target.value })}
                />
                <textarea
                  className="input-base mt-2 min-h-[70px] w-full resize-y"
                  value={selectedForm.tags}
                  onChange={(e) => updateSelectedForm({ tags: e.target.value })}
                  placeholder="Tags (comma/new line separated)"
                />
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Official Application</h3>
                <select
                  className="input-base mt-2"
                  value={selectedForm.applicationMode}
                  onChange={(e) => updateSelectedForm({ applicationMode: e.target.value })}
                >
                  {APPLICATION_MODES.map((mode) => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
                <input
                  className="input-base mt-2"
                  value={selectedForm.applyLink}
                  onChange={(e) => updateSelectedForm({ applyLink: e.target.value })}
                  placeholder="Official apply link (http/https)"
                />
                {selectedForm.applyLink && (
                  <a
                    href={selectedForm.applyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm font-semibold text-teal-700 hover:underline"
                  >
                    Open current link
                  </a>
                )}
              </div>
            </section>

            <section className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Eligibility</h3>
                <textarea
                  className="input-base mt-2 min-h-[160px] w-full resize-y"
                  value={selectedForm.eligibilitySummary}
                  onChange={(e) => updateSelectedForm({ eligibilitySummary: e.target.value })}
                  placeholder="Eligibility details paragraph (who can apply, conditions, income/category/marks rules, etc.)"
                />
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Guidance Content</h3>
                <textarea
                  className="input-base mt-2 min-h-[90px] w-full resize-y"
                  value={selectedForm.documentsRequired}
                  onChange={(e) => updateSelectedForm({ documentsRequired: e.target.value })}
                  placeholder="Documents required"
                />
                <textarea
                  className="input-base mt-2 min-h-[90px] w-full resize-y"
                  value={selectedForm.commonMistakes}
                  onChange={(e) => updateSelectedForm({ commonMistakes: e.target.value })}
                  placeholder="Common mistakes"
                />
                <textarea
                  className="input-base mt-2 min-h-[90px] w-full resize-y"
                  value={selectedForm.applicationSteps}
                  onChange={(e) => updateSelectedForm({ applicationSteps: e.target.value })}
                  placeholder="Step-by-step application process"
                />
              </div>
            </section>

            <section className="mt-4 rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Source Metadata</h3>
              <p className="mt-2 break-all text-sm text-slate-700">
                <span className="font-medium text-slate-900">Provider:</span> {selectedScholarship.source?.provider || "-"}
              </p>
              <p className="mt-1 break-all text-sm text-slate-700">
                <span className="font-medium text-slate-900">Adapter:</span> {selectedScholarship.source?.adapter || "-"}
              </p>
              <p className="mt-1 break-all text-sm text-slate-700">
                <span className="font-medium text-slate-900">Source URL:</span> {selectedScholarship.source?.sourceUrl || "-"}
              </p>
            </section>

            <section className="mt-4">
              <textarea
                className="input-base min-h-[90px] w-full resize-y"
                placeholder="Review remarks (required for reject/send back)"
                value={selectedRemarks}
                onChange={(e) =>
                  setRemarksMap((prev) => ({
                    ...prev,
                    [selectedId]: e.target.value
                  }))
                }
              />
            </section>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="btn-primary !bg-emerald-600 hover:!bg-emerald-700"
                disabled={busy}
                onClick={() => actOnScholarship(selectedId, "APPROVE")}
              >
                {selectedFeedbackIds.length > 0 ? "Save + Approve + Resolve Feedback" : "Save Enrichment + Approve"}
              </button>
              <button
                className="btn-secondary"
                disabled={busy || !selectedRemarks.trim()}
                onClick={() => actOnScholarship(selectedId, "SEND_BACK")}
              >
                Send back
              </button>
              <button
                className="btn-danger"
                disabled={busy || !selectedRemarks.trim()}
                onClick={() => actOnScholarship(selectedId, "REJECT")}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

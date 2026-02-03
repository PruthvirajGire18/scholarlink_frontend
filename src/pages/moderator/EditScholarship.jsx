import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMyScholarships, updateScholarship } from "../../services/moderatorService";

const emptyForm = {
  title: "",
  description: "",
  providerType: "GOVERNMENT",
  providerName: "",
  providerWebsite: "",
  amount: "",
  benefits: "",
  minMarks: "",
  maxIncome: "",
  gender: "ANY",
  educationLevel: "DIPLOMA",
  statesAllowed: "",
  documentsRequired: "",
  applicationMode: "ONLINE",
  applyLink: "",
  applicationSteps: "",
  deadline: ""
};

function fillFormFromScholarship(s) {
  return {
    title: s.title || "",
    description: s.description || "",
    providerType: s.provider?.type || "GOVERNMENT",
    providerName: s.provider?.name || "",
    providerWebsite: s.provider?.website || "",
    amount: s.amount ?? "",
    benefits: s.benefits || "",
    minMarks: s.eligibility?.minMarks ?? "",
    maxIncome: s.eligibility?.maxIncome ?? "",
    gender: s.eligibility?.gender || "ANY",
    educationLevel: s.eligibility?.educationLevel || "DIPLOMA",
    statesAllowed: Array.isArray(s.eligibility?.statesAllowed) ? s.eligibility.statesAllowed.join(", ") : "",
    documentsRequired: Array.isArray(s.documentsRequired) ? s.documentsRequired.join(", ") : "",
    applicationMode: s.applicationProcess?.mode || "ONLINE",
    applyLink: s.applicationProcess?.applyLink || "",
    applicationSteps: Array.isArray(s.applicationProcess?.steps) ? s.applicationProcess.steps.join("\n") : "",
    deadline: s.deadline ? new Date(s.deadline).toISOString().slice(0, 10) : ""
  };
}

export default function EditScholarship() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await getMyScholarships();
        const found = list.find((s) => s._id === id);
        setScholarship(found || null);
        if (found) setForm(fillFormFromScholarship(found));
      } catch {
        setScholarship(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async () => {
    if (!id || !form.title || !form.amount || !form.deadline) {
      alert("Title, Amount and Deadline are required");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        title: form.title,
        description: form.description,
        provider: {
          type: form.providerType,
          name: form.providerName || undefined,
          website: form.providerWebsite || undefined
        },
        amount: Number(form.amount),
        benefits: form.benefits || undefined,
        eligibility: {
          minMarks: form.minMarks || undefined,
          maxIncome: form.maxIncome || undefined,
          gender: form.gender,
          educationLevel: form.educationLevel,
          statesAllowed: form.statesAllowed ? form.statesAllowed.split(",").map((s) => s.trim()) : []
        },
        documentsRequired: form.documentsRequired ? form.documentsRequired.split(",").map((d) => d.trim()) : [],
        applicationProcess: {
          mode: form.applicationMode,
          applyLink: form.applyLink || undefined,
          steps: form.applicationSteps ? form.applicationSteps.split("\n") : []
        },
        deadline: form.deadline
      };
      await updateScholarship(id, payload);
      alert("Scholarship updated; resubmitted for review");
      navigate("/moderator/my-scholarships");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!scholarship)
    return (
      <div className="p-6">
        <p className="text-gray-500">Scholarship not found.</p>
        <button onClick={() => navigate("/moderator")} className="text-indigo-600 mt-2">
          ← Dashboard
        </button>
      </div>
    );
  if (scholarship.status === "APPROVED")
    return (
      <div className="p-6">
        <p className="text-gray-500">Approved scholarships cannot be edited.</p>
        <button onClick={() => navigate("/moderator/my-scholarships")} className="text-indigo-600 mt-2">
          ← My scholarships
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button onClick={() => navigate("/moderator/my-scholarships")} className="text-indigo-600 mb-4">
        ← My scholarships
      </button>
      <div className="bg-white p-6 rounded shadow max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Edit scholarship (resubmit for review)</h2>
        <input
          type="text"
          placeholder="Scholarship Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 w-full mb-4"
        />
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          className="border p-2 w-full mb-4"
        />
        <div className="flex gap-2">
          <button
            disabled={submitting}
            onClick={handleSubmit}
            className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {submitting ? "Updating..." : "Update & Re-submit"}
          </button>
          <button onClick={() => navigate("/moderator/my-scholarships")} className="bg-gray-200 px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

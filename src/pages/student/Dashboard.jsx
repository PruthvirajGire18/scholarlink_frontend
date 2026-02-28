import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  discoverScholarships,
  getMyApplications,
  getMyNotifications,
  getMyProfile,
  getStudentDashboard,
  markNotificationAsRead,
  saveMyProfile,
  submitScholarshipFeedback,
  startApplication,
  submitApplication,
  updateMyApplicationStatus,
  updateApplicationStep,
  uploadApplicationDocument,
  uploadProfileDocument
} from "../../services/studentService";
import AutoText from "../../components/i18n/AutoText";

const CATEGORY_OPTIONS = ["OPEN", "OBC", "SC", "ST", "VJNT", "EWS", "SEBC"];
const EDUCATION_LEVEL_OPTIONS = ["DIPLOMA", "UG", "PG", "PHD"];
const MARITAL_STATUS_OPTIONS = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "OTHER"];
const PROFILE_DOCUMENT_OPTIONS = [
  { key: "aadhaar", label: "Aadhaar Card" },
  { key: "incomeCertificate", label: "Income Certificate" },
  { key: "domicileCertificate", label: "Domicile Certificate" },
  { key: "marksheet", label: "Latest Marksheet" },
  { key: "bankPassbook", label: "Bank Passbook" },
  { key: "admissionLetter", label: "Admission Letter" },
  { key: "feeReceipt", label: "Fee Receipt" },
  { key: "bonafideCertificate", label: "Bonafide Certificate" },
  { key: "casteCertificate", label: "Caste Certificate" },
  { key: "casteValidityCertificate", label: "Caste Validity Certificate" },
  { key: "nonCreamyLayerCertificate", label: "Non-Creamy Layer Certificate" },
  { key: "disabilityCertificate", label: "Disability Certificate" },
  { key: "minorityDeclaration", label: "Minority Declaration" },
  { key: "rationCard", label: "Ration Card" },
  { key: "transferCertificate", label: "Transfer/Leaving Certificate" },
  { key: "gapCertificate", label: "Gap Certificate" },
  { key: "selfDeclaration", label: "Self Declaration / Undertaking" }
];

const emptyProfileDocument = () => ({
  isUploaded: false,
  fileUrl: "",
  cloudinaryPublicId: "",
  fileName: "",
  mimeType: "",
  sizeBytes: 0,
  uploadedAt: null,
  source: "PROFILE_UPLOAD"
});

const normalizeProfileDocument = (value) => {
  if (value === true) {
    return {
      ...emptyProfileDocument(),
      isUploaded: true
    };
  }
  if (!value || typeof value !== "object") {
    return emptyProfileDocument();
  }
  return {
    ...emptyProfileDocument(),
    ...value,
    isUploaded: value.isUploaded === true || Boolean(String(value.fileUrl || "").trim())
  };
};

const profileSeed = {
  gender: "",
  mobile: "",
  dateOfBirth: "",
  category: "OPEN",
  annualIncome: "",
  personal: {
    firstName: "",
    middleName: "",
    lastName: "",
    fatherName: "",
    motherName: "",
    maritalStatus: "SINGLE",
    religion: "",
    caste: "",
    subCaste: "",
    nationality: "Indian",
    aadhaarNumber: "",
    panNumber: "",
    abcId: "",
    domicileState: "Maharashtra"
  },
  address: {
    state: "",
    district: "",
    taluka: "",
    city: "",
    village: "",
    pincode: "",
    line1: "",
    line2: "",
    correspondenceSameAsPermanent: true
  },
  family: {
    guardianName: "",
    fatherOccupation: "",
    motherOccupation: "",
    familySize: ""
  },
  education: {
    educationLevel: "DIPLOMA",
    course: "",
    branch: "",
    institute: "",
    instituteCode: "",
    university: "",
    currentYear: "",
    currentSemester: "",
    admissionYear: "",
    admissionType: "",
    previousExamBoard: "",
    previousPassingYear: "",
    previousPercentage: "",
    percentage: ""
  },
  bankDetails: {
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    isAadhaarSeeded: false
  },
  financial: {
    hasDisability: false,
    isFirstGenerationLearner: false,
    guardianOccupation: "",
    incomeCertificateNumber: "",
    bplCardHolder: false,
    isFarmerChild: false,
    familyIncomeSource: ""
  },
  social: {
    minorityStatus: false,
    minorityType: "",
    isOrphan: false,
    isHosteller: false
  },
  documents: PROFILE_DOCUMENT_OPTIONS.reduce((acc, item) => {
    acc[item.key] = emptyProfileDocument();
    return acc;
  }, {})
};

const statusClass = {
  IN_PROGRESS: "badge-warning",
  APPLIED: "badge-neutral",
  PENDING: "badge-neutral",
  APPROVED: "badge-success",
  REJECTED: "badge-danger"
};

const fileOk = (file) =>
  file &&
  ["application/pdf", "image/jpeg", "image/png"].includes(file.type) &&
  file.size <= 5 * 1024 * 1024;
const isExternalApplyLink = (value) => /^https?:\/\//i.test(String(value || "").trim());

const buildEligibilityText = (scholarship) => {
  const e = scholarship?.eligibility || {};
  const summary = String(e.summary || "").trim();
  if (summary) return summary;
  const parts = [];
  if (e.minMarks != null) parts.push(`Minimum marks: ${e.minMarks}%`);
  if (e.maxIncome != null) parts.push(`Max income: INR ${Number(e.maxIncome).toLocaleString("en-IN")}`);
  if (Array.isArray(e.categories) && e.categories.length > 0) parts.push(`Categories: ${e.categories.join(", ")}`);
  if (e.gender && e.gender !== "ANY") parts.push(`Gender: ${e.gender}`);
  if (Array.isArray(e.statesAllowed) && e.statesAllowed.length > 0) parts.push(`States: ${e.statesAllowed.join(", ")}`);
  if (e.educationLevel) parts.push(`Education: ${e.educationLevel}`);
  return parts.join(". ");
};

const getView = (path) => {
  if (path.startsWith("/student/profile")) return "PROFILE";
  if (path.startsWith("/student/applications")) return "APPLICATIONS";
  if (path.startsWith("/student/notifications")) return "NOTIFICATIONS";
  return "DASHBOARD";
};

const mapProfile = (p) =>
  !p
    ? profileSeed
    : {
        gender: p.gender || "",
        mobile: p.mobile || "",
        dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().slice(0, 10) : "",
        category: p.category || "OPEN",
        annualIncome: p.annualIncome || "",
        personal: {
          firstName: p.personal?.firstName || "",
          middleName: p.personal?.middleName || "",
          lastName: p.personal?.lastName || "",
          fatherName: p.personal?.fatherName || "",
          motherName: p.personal?.motherName || "",
          maritalStatus: p.personal?.maritalStatus || "SINGLE",
          religion: p.personal?.religion || "",
          caste: p.personal?.caste || "",
          subCaste: p.personal?.subCaste || "",
          nationality: p.personal?.nationality || "Indian",
          aadhaarNumber: p.personal?.aadhaarNumber || "",
          panNumber: p.personal?.panNumber || "",
          abcId: p.personal?.abcId || "",
          domicileState: p.personal?.domicileState || "Maharashtra"
        },
        address: {
          state: p.address?.state || "",
          district: p.address?.district || "",
          taluka: p.address?.taluka || "",
          city: p.address?.city || "",
          village: p.address?.village || "",
          pincode: p.address?.pincode || "",
          line1: p.address?.line1 || "",
          line2: p.address?.line2 || "",
          correspondenceSameAsPermanent: p.address?.correspondenceSameAsPermanent ?? true
        },
        family: {
          guardianName: p.family?.guardianName || "",
          fatherOccupation: p.family?.fatherOccupation || "",
          motherOccupation: p.family?.motherOccupation || "",
          familySize: p.family?.familySize || ""
        },
        education: {
          educationLevel: p.education?.educationLevel || "DIPLOMA",
          course: p.education?.course || "",
          branch: p.education?.branch || "",
          institute: p.education?.institute || "",
          instituteCode: p.education?.instituteCode || "",
          university: p.education?.university || "",
          currentYear: p.education?.currentYear || "",
          currentSemester: p.education?.currentSemester || "",
          admissionYear: p.education?.admissionYear || "",
          admissionType: p.education?.admissionType || "",
          previousExamBoard: p.education?.previousExamBoard || "",
          previousPassingYear: p.education?.previousPassingYear || "",
          previousPercentage: p.education?.previousPercentage || "",
          percentage: p.education?.percentage || ""
        },
        bankDetails: {
          accountHolderName: p.bankDetails?.accountHolderName || "",
          accountNumber: p.bankDetails?.accountNumber || "",
          ifscCode: p.bankDetails?.ifscCode || "",
          bankName: p.bankDetails?.bankName || "",
          branchName: p.bankDetails?.branchName || "",
          isAadhaarSeeded: p.bankDetails?.isAadhaarSeeded || false
        },
        financial: {
          hasDisability: p.financial?.hasDisability || false,
          isFirstGenerationLearner: p.financial?.isFirstGenerationLearner || false,
          guardianOccupation: p.financial?.guardianOccupation || "",
          incomeCertificateNumber: p.financial?.incomeCertificateNumber || "",
          bplCardHolder: p.financial?.bplCardHolder || false,
          isFarmerChild: p.financial?.isFarmerChild || false,
          familyIncomeSource: p.financial?.familyIncomeSource || ""
        },
        social: {
          minorityStatus: p.social?.minorityStatus || false,
          minorityType: p.social?.minorityType || "",
          isOrphan: p.social?.isOrphan || false,
          isHosteller: p.social?.isHosteller || false
        },
        documents: PROFILE_DOCUMENT_OPTIONS.reduce((acc, item) => {
          acc[item.key] = normalizeProfileDocument(p.documents?.[item.key]);
          return acc;
        }, {})
      };

const money = (n) => `INR ${(n || 0).toLocaleString("en-IN")}`;
const getCompleteness = (scholarship) => Number(scholarship?.dataCompleteness?.score || 0);
const getMissingFields = (scholarship) =>
  Array.isArray(scholarship?.dataCompleteness?.missingFields)
    ? scholarship.dataCompleteness.missingFields
    : [];

export default function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const view = getView(location.pathname);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(profileSeed);
  const [filters, setFilters] = useState({ search: "", providerType: "" });
  const [discover, setDiscover] = useState([]);
  const [apps, setApps] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeAppId, setActiveAppId] = useState(null);

  const activeApp = useMemo(() => apps.find((a) => a._id === activeAppId) || apps[0] || null, [apps, activeAppId]);
  const activeApplyLink = isExternalApplyLink(activeApp?.scholarshipId?.applicationProcess?.applyLink)
    ? activeApp.scholarshipId.applicationProcess.applyLink
    : "";
  const activeEligibilityText = buildEligibilityText(activeApp?.scholarshipId);

  const loadAll = async () => {
    const discoveryParams = { ...filters, eligibleOnly: true };
    const [dash, pf, dc, ap, nt] = await Promise.all([
      getStudentDashboard(),
      getMyProfile(),
      discoverScholarships(discoveryParams),
      getMyApplications(),
      getMyNotifications()
    ]);
    setDashboard(dash);
    setProfile(mapProfile(pf));
    setDiscover(dc);
    setApps(ap);
    setNotifications(nt);
    setActiveAppId((prev) => (prev && ap.some((a) => a._id === prev) ? prev : ap[0]?._id || null));
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await loadAll();
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const startApply = async (id) => {
    setBusy(true);
    setError("");
    try {
      const res = await startApplication(id);
      await loadAll();
      setNotice(res.message || "Application started");
      setActiveAppId(res.application?._id || null);
      navigate("/student/applications");
    } catch (e) {
      setError(e?.response?.data?.message || "Cannot start application");
    } finally {
      setBusy(false);
    }
  };

  const saveProfileNow = async () => {
    setBusy(true);
    setError("");
    try {
      const toNumberOrNull = (value) => {
        if (value === "" || value === null || value === undefined) return null;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      };

      await saveMyProfile({
        ...profile,
        annualIncome: toNumberOrNull(profile.annualIncome),
        family: {
          ...profile.family,
          familySize: toNumberOrNull(profile.family.familySize)
        },
        education: {
          ...profile.education,
          currentYear: toNumberOrNull(profile.education.currentYear),
          currentSemester: toNumberOrNull(profile.education.currentSemester),
          admissionYear: toNumberOrNull(profile.education.admissionYear),
          previousPassingYear: toNumberOrNull(profile.education.previousPassingYear),
          previousPercentage: toNumberOrNull(profile.education.previousPercentage),
          percentage: toNumberOrNull(profile.education.percentage)
        }
      });
      await loadAll();
      setNotice("Profile saved");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save profile");
    } finally {
      setBusy(false);
    }
  };

  const uploadProfileDocumentNow = async (documentType, file) => {
    if (!fileOk(file)) return setError("Only PDF/JPG/PNG up to 5MB are allowed.");
    if (!documentType) return;

    setBusy(true);
    setError("");
    try {
      const response = await uploadProfileDocument(documentType, file);
      if (response?.profile) {
        setProfile(mapProfile(response.profile));
      } else {
        const currentDoc = normalizeProfileDocument(profile.documents?.[documentType]);
        setProfile((prev) => ({
          ...prev,
          documents: {
            ...(prev.documents || {}),
            [documentType]: {
              ...currentDoc,
              isUploaded: true,
              fileName: file.name
            }
          }
        }));
      }
      await loadAll();
      setNotice(response?.message || "Profile document uploaded.");
    } catch (e) {
      setError(e?.response?.data?.message || "Profile document upload failed");
    } finally {
      setBusy(false);
    }
  };

  const toggleStep = async (appId, stepKey, done) => {
    setBusy(true);
    try {
      await updateApplicationStep(appId, stepKey, done);
      await loadAll();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update step");
    } finally {
      setBusy(false);
    }
  };

  const uploadDoc = async (appId, docType, file) => {
    if (!fileOk(file)) return setError("Only PDF/JPG/PNG up to 5MB are allowed.");
    setBusy(true);
    try {
      await uploadApplicationDocument(appId, docType, file);
      await loadAll();
      setNotice(`${docType} uploaded`);
    } catch (e) {
      setError(e?.response?.data?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const finalSubmit = async (appId) => {
    setBusy(true);
    try {
      await submitApplication(appId);
      await loadAll();
      setNotice("Marked as applied on official portal");
    } catch (e) {
      setError(e?.response?.data?.message || "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  const updateTrackedStatus = async (appId, status) => {
    if (!status) return;
    setBusy(true);
    setError("");
    try {
      await updateMyApplicationStatus(appId, { status });
      await loadAll();
      setNotice(`Status updated to ${status}`);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update status");
    } finally {
      setBusy(false);
    }
  };

  const runFilter = async () => {
    setBusy(true);
    setError("");
    try {
      setDiscover(await discoverScholarships({ ...filters, eligibleOnly: true }));
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to filter scholarships");
    } finally {
      setBusy(false);
    }
  };

  const submitDataFeedbackNow = async (scholarship) => {
    if (!scholarship?._id) return;
    const missingFields = getMissingFields(scholarship);
    const message =
      missingFields.length > 0
        ? `Student reported missing data: ${missingFields.join(", ")}.`
        : "Student reported scholarship data quality issue.";

    setBusy(true);
    setError("");
    try {
      const response = await submitScholarshipFeedback(scholarship._id, {
        message,
        missingFields
      });
      setNotice(response?.message || "Feedback sent to admin.");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to submit feedback");
    } finally {
      setBusy(false);
    }
  };

  const markRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(await getMyNotifications());
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to mark notification");
    }
  };

  if (loading) return <div className="page-container"><div className="card py-10 text-center">Loading...</div></div>;

  return (
    <div className="page-container space-y-6">
      <section className="glass-strip p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="page-heading">Student Workspace</h1>
            <p className="page-subheading">Manage profile, eligibility discovery, applications, and notifications from one dashboard.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-neutral">Profile: {dashboard?.profileCompletion || 0}%</span>
            <span className="badge badge-success">Eligible: {dashboard?.metrics?.eligibleScholarships || 0}</span>
            <span className="badge badge-warning">In progress: {dashboard?.metrics?.inProgressApplications || 0}</span>
          </div>
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

      {view === "DASHBOARD" && (
        <>
          <section className="grid gap-4 md:grid-cols-5">
            <article className="card border-teal-200/70 bg-gradient-to-br from-teal-50/70 to-white">
              <p className="text-sm text-slate-500">Profile</p>
              <p className="mt-2 text-3xl font-black text-teal-700">{dashboard?.profileCompletion || 0}%</p>
            </article>
            <article className="card border-cyan-200/70 bg-gradient-to-br from-cyan-50/70 to-white">
              <p className="text-sm text-slate-500">Eligible</p>
              <p className="mt-2 text-3xl font-black text-cyan-700">{dashboard?.metrics?.eligibleScholarships || 0}</p>
            </article>
            <article className="card border-indigo-200/70 bg-gradient-to-br from-indigo-50/70 to-white">
              <p className="text-sm text-slate-500">Matching Mode</p>
              <p className="mt-2 text-xl font-bold text-indigo-700">{dashboard?.matchingMode === "ELIGIBLE_ONLY" ? "Eligible Only" : "Complete Profile"}</p>
            </article>
            <article className="card border-amber-200/70 bg-gradient-to-br from-amber-50/70 to-white">
              <p className="text-sm text-slate-500">In Progress</p>
              <p className="mt-2 text-3xl font-black text-amber-700">{dashboard?.metrics?.inProgressApplications || 0}</p>
            </article>
            <article className="card border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 to-white">
              <p className="text-sm text-slate-500">Approved</p>
              <p className="mt-2 text-3xl font-black text-emerald-700">{dashboard?.metrics?.approvedCount || 0}</p>
            </article>
          </section>

          <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AutoText text={dashboard?.portalDisclaimer || "Final submission and verification happens on official portals only."} />
          </section>

          <section className="card">
            <div className="flex items-center justify-between gap-2"><h2 className="text-lg font-semibold">Matching & Eligible Scholarships</h2><button className="btn-secondary" onClick={() => navigate("/student/profile")}>Edit profile</button></div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {(dashboard?.recommendedScholarships || []).map((item) => (
                <article key={item.scholarship._id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-2"><h3 className="font-semibold" data-scholarship-title="true"><AutoText text={item.scholarship.title} /></h3><span className="badge badge-success">{item.score}% match</span></div>
                  <p className="mt-1 text-sm text-slate-600">{money(item.scholarship.amount)} | {new Date(item.scholarship.deadline).toLocaleDateString("en-IN")}</p>
                  <p className="mt-2 text-xs text-emerald-700">{item.passes.join(" | ")}</p>
                  <p className="mt-1 text-xs text-slate-600">Data completeness: {getCompleteness(item.scholarship)}%</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button disabled={busy} onClick={() => startApply(item.scholarship._id)} className="btn-primary">Start application</button>
                    <button className="btn-secondary" onClick={() => navigate(`/student/scholarships/${item.scholarship._id}`)}>View details</button>
                    <button
                      className="btn-secondary"
                      disabled={busy}
                      onClick={() => submitDataFeedbackNow(item.scholarship)}
                    >
                      Feedback
                    </button>
                  </div>
                </article>
              ))}
              {(dashboard?.recommendedScholarships || []).length === 0 && (
                <div className="empty-state lg:col-span-2">Complete MahaDBT profile details and required documents to unlock eligible scholarships.</div>
              )}
            </div>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold">Eligibility Rule</h2>
            <p className="mt-2 text-sm text-slate-600">
              Dashboard now shows only scholarships where your profile is fully eligible. Partial or not-eligible scholarships are hidden.
            </p>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold">Upcoming Deadlines</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(dashboard?.upcomingDeadlines || []).map((d) => (
                <article key={d.applicationId} className="rounded-xl border border-slate-200 p-4">
                  <h3 className="font-semibold">{d.title}</h3>
                  <p className="text-sm text-slate-600">
                    Deadline: {new Date(d.deadline).toLocaleDateString("en-IN")}
                  </p>
                  <p className="mt-1 text-sm text-amber-700">{d.daysLeft} day(s) left</p>
                  <button className="btn-secondary mt-3" onClick={() => navigate("/student/applications")}>
                    Continue application
                  </button>
                </article>
              ))}
              {(dashboard?.upcomingDeadlines || []).length === 0 && (
                <div className="empty-state md:col-span-2">No upcoming deadlines.</div>
              )}
            </div>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold">Search Eligible Scholarships</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <input className="input-base" placeholder="Search scholarships" value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
              <select className="input-base" value={filters.providerType} onChange={(e) => setFilters((p) => ({ ...p, providerType: e.target.value }))}>
                <option value="">All providers</option><option value="GOVERNMENT">Government</option><option value="NGO">NGO</option><option value="CSR">CSR</option><option value="PRIVATE">Private</option>
              </select>
              <button className="btn-secondary" disabled={busy} onClick={runFilter}>Filter</button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {discover.map((item) => (
                <article key={item.scholarship._id} className="rounded-xl border border-slate-200 p-4">
                  <h3 className="font-semibold" data-scholarship-title="true"><AutoText text={item.scholarship.title} /></h3>
                  <p className="mt-1 text-sm text-slate-600">{money(item.scholarship.amount)}</p>
                  <div className="mt-2 flex items-center gap-2"><span className="badge badge-success">Eligible</span><span className="text-xs text-slate-500">{item.score}% match</span></div>
                  <p className="mt-1 text-xs text-slate-600">
                    Data completeness: {getCompleteness(item.scholarship)}%
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="btn-secondary disabled:opacity-50"
                      disabled={busy}
                      onClick={() => startApply(item.scholarship._id)}
                    >
                      Start application
                    </button>
                    <button className="btn-secondary" onClick={() => navigate(`/student/scholarships/${item.scholarship._id}`)}>
                      View details
                    </button>
                    <button
                      className="btn-secondary"
                      disabled={busy}
                      onClick={() => submitDataFeedbackNow(item.scholarship)}
                    >
                      Feedback
                    </button>
                  </div>
                </article>
              ))}
              {discover.length === 0 && <div className="empty-state md:col-span-2">No eligible scholarships found for current filters.</div>}
            </div>
          </section>
        </>
      )}

      {view === "PROFILE" && (
        <section className="space-y-4">
          <article className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Student Profile</h2>
              <span className="badge badge-neutral">{dashboard?.profileCompletion || 0}% complete</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Fill all profile and document details to unlock strictly eligible scholarships only.
            </p>
          </article>

          <article className="card space-y-3">
            <h3 className="text-base font-semibold text-slate-900">Personal Details</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <input className="input-base" placeholder="First name" value={profile.personal.firstName} onChange={(e) => setProfile((p) => ({ ...p, personal: { ...p.personal, firstName: e.target.value } }))} />
              <input className="input-base" placeholder="Middle name" value={profile.personal.middleName} onChange={(e) => setProfile((p) => ({ ...p, personal: { ...p.personal, middleName: e.target.value } }))} />
              <input className="input-base" placeholder="Last name" value={profile.personal.lastName} onChange={(e) => setProfile((p) => ({ ...p, personal: { ...p.personal, lastName: e.target.value } }))} />
              <input className="input-base" placeholder="Father name" value={profile.personal.fatherName} onChange={(e) => setProfile((p) => ({ ...p, personal: { ...p.personal, fatherName: e.target.value } }))} />
              <input className="input-base" placeholder="Mother name" value={profile.personal.motherName} onChange={(e) => setProfile((p) => ({ ...p, personal: { ...p.personal, motherName: e.target.value } }))} />
              <input className="input-base" placeholder="Mobile number" value={profile.mobile} onChange={(e) => setProfile((p) => ({ ...p, mobile: e.target.value }))} />
              <select className="input-base" value={profile.gender} onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}><option value="">Gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select>
              <input className="input-base" type="date" value={profile.dateOfBirth} onChange={(e) => setProfile((p) => ({ ...p, dateOfBirth: e.target.value }))} />
              <select className="input-base" value={profile.personal.maritalStatus} onChange={(e) => setProfile((p) => ({ ...p, personal: { ...p.personal, maritalStatus: e.target.value } }))}>
                {MARITAL_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <input className="input-base" placeholder="Religion" value={profile.personal.religion} onChange={(e) => setProfile((p) => ({ ...p, personal: { ...p.personal, religion: e.target.value } }))} />
              <input className="input-base" placeholder="Caste" value={profile.personal.caste} onChange={(e) => setProfile((p) => ({ ...p, personal: { ...p.personal, caste: e.target.value } }))} />
              <input className="input-base" placeholder="Sub caste" value={profile.personal.subCaste} onChange={(e) => setProfile((p) => ({ ...p, personal: { ...p.personal, subCaste: e.target.value } }))} />
              <select className="input-base" value={profile.category} onChange={(e) => setProfile((p) => ({ ...p, category: e.target.value }))}>{CATEGORY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <input className="input-base" placeholder="Nationality" value={profile.personal.nationality} onChange={(e) => setProfile((p) => ({ ...p, personal: { ...p.personal, nationality: e.target.value } }))} />
              <input className="input-base" type="number" placeholder="Annual income (INR)" value={profile.annualIncome} onChange={(e) => setProfile((p) => ({ ...p, annualIncome: e.target.value }))} />
              <input className="input-base" placeholder="Aadhaar number" value={profile.personal.aadhaarNumber} onChange={(e) => setProfile((p) => ({ ...p, personal: { ...p.personal, aadhaarNumber: e.target.value } }))} />
              <input className="input-base" placeholder="PAN number" value={profile.personal.panNumber} onChange={(e) => setProfile((p) => ({ ...p, personal: { ...p.personal, panNumber: e.target.value } }))} />
              <input className="input-base" placeholder="ABC ID" value={profile.personal.abcId} onChange={(e) => setProfile((p) => ({ ...p, personal: { ...p.personal, abcId: e.target.value } }))} />
              <input className="input-base" placeholder="Domicile state" value={profile.personal.domicileState} onChange={(e) => setProfile((p) => ({ ...p, personal: { ...p.personal, domicileState: e.target.value } }))} />
            </div>
          </article>

          <article className="card space-y-3">
            <h3 className="text-base font-semibold text-slate-900">Address Details</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <input className="input-base md:col-span-2" placeholder="Address line 1" value={profile.address.line1} onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, line1: e.target.value } }))} />
              <input className="input-base md:col-span-1" placeholder="Address line 2" value={profile.address.line2} onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, line2: e.target.value } }))} />
              <input className="input-base" placeholder="State" value={profile.address.state} onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, state: e.target.value } }))} />
              <input className="input-base" placeholder="District" value={profile.address.district} onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, district: e.target.value } }))} />
              <input className="input-base" placeholder="Taluka" value={profile.address.taluka} onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, taluka: e.target.value } }))} />
              <input className="input-base" placeholder="City" value={profile.address.city} onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, city: e.target.value } }))} />
              <input className="input-base" placeholder="Village" value={profile.address.village} onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, village: e.target.value } }))} />
              <input className="input-base" placeholder="Pincode" value={profile.address.pincode} onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, pincode: e.target.value } }))} />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={!!profile.address.correspondenceSameAsPermanent} onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, correspondenceSameAsPermanent: e.target.checked } }))} />
              Correspondence address same as permanent address
            </label>
          </article>

          <article className="card space-y-3">
            <h3 className="text-base font-semibold text-slate-900">Academic Details</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <select className="input-base" value={profile.education.educationLevel} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, educationLevel: e.target.value } }))}>{EDUCATION_LEVEL_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <input className="input-base" placeholder="Course" value={profile.education.course} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, course: e.target.value } }))} />
              <input className="input-base" placeholder="Branch / Specialization" value={profile.education.branch} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, branch: e.target.value } }))} />
              <input className="input-base" placeholder="Institute" value={profile.education.institute} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, institute: e.target.value } }))} />
              <input className="input-base" placeholder="Institute code" value={profile.education.instituteCode} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, instituteCode: e.target.value } }))} />
              <input className="input-base" placeholder="University / Board" value={profile.education.university} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, university: e.target.value } }))} />
              <input className="input-base" type="number" placeholder="Admission year" value={profile.education.admissionYear} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, admissionYear: e.target.value } }))} />
              <input className="input-base" placeholder="Admission type" value={profile.education.admissionType} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, admissionType: e.target.value } }))} />
              <input className="input-base" type="number" placeholder="Current year" value={profile.education.currentYear} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, currentYear: e.target.value } }))} />
              <input className="input-base" type="number" placeholder="Current semester" value={profile.education.currentSemester} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, currentSemester: e.target.value } }))} />
              <input className="input-base" placeholder="Previous exam board" value={profile.education.previousExamBoard} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, previousExamBoard: e.target.value } }))} />
              <input className="input-base" type="number" placeholder="Previous passing year" value={profile.education.previousPassingYear} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, previousPassingYear: e.target.value } }))} />
              <input className="input-base" type="number" placeholder="Previous percentage" value={profile.education.previousPercentage} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, previousPercentage: e.target.value } }))} />
              <input className="input-base" type="number" placeholder="Current percentage" value={profile.education.percentage} onChange={(e) => setProfile((p) => ({ ...p, education: { ...p.education, percentage: e.target.value } }))} />
            </div>
          </article>

          <article className="card space-y-3">
            <h3 className="text-base font-semibold text-slate-900">Bank Details</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <input className="input-base" placeholder="Account holder name" value={profile.bankDetails.accountHolderName} onChange={(e) => setProfile((p) => ({ ...p, bankDetails: { ...p.bankDetails, accountHolderName: e.target.value } }))} />
              <input className="input-base" placeholder="Account number" value={profile.bankDetails.accountNumber} onChange={(e) => setProfile((p) => ({ ...p, bankDetails: { ...p.bankDetails, accountNumber: e.target.value } }))} />
              <input className="input-base" placeholder="IFSC code" value={profile.bankDetails.ifscCode} onChange={(e) => setProfile((p) => ({ ...p, bankDetails: { ...p.bankDetails, ifscCode: e.target.value } }))} />
              <input className="input-base" placeholder="Bank name" value={profile.bankDetails.bankName} onChange={(e) => setProfile((p) => ({ ...p, bankDetails: { ...p.bankDetails, bankName: e.target.value } }))} />
              <input className="input-base" placeholder="Branch name" value={profile.bankDetails.branchName} onChange={(e) => setProfile((p) => ({ ...p, bankDetails: { ...p.bankDetails, branchName: e.target.value } }))} />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={!!profile.bankDetails.isAadhaarSeeded} onChange={(e) => setProfile((p) => ({ ...p, bankDetails: { ...p.bankDetails, isAadhaarSeeded: e.target.checked } }))} />
              Aadhaar seeded with bank account
            </label>
          </article>

          <article className="card space-y-3">
            <h3 className="text-base font-semibold text-slate-900">Family, Financial & Social</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <input className="input-base" placeholder="Guardian name" value={profile.family.guardianName} onChange={(e) => setProfile((p) => ({ ...p, family: { ...p.family, guardianName: e.target.value } }))} />
              <input className="input-base" placeholder="Father occupation" value={profile.family.fatherOccupation} onChange={(e) => setProfile((p) => ({ ...p, family: { ...p.family, fatherOccupation: e.target.value } }))} />
              <input className="input-base" placeholder="Mother occupation" value={profile.family.motherOccupation} onChange={(e) => setProfile((p) => ({ ...p, family: { ...p.family, motherOccupation: e.target.value } }))} />
              <input className="input-base" type="number" placeholder="Family size" value={profile.family.familySize} onChange={(e) => setProfile((p) => ({ ...p, family: { ...p.family, familySize: e.target.value } }))} />
              <input className="input-base" placeholder="Income certificate number" value={profile.financial.incomeCertificateNumber} onChange={(e) => setProfile((p) => ({ ...p, financial: { ...p.financial, incomeCertificateNumber: e.target.value } }))} />
              <input className="input-base" placeholder="Family income source" value={profile.financial.familyIncomeSource} onChange={(e) => setProfile((p) => ({ ...p, financial: { ...p.financial, familyIncomeSource: e.target.value } }))} />
              <input className="input-base" placeholder="Guardian occupation (financial)" value={profile.financial.guardianOccupation} onChange={(e) => setProfile((p) => ({ ...p, financial: { ...p.financial, guardianOccupation: e.target.value } }))} />
              <input className="input-base" placeholder="Minority type (if applicable)" value={profile.social.minorityType} onChange={(e) => setProfile((p) => ({ ...p, social: { ...p.social, minorityType: e.target.value } }))} />
            </div>
            <div className="grid gap-2 md:grid-cols-3 text-sm text-slate-700">
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!profile.financial.hasDisability} onChange={(e) => setProfile((p) => ({ ...p, financial: { ...p.financial, hasDisability: e.target.checked } }))} />Has disability</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!profile.financial.isFirstGenerationLearner} onChange={(e) => setProfile((p) => ({ ...p, financial: { ...p.financial, isFirstGenerationLearner: e.target.checked } }))} />First generation learner</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!profile.financial.bplCardHolder} onChange={(e) => setProfile((p) => ({ ...p, financial: { ...p.financial, bplCardHolder: e.target.checked } }))} />BPL card holder</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!profile.financial.isFarmerChild} onChange={(e) => setProfile((p) => ({ ...p, financial: { ...p.financial, isFarmerChild: e.target.checked } }))} />Child of farmer</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!profile.social.minorityStatus} onChange={(e) => setProfile((p) => ({ ...p, social: { ...p.social, minorityStatus: e.target.checked } }))} />Minority student</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!profile.social.isOrphan} onChange={(e) => setProfile((p) => ({ ...p, social: { ...p.social, isOrphan: e.target.checked } }))} />Orphan</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!profile.social.isHosteller} onChange={(e) => setProfile((p) => ({ ...p, social: { ...p.social, isHosteller: e.target.checked } }))} />Hosteller</label>
            </div>
          </article>

          <article className="card space-y-3">
            <h3 className="text-base font-semibold text-slate-900">Profile Document Uploads</h3>
            <p className="text-sm text-slate-600">
              Upload exact documents here. Cloudinary file URL is stored in your profile record.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {PROFILE_DOCUMENT_OPTIONS.map((doc) => {
                const docMeta = normalizeProfileDocument(profile.documents?.[doc.key]);
                const uploaded = docMeta.isUploaded;
                const url = String(docMeta.fileUrl || "").trim();
                return (
                  <div key={doc.key} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">{doc.label}</p>
                      <span className={`badge ${uploaded ? "badge-success" : "badge-warning"}`}>
                        {uploaded ? "Uploaded" : "Not uploaded"}
                      </span>
                    </div>
                    {docMeta.fileName && (
                      <p className="mt-1 text-xs text-slate-500">{docMeta.fileName}</p>
                    )}
                    {url && (
                      <a
                        className="mt-1 inline-block text-xs font-semibold text-teal-700 hover:underline"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open uploaded file
                      </a>
                    )}
                    <input
                      type="file"
                      className="mt-2 text-xs"
                      onChange={(e) => uploadProfileDocumentNow(doc.key, e.target.files?.[0])}
                      disabled={busy}
                    />
                  </div>
                );
              })}
            </div>
          </article>

          <button disabled={busy} onClick={saveProfileNow} className="btn-primary">Save profile</button>
        </section>
      )}

      {view === "APPLICATIONS" && (
        <section className="grid gap-4 lg:grid-cols-3">
          <aside className="card">
            {apps.map((a) => (
              <button
                key={a._id}
                onClick={() => setActiveAppId(a._id)}
                className={`mb-2 w-full rounded-lg border p-3 text-left ${activeApp?._id === a._id ? "border-teal-300 bg-teal-50" : "border-slate-200"}`}
              >
                <p className="font-semibold" data-scholarship-title="true"><AutoText text={a.scholarshipId?.title || ""} /></p>
                <span className={`badge ${statusClass[a.status] || "badge-neutral"}`}>{a.status}</span>
                <p className="mt-1 text-xs text-slate-500">{a.progressPercent}%</p>
              </button>
            ))}
          </aside>
          <div className="card lg:col-span-2">
            {!activeApp && <div className="empty-state">No applications yet.</div>}
            {activeApp && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold" data-scholarship-title="true"><AutoText text={activeApp.scholarshipId?.title || ""} /></h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => finalSubmit(activeApp._id)}
                      disabled={busy || activeApp.status === "APPROVED" || !activeApplyLink}
                      className="btn-primary"
                    >
                      Mark applied on official portal
                    </button>
                    {activeApplyLink && (
                      <a
                        href={activeApplyLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                      >
                        Open official portal
                      </a>
                    )}
                  </div>
                </div>
                {!activeApplyLink && (
                  <p className="text-sm text-red-600">Official application link missing. Contact moderator before continuing.</p>
                )}

                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <AutoText text="Final submission and verification happens on official government/NGO portals only." />
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <h4 className="text-base font-semibold text-slate-900">Scholarship Details (Same as View Details)</h4>
                  <p className="mt-2 text-sm text-slate-700">
                    <AutoText text={activeApp.scholarshipId?.description || "Description not available."} />
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">Amount</p>
                      <p className="text-sm font-semibold text-teal-700">
                        INR {Number(activeApp.scholarshipId?.amount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">Deadline</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {activeApp.scholarshipId?.deadline
                          ? new Date(activeApp.scholarshipId.deadline).toLocaleDateString("en-IN")
                          : "-"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">Provider</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {activeApp.scholarshipId?.provider?.name ? <AutoText text={activeApp.scholarshipId.provider.name} /> : "-"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">Provider Type</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {activeApp.scholarshipId?.provider?.type || "-"}
                      </p>
                    </div>
                  </div>
                  {activeEligibilityText && (
                    <div className="mt-3 rounded-lg border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">Eligibility</p>
                      <p className="mt-1 text-sm text-slate-700"><AutoText text={activeEligibilityText} /></p>
                    </div>
                  )}
                  {activeApp.scholarshipId?.benefits && (
                    <div className="mt-3 rounded-lg border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">Benefits</p>
                      <p className="mt-1 text-sm text-slate-700"><AutoText text={activeApp.scholarshipId.benefits} /></p>
                    </div>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Track official status</p>
                    <select
                      className="input-base mt-2"
                      value={["APPLIED", "PENDING", "APPROVED", "REJECTED"].includes(activeApp.status) ? activeApp.status : ""}
                      onChange={(e) => updateTrackedStatus(activeApp._id, e.target.value)}
                      disabled={busy}
                    >
                      <option value="">Select status update</option>
                      <option value="APPLIED">APPLIED</option>
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Common mistakes</p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                      {(activeApp.scholarshipId?.commonMistakes || []).map((m, idx) => (
                        <li key={`${m}-${idx}`}>- <AutoText text={m} /></li>
                      ))}
                      {(activeApp.scholarshipId?.commonMistakes || []).length === 0 && (
                        <li>No common mistake notes available.</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="h-3 rounded-full bg-slate-200"><div className="h-full rounded-full bg-teal-500" style={{ width: `${activeApp.progressPercent || 0}%` }} /></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 font-semibold">Roadmap</p>
                    {(activeApp.roadmapSteps || []).map((s) => (
                      <label key={s.key} className="mb-2 flex items-start gap-2 rounded-lg border border-slate-200 p-2">
                        <input type="checkbox" checked={!!s.isDone} disabled={busy || ["documents", "submit"].includes(s.key)} onChange={(e) => toggleStep(activeApp._id, s.key, e.target.checked)} />
                        <span><b><AutoText text={s.title} /></b><br /><small className="text-slate-500"><AutoText text={s.description} /></small></span>
                      </label>
                    ))}
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">
                      {(activeApp.scholarshipId?.applicationProcess?.steps || []).length > 0
                        ? activeApp.scholarshipId.applicationProcess.steps.map((step, idx) => (
                            <p key={`${step}-${idx}`}>{idx + 1}. <AutoText text={step} /></p>
                          ))
                        : "No step-by-step instructions added."}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 font-semibold">Document Checklist</p>
                    {(activeApp.documentChecklist || []).map((d) => (
                      <div key={d.documentType} className="mb-2 rounded-lg border border-slate-200 p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium"><AutoText text={d.label || d.documentType} /></span>
                          <span className={`badge ${d.isUploaded ? "badge-success" : "badge-warning"}`}>
                            {d.isUploaded ? (d.isVerified ? "Verified" : "Uploaded") : "Pending"}
                          </span>
                        </div>
                        {d.comment && <p className="mt-1 text-xs text-amber-700"><AutoText text={d.comment} /></p>}
                        <input type="file" className="mt-2 text-xs" onChange={(e) => uploadDoc(activeApp._id, d.documentType, e.target.files?.[0])} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {view === "NOTIFICATIONS" && (
        <section className="card space-y-3">
          <h2 className="text-lg font-semibold">Notifications</h2>
          {notifications.map((n) => (
            <article key={n._id} className={`rounded-lg border p-3 ${n.isRead ? "border-slate-200" : "border-teal-200 bg-teal-50/40"}`}>
              <div className="flex items-center justify-between gap-2"><h3 className="font-semibold"><AutoText text={n.title} /></h3>{!n.isRead && <button className="btn-secondary py-1 text-xs" onClick={() => markRead(n._id)}>Mark read</button>}</div>
              <p className="text-sm text-slate-600"><AutoText text={n.message} /></p>
              <p className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
            </article>
          ))}
          {notifications.length === 0 && <div className="empty-state">No notifications.</div>}
        </section>
      )}
    </div>
  );
}

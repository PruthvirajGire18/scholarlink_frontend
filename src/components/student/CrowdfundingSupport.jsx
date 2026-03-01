import { platforms } from "../../data/crowdfundingPlatforms";

export default function CrowdfundingSupport() {
  return (
    <section className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Alternative Funding Support</h2>
          <p className="mt-1 text-sm text-slate-600">
            You may also apply for education crowdfunding support on verified platforms.
          </p>
        </div>
        <span className="badge badge-warning">Low-Income Support</span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {platforms.map((platform) => (
          <article
            key={platform.name}
            className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-900">{platform.name}</h3>
              <span className="badge badge-neutral">Crowdfunding</span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Steps to Apply</p>
              <ol className="mt-2 space-y-1 text-sm text-slate-700">
                {platform.steps.map((step, index) => (
                  <li key={`${platform.name}-step-${index}`}>{index + 1}. {step}</li>
                ))}
              </ol>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Required Documents
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {platform.documents.map((document) => (
                  <li key={`${platform.name}-${document}`}>- {document}</li>
                ))}
              </ul>
            </div>

            <a
              href={platform.url}
              target="_blank"
              rel="noreferrer"
              className="btn-primary mt-4 inline-flex"
            >
              Apply Now
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

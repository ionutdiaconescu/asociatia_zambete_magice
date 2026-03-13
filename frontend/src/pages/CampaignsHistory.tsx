import { useCampaigns } from "../hooks/useCampaigns";
import { Link } from "react-router-dom";
import { Meta } from "../components/seo/Meta";
import { getHistoricalCampaigns } from "../utils/campaign";
import { buildWebPageMeta } from "../utils/seo";

export default function CampaignsHistory() {
  const { data, loading, error, reload } = useCampaigns();
  const historical = getHistoricalCampaigns(data);
  const seo = buildWebPageMeta({
    title: "Istoric campanii",
    path: "/campanii/istoric",
    description:
      "Campanii finalizate sau incheiate ale asociatiei Zambete Magice, pastrate pentru transparenta.",
    type: "CollectionPage",
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-14">
      <Meta
        title="Istoric campanii"
        description="Campanii finalizate sau încheiate, păstrate pentru transparență și context."
        canonical={seo.canonical}
        jsonLd={seo.jsonLd}
      />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-gray-100">
          Istoric campanii
        </h1>
        <button
          onClick={reload}
          className="inline-flex items-center px-4 py-2 text-base rounded-xl border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200"
        >
          Reîncarcă
        </button>
      </div>
      <p className="text-base text-slate-600 dark:text-gray-400 mb-8 max-w-3xl">
        Campaniile finalizate sau expirate sunt arhivate aici pentru
        transparență și pentru a arăta impactul activităților anterioare.
      </p>
      {loading && (
        <div className="py-10 text-center text-gray-500" aria-busy="true">
          Se încarcă campaniile...
        </div>
      )}
      {error && (
        <div className="py-6 text-red-600 text-sm" role="alert">
          Eroare: {error}
        </div>
      )}
      {!loading && !error && historical.length === 0 && (
        <div className="py-10 text-center text-gray-500 text-sm">
          Încă nu există campanii istorice.
        </div>
      )}
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {historical.map((c) => (
          <li
            key={c.id}
            className="group rounded-3xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden shadow-[0_8px_30px_rgba(15,23,42,0.07)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.14)] transition"
          >
            {c.coverImage && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={c.coverImage}
                  alt={c.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-4 flex flex-col gap-3">
              <h2 className="font-semibold text-lg text-slate-900 dark:text-gray-100 line-clamp-2">
                {c.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-3 whitespace-pre-line">
                {c.shortDescription}
              </p>
              <div className="mt-auto flex flex-col gap-2 text-sm text-slate-500 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                {c.endDate ? (
                  <span>Încheiată: {c.endDate}</span>
                ) : (
                  <span className="italic">Finalizată</span>
                )}
                {c.isFeatured && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300 border border-amber-300/50 text-[11px] font-medium">
                    Evidențiată
                  </span>
                )}
              </div>
              <Link
                to={`/campanii/${c.slug}`}
                className="inline-flex justify-center mt-2 text-sm font-semibold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Vezi detalii
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

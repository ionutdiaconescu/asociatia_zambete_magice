import { useCampaigns } from "../hooks/useCampaigns";
import { Link } from "react-router-dom";

export default function CampaignsHistory() {
  const { data, loading, error, reload } = useCampaigns();
  const historical = (data || []).filter((c) => c.isHistorical);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
          Istoric campanii
        </h1>
        <button
          onClick={reload}
          className="inline-flex items-center px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          Reîncarcă
        </button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-2xl">
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
            className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-md transition"
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
              <h2 className="font-semibold text-base text-gray-800 dark:text-gray-100 line-clamp-2">
                {c.title}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 whitespace-pre-line">
                {c.shortDescription}
              </p>
              <div className="mt-auto flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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
                to={`/campaigns/${c.slug}`}
                className="inline-flex justify-center mt-2 text-xs font-medium px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

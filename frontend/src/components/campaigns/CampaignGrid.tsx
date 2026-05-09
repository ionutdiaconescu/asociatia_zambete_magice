import { useCampaigns } from "../../hooks/useCampaigns";
import { Link } from "react-router-dom";
import { CampaignCard, CampaignCardSkeleton } from "./CampaignCard";
import { getActiveCampaigns } from "../../utils/campaign";

export function CampaignGrid() {
  const { data: campaigns, loading, error } = useCampaigns();
  const activeCampaigns = getActiveCampaigns(campaigns);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((index) => (
          <CampaignCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error || !campaigns) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">😔</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Nu am putut încărca campaniile
        </h3>
        <p className="text-gray-600">
          {error || "Încearcă să reîmprospătezi pagina"}
        </p>
      </div>
    );
  }

  if (activeCampaigns.length === 0) {
    return (
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white px-6 py-12 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:px-10">
        <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl text-amber-700">
          📚
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 mb-3">
          Nu sunt campanii în desfășurare în acest moment
        </h3>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600">
          Poți vedea campaniile încheiate și impactul lor în secțiunea de
          istoric. Vom publica aici automat următoarele campanii active.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            to="/campanii/istoric"
            className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Vezi istoricul campaniilor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activeCampaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}

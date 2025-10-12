import { useCampaigns } from "../../hooks/useCampaigns";
import { CampaignCard, CampaignCardSkeleton } from "./CampaignCard";

export function CampaignGrid() {
  const { data: campaigns, loading, error } = useCampaigns();

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

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Nu există campanii active momentan
        </h3>
        <p className="text-gray-600">Noi campanii vor fi adăugate în curând</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}

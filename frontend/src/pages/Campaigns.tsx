import { useEffect } from "react";
import { useCampaigns } from "../hooks/useCampaigns";
import {
  CampaignCard,
  CampaignCardSkeleton,
} from "../components/campaigns/CampaignCard";
import { Section } from "../components/ui/Section";
import { Meta } from "../components/seo/Meta";
import { ContentState } from "../components/ui/ContentState";

export default function Campaigns() {
  const { data, loading, error, reload } = useCampaigns();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const live = document.getElementById("app-live-region");
    if (!live) return;

    if (loading) live.textContent = "Se încarcă campaniile...";
    else if (error) live.textContent = `Eroare: ${error}`;
    else if (data) live.textContent = `Încărcate ${data.length} campanii.`;
  }, [loading, error, data]);

  return (
    <div className="bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)]">
      <Meta
        title="Campanii"
        description="Campanii active ale asociației Zâmbete Magice"
      />
      <Section
        title="Campanii"
        description="Proiecte active pe care le poți susține astăzi, cu impact direct în comunitate."
        className="pt-16"
      >
        <ContentState
          state={{ data, loading, error, reload }}
          skeleton={
            <div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              aria-busy="true"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <CampaignCardSkeleton key={i} />
              ))}
            </div>
          }
          empty={
            <p className="text-base text-slate-600">
              Nu există campanii momentan.
            </p>
          }
        >
          {(list) => (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          )}
        </ContentState>
      </Section>
    </div>
  );
}

import { useEffect } from "react";
import { useCampaigns } from "../hooks/useCampaigns";
import {
  CampaignCard,
  CampaignCardSkeleton,
} from "../components/campaigns/CampaignCard";
import { Section } from "../components/ui/Section";
import { Meta } from "../components/seo/Meta";
import { ContentState } from "../components/ui/ContentState";
import { getActiveCampaigns } from "../utils/campaign";
import { buildWebPageMeta } from "../utils/seo";

export default function Campaigns() {
  const { data, loading, error, reload } = useCampaigns();
  const activeCampaigns = getActiveCampaigns(data);
  const seo = buildWebPageMeta({
    title: "Campanii",
    path: "/campanii",
    description:
      "Campanii active ale asociatiei Zambete Magice, cu impact direct in comunitate.",
    type: "CollectionPage",
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const live = document.getElementById("app-live-region");
    if (!live) return;

    if (loading) live.textContent = "Se încarcă campaniile...";
    else if (error) live.textContent = `Eroare: ${error}`;
    else if (data)
      live.textContent = `Încărcate ${activeCampaigns.length} campanii active.`;
  }, [loading, error, data, activeCampaigns.length]);

  return (
    <div className="bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)]">
      <Meta
        title="Campanii"
        description="Campanii active ale asociației Zâmbete Magice"
        canonical={seo.canonical}
        jsonLd={seo.jsonLd}
      />
      <Section
        title="Campanii"
        description="Proiecte active pe care le poți susține astăzi, cu impact direct în comunitate."
        className="pt-16"
      >
        <ContentState
          state={{ data: activeCampaigns, loading, error, reload }}
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

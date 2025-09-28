import { Link } from "react-router-dom";
import { useCampaigns } from "../hooks/useCampaigns";
import {
  CampaignCard,
  CampaignCardSkeleton,
} from "../components/campaigns/CampaignCard";
import { ContentState } from "../components/ui/ContentState";
import { Meta } from "../components/seo/Meta";

export default function Home() {
  const { data, loading, error } = useCampaigns();
  const top = data ? data.slice(0, 3) : [];

  return (
    <div className="max-w-6xl mx-auto py-16 md:py-24 px-4">
      <Meta
        title="Acasă"
        description="Asociația Zâmbete Magice – susținem educația și dezvoltarea copiilor prin campanii și programe dedicate."
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Zâmbete Magice",
            url:
              typeof window !== "undefined"
                ? window.location.origin
                : undefined,
            logo: undefined,
            sameAs: [],
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Zâmbete Magice",
            url:
              typeof window !== "undefined"
                ? window.location.origin
                : undefined,
            potentialAction: {
              "@type": "SearchAction",
              target: `${
                typeof window !== "undefined" ? window.location.origin : ""
              }/search?q={query}`,
              "query-input": "required name=query",
            },
          },
        ]}
      />
      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Zâmbete Magice
        </h1>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Împreună aducem șanse egale copiilor prin educație, sprijin emoțional
          și programe after-school. Descoperă campaniile active și contribuie la
          un viitor mai bun.
        </p>
      </header>

      <section aria-labelledby="home-campaigns-heading" className="mb-16">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h2
            id="home-campaigns-heading"
            className="text-2xl font-semibold tracking-tight"
          >
            Campanii active
          </h2>
          <Link
            to="/campaigns"
            className="text-sm font-medium text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-sm"
          >
            Vezi toate campaniile →
          </Link>
        </div>

        <ContentState
          state={{ data: top, loading, error }}
          skeleton={
            <div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              aria-busy="true"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <CampaignCardSkeleton key={i} />
              ))}
            </div>
          }
          empty={
            <p className="text-sm text-gray-600">
              Momentan nu există campanii active.
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
      </section>

      <section aria-labelledby="how-to-help" className="max-w-3xl">
        <h2 id="how-to-help" className="sr-only">
          Cum poți ajuta
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          Fiecare contribuție contează: distribuie campaniile în rețeaua ta, fă
          o donație sau devino voluntar. Împreună creăm contexte în care copiii
          pot învăța, se pot dezvolta și zâmbi.
        </p>
      </section>
    </div>
  );
}

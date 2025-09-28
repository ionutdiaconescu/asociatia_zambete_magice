import { useParams, Link } from "react-router-dom";
import { useCampaign } from "../hooks/useCampaign";
import { formatRON, formatPercent } from "../utils/format";
import { Progress } from "../components/ui/Progress";
import { Section } from "../components/ui/Section";
import { Button } from "../components/ui/Button";
import { Meta } from "../components/seo/Meta";

export default function CampaignDetail() {
  const { slug } = useParams();
  const { data, loading, error, reload } = useCampaign(slug);

  if (typeof document !== "undefined") {
    const live = document.getElementById("app-live-region");
    if (live) {
      if (loading) live.textContent = "Se încarcă detaliile campaniei...";
      else if (error) live.textContent = `Eroare: ${error}`;
      else if (data) live.textContent = `Campanie încărcată: ${data.title}`;
    }
  }

  return (
    <Section>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4 text-sm">
          <Link to="/campaigns" className="text-blue-600 hover:underline">
            ← Înapoi la campanii
          </Link>
        </div>
        {loading && (
          <div className="animate-pulse space-y-6" aria-busy="true">
            <div className="h-8 w-2/3 bg-gray-200 rounded" />
            <div className="h-64 w-full bg-gray-200 rounded" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 w-full bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        )}
        {error && !loading && (
          <div className="p-6 border border-red-200 bg-red-50 rounded-md text-sm text-red-700">
            <p className="font-medium mb-3">Eroare: {error}</p>
            <Button variant="outline" onClick={reload}>
              Reîncearcă
            </Button>
          </div>
        )}
        {!loading && !error && data && (
          <article>
            <Meta
              title={data.title}
              description={data.shortDescription || data.title}
              ogImage={data.coverImage}
              canonical={
                typeof window !== "undefined" ? window.location.href : undefined
              }
              ogType="article"
              jsonLd={{
                "@context": "https://schema.org",
                "@type": "CreativeWork",
                name: data.title,
                description: data.shortDescription || data.title,
                image: data.coverImage,
                dateModified: data.updatedAt,
                url:
                  typeof window !== "undefined"
                    ? window.location.href
                    : undefined,
              }}
            />
            <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-4">
                {data.title}
              </h1>
              {data.coverImage && (
                <img
                  src={data.coverImage}
                  alt=""
                  className="w-full h-80 object-cover rounded-lg mb-6"
                  loading="lazy"
                />
              )}
              <div className="space-y-3">
                <Progress
                  value={data.raised}
                  max={data.goal}
                  srLabel={`Progres strângere fonduri: ${formatPercent(
                    data.raised,
                    data.goal
                  )}`}
                  heightClass="h-3"
                />
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
                  <div>
                    <span className="font-medium text-gray-900">
                      {formatRON(data.raised)}
                    </span>{" "}
                    strânși din {formatRON(data.goal)}
                  </div>
                  <div>
                    Ultima actualizare:{" "}
                    {new Date(data.updatedAt).toLocaleDateString("ro-RO")}
                  </div>
                </div>
              </div>
            </header>
            <div className="prose max-w-none prose-p:leading-relaxed prose-headings:tracking-tight">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {data.body}
              </p>
            </div>
            <div className="mt-10">
              <Button as-child>
                {/* For now route to donate page with potential preselect logic later */}
                <Link to="/donate" className="">
                  Donează acum
                </Link>
              </Button>
            </div>
          </article>
        )}
      </div>
    </Section>
  );
}

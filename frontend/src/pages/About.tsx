import { usePage } from "../hooks/usePage";
import { Meta } from "../components/seo/Meta";
import { ContentState } from "../components/ui/ContentState";
import { Link } from "react-router-dom";
import { PageHero } from "../components/ui/PageHero";
import { ImageGallery } from "../components/ui/ImageGallery";
import { RichHtml } from "../components/ui/RichHtml";
import { excerptFromHtml } from "../utils/content";
import { buildCanonical, buildCreativeWork } from "../utils/seo";

export default function About() {
  const { data, loading, error, reload } = usePage("about");

  return (
    <div className="py-16 md:py-24 bg-gradient-to-b from-amber-50/50 via-white to-white">
      {data && (
        <Meta
          title={data.title}
          description={excerptFromHtml(data.body, 160)}
          canonical={buildCanonical("/about")}
          ogImage={data.heroImageUrl || undefined}
          jsonLd={buildCreativeWork({
            name: data.title,
            description: excerptFromHtml(data.body, 200),
            image: data.heroImageUrl || undefined,
            dateModified: data.updatedAt,
            url: buildCanonical("/about"),
          })}
        />
      )}
      <div className="max-w-6xl mx-auto px-4">
        <ContentState
          state={{ data, loading, error, reload }}
          skeleton={
            <div className="space-y-4 animate-pulse" aria-busy="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          }
        >
          {(page) => (
            <>
              <PageHero
                title={page.title || "Despre noi"}
                subtitle="Afla povestea, misiunea si impactul pe care il construim impreuna in comunitate."
                imageUrl={page.heroImageUrl}
                badge="Asociatia Zambete Magice"
                minHeightClassName="min-h-[340px] md:min-h-[420px]"
                gradientClassName="bg-gradient-to-br from-amber-900 via-orange-800 to-rose-700"
              />

              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 md:mb-14">
                <article className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
                    Cine suntem
                  </h2>
                  <RichHtml
                    html={page.body}
                    className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-slate-900 prose-strong:text-slate-900"
                  />
                </article>

                <aside className="bg-gradient-to-br from-amber-900 to-rose-800 text-white rounded-2xl p-6 md:p-7 shadow-lg">
                  <h3 className="text-lg font-semibold mb-3">Implicare</h3>
                  <p className="text-slate-200 text-sm leading-relaxed mb-6">
                    Fiecare contributie, fiecare distribuire si fiecare ora de
                    voluntariat adauga valoare reala pentru copii si familii.
                  </p>
                  <div className="space-y-3">
                    <Link
                      to="/campanii"
                      className="block text-center w-full rounded-xl px-4 py-3 bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
                    >
                      Vezi campaniile active
                    </Link>
                    <Link
                      to="/contact"
                      className="block text-center w-full rounded-xl px-4 py-3 bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Contacteaza-ne
                    </Link>
                  </div>
                </aside>
              </section>

              <ImageGallery
                title="Galerie"
                images={page.galleryUrls || []}
                altPrefix="Galerie"
                className="mb-4"
              />
            </>
          )}
        </ContentState>
      </div>
    </div>
  );
}

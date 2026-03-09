import { usePage } from "../hooks/usePage";
import { Meta } from "../components/seo/Meta";
import { ContentState } from "../components/ui/ContentState";
import { PageHero } from "../components/ui/PageHero";
import { ImageGallery } from "../components/ui/ImageGallery";
import { RichHtml } from "../components/ui/RichHtml";
import { excerptFromHtml, isSafeMapEmbed } from "../utils/content";
import { buildCanonical, buildCreativeWork } from "../utils/seo";

export default function Contact() {
  const { data, loading, error, reload } = usePage("contact");
  const hasEmbeddedMap = isSafeMapEmbed(data?.mapEmbed);

  return (
    <div className="py-16 md:py-24 bg-gradient-to-b from-sky-50/60 via-white to-white">
      {data && (
        <Meta
          title={data.title}
          description={excerptFromHtml(data.body, 160)}
          canonical={buildCanonical("/contact")}
          ogImage={data.heroImageUrl || undefined}
          jsonLd={buildCreativeWork({
            name: data.title,
            description: excerptFromHtml(data.body, 200),
            image: data.heroImageUrl || undefined,
            dateModified: data.updatedAt,
            url: buildCanonical("/contact"),
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
                title={page.title || "Contact"}
                subtitle="Suntem aici pentru intrebari, propuneri de colaborare si orice forma de sprijin."
                imageUrl={page.heroImageUrl}
                minHeightClassName="min-h-[300px] md:min-h-[380px]"
                gradientClassName="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700"
                overlayClassName="absolute inset-0 bg-gradient-to-tr from-slate-950/70 via-slate-900/45 to-indigo-900/35"
              />

              <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 md:mb-12">
                <article className="p-6 border border-slate-200 rounded-2xl shadow-sm bg-white">
                  <h2 className="text-base font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Adresa
                  </h2>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {page.address || "Date indisponibile momentan"}
                  </p>
                </article>
                <article className="p-6 border border-slate-200 rounded-2xl shadow-sm bg-white">
                  <h2 className="text-base font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Telefon
                  </h2>
                  {page.phone ? (
                    <a
                      href={`tel:${page.phone.replace(/\s+/g, "")}`}
                      className="text-slate-900 font-semibold hover:text-indigo-600 transition-colors"
                    >
                      {page.phone}
                    </a>
                  ) : (
                    <p className="text-slate-700">
                      Date indisponibile momentan
                    </p>
                  )}
                </article>
                <article className="p-6 border border-slate-200 rounded-2xl shadow-sm bg-white">
                  <h2 className="text-base font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Email
                  </h2>
                  {page.email ? (
                    <a
                      href={`mailto:${page.email}`}
                      className="text-slate-900 font-semibold break-all hover:text-indigo-600 transition-colors"
                    >
                      {page.email}
                    </a>
                  ) : (
                    <p className="text-slate-700">
                      Date indisponibile momentan
                    </p>
                  )}
                </article>
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 md:mb-12">
                <article className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
                    Scrie-ne
                  </h2>
                  <RichHtml
                    html={page.body}
                    className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-slate-900"
                  />
                </article>

                <aside className="bg-slate-900 text-white rounded-2xl p-6 md:p-7 shadow-lg">
                  <h3 className="text-lg font-semibold mb-3">Raspuns rapid</h3>
                  <p className="text-slate-200 text-sm leading-relaxed mb-5">
                    Pentru solicitari urgente, foloseste telefonul sau emailul.
                    Revenim cat mai repede posibil.
                  </p>
                  <div className="space-y-3">
                    {page.email && (
                      <a
                        href={`mailto:${page.email}`}
                        className="block w-full text-center rounded-xl px-4 py-3 bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
                      >
                        Trimite email
                      </a>
                    )}
                    {page.phone && (
                      <a
                        href={`tel:${page.phone.replace(/\s+/g, "")}`}
                        className="block w-full text-center rounded-xl px-4 py-3 bg-indigo-500/85 text-white font-semibold hover:bg-indigo-500 transition-colors"
                      >
                        Suna acum
                      </a>
                    )}
                  </div>
                </aside>
              </section>

              {hasEmbeddedMap && (
                <section className="mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                    Unde ne gasesti
                  </h2>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white [&_iframe]:w-full [&_iframe]:h-[360px] md:[&_iframe]:h-[460px]">
                    <RichHtml html={page.mapEmbed} mode="map" />
                  </div>
                </section>
              )}

              <ImageGallery
                title="Imagini"
                images={page.galleryUrls || []}
                altPrefix="Imagine"
              />
            </>
          )}
        </ContentState>
      </div>
    </div>
  );
}

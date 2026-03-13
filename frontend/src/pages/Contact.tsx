import { usePage } from "../hooks/usePage";
import { Meta } from "../components/seo/Meta";
import { ContentState } from "../components/ui/ContentState";
import { PageHero } from "../components/ui/PageHero";
import { ImageGallery } from "../components/ui/ImageGallery";
import { RichHtml } from "../components/ui/RichHtml";
import { excerptFromHtml, isSafeMapEmbed } from "../utils/content";
import { buildCreativeWorkMeta } from "../utils/seo";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

function ContactCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_16px_45px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:-translate-y-1">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 opacity-80" />
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 ring-1 ring-amber-200">
        {icon}
      </div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </h2>
      <div className="text-slate-900 text-[1.05rem] font-semibold leading-relaxed">
        {children}
      </div>
    </article>
  );
}

export default function Contact() {
  const { data, loading, error, reload } = usePage("contact");
  const hasEmbeddedMap = isSafeMapEmbed(data?.mapEmbed);
  const seo = data
    ? buildCreativeWorkMeta({
        title: data.title,
        path: "/contact",
        description: excerptFromHtml(data.body, 200),
        image: data.heroImageUrl || undefined,
        dateModified: data.updatedAt,
      })
    : null;

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_26%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.14),transparent_28%),linear-gradient(180deg,rgba(255,251,235,0.88)_0%,#ffffff_36%,#fffaf4_100%)] py-16 md:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.16),transparent_62%)]" />
      {data && (
        <Meta
          title={data.title}
          description={excerptFromHtml(data.body, 160)}
          canonical={seo?.canonical}
          ogImage={data.heroImageUrl || undefined}
          jsonLd={seo?.jsonLd}
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
                badge="Hai sa vorbim"
                minHeightClassName="min-h-[300px] md:min-h-[380px]"
                gradientClassName="bg-gradient-to-br from-amber-900 via-orange-800 to-rose-700"
                overlayClassName="absolute inset-0 bg-gradient-to-tr from-amber-950/70 via-orange-900/45 to-rose-900/30"
              />

              <section className="mb-10 grid grid-cols-1 gap-5 md:mb-12 md:grid-cols-3">
                <ContactCard
                  icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
                  label="Adresa"
                >
                  <p>{page.address || "Date indisponibile momentan"}</p>
                </ContactCard>
                <ContactCard
                  icon={<Phone className="h-5 w-5" aria-hidden="true" />}
                  label="Telefon"
                >
                  {page.phone ? (
                    <a
                      href={`tel:${page.phone.replace(/\s+/g, "")}`}
                      className="inline-flex items-center gap-2 text-slate-900 transition-colors hover:text-amber-800"
                    >
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Call
                      </span>
                      <span>{page.phone}</span>
                    </a>
                  ) : (
                    <p className="text-slate-700">
                      Date indisponibile momentan
                    </p>
                  )}
                </ContactCard>
                <ContactCard
                  icon={<Mail className="h-5 w-5" aria-hidden="true" />}
                  label="Email"
                >
                  {page.email ? (
                    <a
                      href={`mailto:${page.email}`}
                      className="inline-flex items-center gap-2 break-all text-slate-900 transition-colors hover:text-amber-800"
                    >
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Mail
                      </span>
                      <span>{page.email}</span>
                    </a>
                  ) : (
                    <p className="text-slate-700">
                      Date indisponibile momentan
                    </p>
                  )}
                </ContactCard>
              </section>

              <section className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3 md:mb-12">
                <article className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-8 lg:col-span-2">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-800">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    Scrie-ne
                  </div>
                  <h2 className="mb-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                    Suntem disponibili pentru intrebari, parteneriate si
                    sprijin.
                  </h2>
                  <p className="mb-6 max-w-2xl text-slate-600 leading-relaxed">
                    Daca vrei sa afli mai multe despre activitatea asociatiei
                    sau cauti o modalitate concreta de implicare, foloseste
                    oricare dintre canalele de mai jos. Iti raspundem cat de
                    repede putem.
                  </p>
                  <div className="mb-8 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Claritate
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">
                        Raspunsuri simple si directe pentru orice intrebare.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Deschidere
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">
                        Discutam colaborari, voluntariat si initiative noi.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Promptitudine
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">
                        Canalul potrivit pentru urgente ramane telefonul.
                      </p>
                    </div>
                  </div>
                  <RichHtml
                    html={page.body}
                    className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-slate-900 prose-a:text-amber-800"
                  />
                </article>

                <aside className="overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,#7c2d12_0%,#9a3412_40%,#881337_100%)] p-6 text-white shadow-[0_20px_60px_rgba(124,45,18,0.28)] md:p-7">
                  <div className="mb-5 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm">
                    Raspuns rapid
                  </div>
                  <h3 className="mb-3 text-2xl font-bold tracking-tight">
                    Ia legatura cu noi prin canalul care ti se potriveste.
                  </h3>
                  <p className="mb-5 text-sm leading-relaxed text-amber-50/90">
                    Pentru solicitari urgente, foloseste telefonul sau emailul.
                    Revenim cat mai repede posibil.
                  </p>
                  <div className="mb-6 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                      Disponibilitate
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/90">
                      Pentru informatii generale, emailul ramane cea mai buna
                      optiune. Pentru urgente, suna direct.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {page.email && (
                      <a
                        href={`mailto:${page.email}`}
                        className="block w-full rounded-xl bg-white px-4 py-3 text-center font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                      >
                        Trimite email
                      </a>
                    )}
                    {page.phone && (
                      <a
                        href={`tel:${page.phone.replace(/\s+/g, "")}`}
                        className="block w-full rounded-xl bg-slate-900 px-4 py-3 text-center font-semibold text-white transition-colors hover:bg-slate-800"
                      >
                        Suna acum
                      </a>
                    )}
                  </div>
                </aside>
              </section>

              {hasEmbeddedMap && (
                <section className="mb-10">
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-800">
                        Locatie
                      </p>
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                        Unde ne gasesti
                      </h2>
                    </div>
                    <div className="hidden rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 md:inline-flex">
                      Vizita sau punct de intalnire
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] [&_iframe]:h-[360px] [&_iframe]:w-full md:[&_iframe]:h-[460px]">
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

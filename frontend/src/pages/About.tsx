import { usePage } from "../hooks/usePage";
import { Meta } from "../components/seo/Meta";
import { ContentState } from "../components/ui/ContentState";
import { Link } from "react-router-dom";
import { PageHero } from "../components/ui/PageHero";
import { ImageGallery } from "../components/ui/ImageGallery";
import { RichHtml } from "../components/ui/RichHtml";
import { excerptFromHtml } from "../utils/content";
import { buildCreativeWorkMeta } from "../utils/seo";

function HeartIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      aria-hidden="true"
    >
      <path d="M12 21s-6.5-4.35-9-8.68C.78 8.56 2.03 4 6.4 4c2.16 0 3.78 1.06 4.6 2.45C11.82 5.06 13.44 4 15.6 4 19.97 4 21.22 8.56 21 12.32 18.5 16.65 12 21 12 21Z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      aria-hidden="true"
    >
      <path d="m12 3 2.8 5.67L21 9.6l-4.5 4.38 1.06 6.2L12 17.2l-5.56 2.98 1.06-6.2L3 9.6l6.2-.93Z" />
    </svg>
  );
}

function CommunityIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M20 8v6m3-3h-6" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.6 5.4-5.4 2.6 2.6-5.4 5.4-2.6Z" />
    </svg>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_16px_45px_rgba(15,23,42,0.07)] transition-transform duration-300 hover:-translate-y-1">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 ring-1 ring-amber-200">
        {icon}
      </div>
      <h2 className="text-xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
    </article>
  );
}

export default function About() {
  const { data, loading, error, reload } = usePage("about");
  const seo = data
    ? buildCreativeWorkMeta({
        title: data.title,
        path: "/about",
        description: excerptFromHtml(data.body, 200),
        image: data.heroImageUrl || undefined,
        dateModified: data.updatedAt,
      })
    : null;

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_24%),radial-gradient(circle_at_85%_15%,rgba(251,146,60,0.12),transparent_22%),linear-gradient(180deg,rgba(255,251,235,0.88)_0%,#ffffff_36%,#fff8f1_100%)] py-16 md:py-24">
      <div className="pointer-events-none absolute left-1/2 top-24 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-200/20 blur-3xl" />
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
                title={page.title || "Despre noi"}
                subtitle="Afla povestea, misiunea si impactul pe care il construim impreuna in comunitate."
                imageUrl={page.heroImageUrl}
                badge="Asociatia Zambete Magice"
                minHeightClassName="min-h-[340px] md:min-h-[420px]"
                gradientClassName="bg-gradient-to-br from-amber-900 via-orange-800 to-rose-700"
              />

              <section className="mb-10 grid grid-cols-1 gap-5 md:mb-12 md:grid-cols-3">
                <ValueCard
                  icon={<HeartIcon />}
                  title="Misiune vie"
                  description="Construim proiecte care duc sprijinul concret mai aproape de copiii si familiile care au nevoie de el acum."
                />
                <ValueCard
                  icon={<CompassIcon />}
                  title="Directie clara"
                  description="Fiecare initiativa porneste din nevoi reale, obiective bine definite si dorinta de a obtine impact masurabil."
                />
                <ValueCard
                  icon={<CommunityIcon />}
                  title="Comunitate activa"
                  description="Voluntari, parteneri si donatori contribuie impreuna la proiecte care schimba experiente de viata."
                />
              </section>

              <section className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3 md:mb-14">
                <article className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-8 lg:col-span-2">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-800">
                    <StarIcon />
                    Cine suntem
                  </div>
                  <h2 className="mb-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                    O asociatie construita in jurul implicarii reale, nu doar al
                    intentiilor bune.
                  </h2>
                  <p className="mb-6 max-w-2xl text-slate-600 leading-relaxed">
                    Pagina aceasta spune povestea noastra, dar si felul in care
                    alegem sa lucram: aproape de comunitate, cu transparenta si
                    cu grija pentru fiecare rezultat concret pe care il putem
                    produce.
                  </p>
                  <RichHtml
                    html={page.body}
                    className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-slate-900 prose-strong:text-slate-900 prose-a:text-amber-800"
                  />
                </article>

                <aside className="space-y-6">
                  <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,#7c2d12_0%,#9a3412_42%,#881337_100%)] p-6 text-white shadow-[0_20px_60px_rgba(124,45,18,0.28)] md:p-7">
                    <div className="mb-5 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm">
                      Implicare
                    </div>
                    <h3 className="mb-3 text-2xl font-bold tracking-tight">
                      Fiecare gest mic poate produce schimbari mari.
                    </h3>
                    <p className="mb-6 text-sm leading-relaxed text-amber-50/90">
                      Fiecare contributie, fiecare distribuire si fiecare ora de
                      voluntariat adauga valoare reala pentru copii si familii.
                    </p>
                    <div className="space-y-3">
                      <Link
                        to="/campanii"
                        className="block w-full rounded-xl bg-white px-4 py-3 text-center font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                      >
                        Vezi campaniile active
                      </Link>
                      <Link
                        to="/contact"
                        className="block w-full rounded-xl bg-slate-900 px-4 py-3 text-center font-semibold text-white transition-colors hover:bg-slate-800"
                      >
                        Contacteaza-ne
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_16px_45px_rgba(15,23,42,0.07)]">
                    <h3 className="mb-4 text-lg font-bold tracking-tight text-slate-900">
                      Ce ne ghideaza
                    </h3>
                    <ul className="space-y-3 text-sm leading-relaxed text-slate-600">
                      <li className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                          <HeartIcon />
                        </span>
                        Empatie reala fata de oamenii pentru care construim
                        proiecte.
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                          <CompassIcon />
                        </span>
                        Claritate in obiective, comunicare si mod de lucru.
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                          <CommunityIcon />
                        </span>
                        Colaborare constanta cu sustinatori, voluntari si
                        parteneri.
                      </li>
                    </ul>
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

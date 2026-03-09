import { useHomepage } from "../hooks/useHomepage";
import { HeroSection } from "../components/homepage/HeroSection";
import { StatisticsSection } from "../components/homepage/StatisticsSection";
import { HowWeWorkSection } from "../components/homepage/HowWeWorkSection";
import { TransparencySection } from "../components/homepage/TransparencySection";
import { CampaignGrid } from "../components/campaigns/CampaignGrid";
import { Meta } from "../components/seo/Meta";
import { RichHtml } from "../components/ui/RichHtml";
import { excerptFromHtml } from "../utils/content";
import { buildCanonical, buildCreativeWork } from "../utils/seo";

export default function Home() {
  const { homepage, loading, error } = useHomepage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-700 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (error || !homepage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-6">😔</div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
            Eroare la încărcarea paginii
          </h2>
          <p className="text-slate-600 mb-6">
            {error ||
              "Nu am putut încărca conținutul. Vă rugăm încercați din nou."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-amber-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-amber-800 transition-colors duration-300 shadow"
          >
            Încearcă din nou
          </button>
        </div>
      </div>
    );
  }

  const handleCopyIban = async () => {
    if (!homepage.donationIban) return;
    try {
      await navigator.clipboard.writeText(homepage.donationIban);
      // Mic feedback vizual rapid (non intruziv)
      const el = document.createElement("div");
      el.textContent = "IBAN copiat";
      el.className =
        "fixed top-4 right-4 bg-amber-700 text-white px-4 py-2 rounded shadow-lg text-sm animate-fade-in";
      document.body.appendChild(el);
      setTimeout(() => {
        el.classList.add("opacity-0", "transition-opacity", "duration-500");
        setTimeout(() => el.remove(), 600);
      }, 1200);
    } catch (e) {
      console.error("Clipboard copy failed", e);
    }
  };

  return (
    <div className="homepage">
      <Meta
        title={homepage.seoTitle || homepage.heroTitle}
        description={
          homepage.seoDescription ||
          excerptFromHtml(homepage.heroDescription || "", 160) ||
          "Asociația Zâmbete Magice - Campanii umanitare pentru copii."
        }
        canonical={buildCanonical("/")}
        ogImage={homepage.seoSocialImage || undefined}
        jsonLd={buildCreativeWork({
          name: homepage.seoTitle || homepage.heroTitle,
          description:
            homepage.seoDescription ||
            excerptFromHtml(homepage.heroDescription || "", 200) ||
            "Asociația Zâmbete Magice - Campanii umanitare pentru copii.",
          image:
            homepage.seoSocialImage ||
            homepage.heroBackgroundImage ||
            undefined,
          url: buildCanonical("/"),
        })}
      />
      {/* Hero Section */}
      <HeroSection
        title={homepage.heroTitle}
        subtitle={homepage.heroSubtitle}
        description={homepage.heroDescription}
        ctaText={homepage.heroCtaText || "Vezi campaniile noastre"}
        ctaLink={homepage.heroCtaLink || "/campanii"}
        backgroundImage={homepage.heroBackgroundImage}
      />

      {/* Statistics */}
      <StatisticsSection
        yearsActive={homepage.statsYearsActive}
        totalBeneficiaries={homepage.statsTotalBeneficiaries}
        completedProjects={homepage.statsCompletedProjects}
        activeVolunteers={homepage.statsActiveVolunteers}
      />

      {/* How We Work */}
      <HowWeWorkSection
        title={homepage.howWeWorkTitle}
        description={homepage.howWeWorkDescription}
      />

      {/* Donation Section (Transfer Bancar) */}
      {homepage.donationIban && (
        <section className="py-20 bg-gradient-to-br from-amber-900 via-orange-800 to-rose-700 text-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                Donează prin transfer bancar
              </h2>
              <p className="text-amber-100 text-lg max-w-2xl mx-auto">
                Copiază IBAN-ul asociației și fă un transfer direct din
                aplicația ta bancară. Orice sumă contează.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 md:p-8 border border-white/20 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <p className="uppercase tracking-wider text-sm text-amber-200 font-semibold mb-2">
                    IBAN Asociație
                  </p>
                  <p className="font-mono text-xl md:text-2xl font-bold break-all">
                    {homepage.donationIban}
                  </p>
                  {homepage.donationBankName && (
                    <p className="mt-2 text-sm text-amber-100">
                      Bancă: {homepage.donationBankName}
                    </p>
                  )}
                  {homepage.donationBeneficiaryName && (
                    <p className="text-sm text-amber-100">
                      Beneficiar: {homepage.donationBeneficiaryName}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 flex items-center gap-3">
                  <button
                    onClick={handleCopyIban}
                    className="inline-flex items-center gap-2 bg-white text-amber-800 font-semibold px-5 py-3 rounded-full shadow hover:bg-amber-50 transition-colors"
                  >
                    <span>Copiază IBAN</span>
                  </button>
                </div>
              </div>

              {homepage.donationInstructions && (
                <RichHtml
                  html={homepage.donationInstructions}
                  className="text-amber-100 text-sm leading-relaxed border-t border-white/20 pt-4"
                />
              )}

              <div className="text-sm text-amber-100">
                <p>
                  Recomandare: adaugă la descrierea plății cuvântul DONATIE și
                  (opțional) numele campaniei pe care vrei să o susții.
                </p>
                {homepage.donationReferenceHint && (
                  <p className="mt-2 italic">
                    Referință sugerată: {homepage.donationReferenceHint}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Active Campaigns */}
      <section className="py-20 bg-[linear-gradient(180deg,#fff8f1_0%,#fffdf8_100%)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
              Campaniile noastre active
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Fiecare campanie este o oportunitate de a face o diferență în
              viața unui copil. Alege-ți modalitatea de a ajuta.
            </p>
          </div>
          <CampaignGrid />
        </div>
      </section>

      {/* Impact Gallery placeholder */}
      {homepage.impactGalleryTitle && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
              {homepage.impactGalleryTitle}
            </h2>
            {homepage.impactGalleryDescription && (
              <RichHtml
                html={homepage.impactGalleryDescription}
                className="text-xl text-slate-600 max-w-3xl mx-auto mb-12"
              />
            )}

            {/* Placeholder pentru galerie - va fi implementată când vom avea imagini */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-slate-100 rounded-2xl h-64 flex items-center justify-center border border-slate-200">
                <span className="text-slate-500">Galerie foto urmează</span>
              </div>
              {/* Testimoniale placeholder removed */}
              <div className="bg-slate-100 rounded-2xl h-64 flex items-center justify-center border border-slate-200">
                <span className="text-slate-500">Povești de succes</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Team placeholder */}
      {homepage.teamTitle && (
        <section className="py-20 bg-gradient-to-br from-amber-50/70 to-rose-50/60">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
              {homepage.teamTitle}
            </h2>
            {homepage.teamDescription && (
              <RichHtml
                html={homepage.teamDescription}
                className="text-xl text-slate-600 max-w-3xl mx-auto mb-12"
              />
            )}

            {/* Placeholder pentru echipă */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                >
                  <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Membru echipă
                  </h3>
                  <p className="text-slate-600 text-sm">Funcție în asociație</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Transparency */}
      <TransparencySection title={homepage.transparencyTitle} />
    </div>
  );
}

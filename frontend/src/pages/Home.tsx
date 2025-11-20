import { useHomepage } from "../hooks/useHomepage";
import { HeroSection } from "../components/homepage/HeroSection";
import { StatisticsSection } from "../components/homepage/StatisticsSection";
import { HowWeWorkSection } from "../components/homepage/HowWeWorkSection";
import { TransparencySection } from "../components/homepage/TransparencySection";
import { CampaignGrid } from "../components/campaigns/CampaignGrid";
import { SEO } from "../components/SEO";
import { LogoReadableBanner } from "../components/homepage/LogoReadableBanner";

export default function Home() {
  const { homepage, loading, error } = useHomepage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (error || !homepage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-6">😔</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Eroare la încărcarea paginii
          </h2>
          <p className="text-gray-600 mb-6">
            {error ||
              "Nu am putut încărca conținutul. Vă rugăm încercați din nou."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors duration-300"
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
        "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg text-sm animate-fade-in";
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
      <SEO
        title={homepage.seoTitle || homepage.heroTitle}
        description={
          homepage.seoDescription ||
          homepage.heroDescription ||
          "Asociația Zâmbete Magice - Campanii umanitare pentru copii."
        }
        image={homepage.seoSocialImage}
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

      {/* Readable Logo Banner */}
      <LogoReadableBanner />

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
        <section className="py-20 bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Donează prin transfer bancar
              </h2>
              <p className="text-purple-100 text-lg max-w-2xl mx-auto">
                Copiază IBAN-ul asociației și fă un transfer direct din
                aplicația ta bancară. Orice sumă contează.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 md:p-8 border border-white/20 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <p className="uppercase tracking-wider text-sm text-purple-200 font-semibold mb-2">
                    IBAN Asociație
                  </p>
                  <p className="font-mono text-xl md:text-2xl font-bold break-all">
                    {homepage.donationIban}
                  </p>
                  {homepage.donationBankName && (
                    <p className="mt-2 text-sm text-purple-200">
                      Bancă: {homepage.donationBankName}
                    </p>
                  )}
                  {homepage.donationBeneficiaryName && (
                    <p className="text-sm text-purple-200">
                      Beneficiar: {homepage.donationBeneficiaryName}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 flex items-center gap-3">
                  <button
                    onClick={handleCopyIban}
                    className="inline-flex items-center gap-2 bg-white text-purple-700 font-semibold px-5 py-3 rounded-full shadow hover:bg-purple-50 transition-colors"
                  >
                    <span>Copiază IBAN</span>
                  </button>
                </div>
              </div>

              {homepage.donationInstructions && (
                <div
                  className="text-purple-100 text-sm leading-relaxed border-t border-white/20 pt-4"
                  dangerouslySetInnerHTML={{
                    __html: homepage.donationInstructions,
                  }}
                />
              )}

              <div className="text-sm text-purple-100">
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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Campaniile noastre active
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {homepage.impactGalleryTitle}
            </h2>
            {homepage.impactGalleryDescription && (
              <div
                className="text-xl text-gray-600 max-w-3xl mx-auto mb-12"
                dangerouslySetInnerHTML={{
                  __html: homepage.impactGalleryDescription,
                }}
              />
            )}

            {/* Placeholder pentru galerie - va fi implementată când vom avea imagini */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <span className="text-gray-500">Galerie foto urmează</span>
              </div>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <span className="text-gray-500">Testimoniale</span>
              </div>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <span className="text-gray-500">Povești de succes</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Team placeholder */}
      {homepage.teamTitle && (
        <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {homepage.teamTitle}
            </h2>
            {homepage.teamDescription && (
              <div
                className="text-xl text-gray-600 max-w-3xl mx-auto mb-12"
                dangerouslySetInnerHTML={{ __html: homepage.teamDescription }}
              />
            )}

            {/* Placeholder pentru echipă */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Membru echipă
                  </h3>
                  <p className="text-gray-600 text-sm">Funcție în asociație</p>
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

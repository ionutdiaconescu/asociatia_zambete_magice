import { useParams, Link } from "react-router-dom";
import { useCampaign } from "../hooks/useCampaign";
import { formatRON } from "../utils/format";
import { ArrowLeft, Calendar, Target, Users, Share2 } from "lucide-react";
import { RichHtml } from "../components/ui/RichHtml";
import { Meta } from "../components/seo/Meta";
import { buildWebPageMeta } from "../utils/seo";

export default function CampaignDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: campaign, loading, error } = useCampaign(slug!);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign?.title || "Campanie",
          text: campaign?.shortDescription || "Susține această campanie",
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard when share is cancelled or unsupported by browser context.
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      window.alert("Link-ul campaniei a fost copiat.");
    } catch {
      window.alert("Nu am putut copia link-ul.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Loading skeleton */}
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-8"></div>
              <div className="h-64 bg-slate-200 rounded-2xl mb-8"></div>
              <div className="h-12 bg-slate-200 rounded w-2/3 mb-4"></div>
              <div className="h-32 bg-slate-200 rounded mb-8"></div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="h-24 bg-slate-200 rounded"></div>
                <div className="h-24 bg-slate-200 rounded"></div>
                <div className="h-24 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-6">😔</div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
            Campania nu a fost găsită
          </h2>
          <p className="text-slate-600 mb-6">
            {error ||
              "Campania pe care o căutați nu există sau a fost ștearsă."}
          </p>
          <Link
            to="/campanii"
            className="inline-flex items-center bg-slate-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-slate-800 transition"
          >
            Vezi toate campaniile
          </Link>
        </div>
      </div>
    );
  }

  const progressPercentage = campaign.progressPercent ?? 0;
  const canDonateOnline = campaign.isActiveNow === true;
  const seo = buildWebPageMeta({
    title: campaign.title,
    path: `/campanii/${campaign.slug}`,
    description: campaign.shortDescription,
    image: campaign.coverImage || undefined,
  });

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf2_0%,#ffffff_52%,#fff8ef_100%)]">
      <Meta
        title={campaign.title}
        description={campaign.shortDescription}
        canonical={seo.canonical}
        ogImage={campaign.coverImage || undefined}
        ogType="article"
        jsonLd={seo.jsonLd}
      />
      {/* Header cu navigare înapoi */}
      <div className="bg-white/90 border-b border-slate-200 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/campanii"
            className="inline-flex items-center text-slate-600 hover:text-amber-800 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la campanii
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_12px_36px_rgba(15,23,42,0.10)] overflow-hidden mb-8">
            {campaign.coverImage && (
              <div className="h-64 md:h-80 overflow-hidden">
                <img
                  src={campaign.coverImage}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-5 sm:p-8">
              <h1 className="mb-4 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl md:text-5xl">
                {campaign.title}
              </h1>

              <p className="mb-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
                {campaign.shortDescription}
              </p>

              {/* Progress section */}
              <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-lg font-semibold text-slate-900">
                    Progres
                  </span>
                  <span className="text-2xl font-bold text-amber-700">
                    {progressPercentage}%
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-4 mb-4">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-rose-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>

                <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    <span className="font-semibold text-amber-700">
                      {formatRON(campaign.raised)}
                    </span>{" "}
                    strânși
                  </span>
                  <span>
                    Țintă:{" "}
                    <span className="font-semibold">
                      {formatRON(campaign.goal)}
                    </span>
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row">
                {canDonateOnline ? (
                  <Link
                    to={`/donate?campaign=${campaign.id}`}
                    className="flex-1 inline-flex items-center justify-center bg-slate-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-800 transition shadow"
                  >
                    Donează acum
                  </Link>
                ) : (
                  <div className="flex-1 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-4 text-center text-sm font-medium text-amber-900">
                    Această campanie este în istoric și nu mai acceptă donații
                    online.
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-4 border-2 border-slate-300 rounded-full font-semibold hover:border-amber-700 hover:text-amber-800 transition-colors duration-300"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Distribuie
                </button>
              </div>
            </div>
          </div>

          {/* Stats cards */}
          <div className="mb-8 grid gap-4 sm:gap-6 md:grid-cols-3">
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-sm">
              <Target className="w-8 h-8 text-amber-700 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {formatRON(campaign.goal)}
              </div>
              <div className="text-slate-600">Ținta campaniei</div>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-sm">
              <Users className="w-8 h-8 text-rose-700 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {campaign.donorCount || 0}
              </div>
              <div className="text-slate-600">Donatori</div>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-sm">
              <Calendar className="w-8 h-8 text-orange-700 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {campaign.daysLeft || "Nelimitat"}
              </div>
              <div className="text-slate-600">Zile rămase</div>
            </div>
          </div>

          {/* Descrierea completă */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
              Despre această campanie
            </h2>

            {campaign.description ? (
              <RichHtml
                html={campaign.description}
                className="prose prose-lg max-w-none text-slate-700 leading-relaxed"
              />
            ) : (
              <p className="text-slate-600 text-lg leading-relaxed">
                {campaign.shortDescription}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

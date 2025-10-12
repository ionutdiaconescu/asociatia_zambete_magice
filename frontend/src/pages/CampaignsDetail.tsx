import { useParams, Link } from "react-router-dom";
import { useCampaign } from "../hooks/useCampaign";
import { formatRON } from "../utils/format";
import { ArrowLeft, Calendar, Target, Users, Share2 } from "lucide-react";
import { Meta } from "../components/seo/Meta";
import { Section } from "../components/ui/Section";
import { Progress } from "../components/ui/Progress";

export default function CampaignDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: campaign, loading, error } = useCampaign(slug!);

  if (loading) {
    return (
      <>
        <Meta title="Se încarcă..." />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
                <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
                <div className="h-12 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded mb-8"></div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !campaign) {
    return (
      <>
        <Meta title="Campanie nu a fost găsită" />
        <Section
          title="Campanie nu a fost găsită"
          description={
            error || "Campania pe care o căutați nu există sau a fost ștearsă."
          }
        >
          <div className="text-center">
            <div className="text-6xl mb-6">😔</div>
            <Link
              to="/campaigns"
              className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors duration-300"
            >
              Vezi toate campaniile
            </Link>
          </div>
        </Section>
      </>
    );
  }

  const progressPercentage = Math.round(
    (campaign.raised / campaign.goal) * 100
  );

  return (
    <>
      <Meta title={campaign.title} description={campaign.shortDescription} />

      {/* Header cu navigare înapoi */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/campaigns"
            className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la campanii
          </Link>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Hero section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
              {campaign.coverImage && (
                <div className="h-64 md:h-80 overflow-hidden">
                  <img
                    src={campaign.coverImage}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {campaign.title}
                </h1>

                <p className="text-xl text-gray-600 mb-6">
                  {campaign.shortDescription}
                </p>

                {/* Progress section cu componenta ta */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">
                      Progres
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {progressPercentage}%
                    </span>
                  </div>

                  <Progress
                    value={campaign.raised}
                    max={campaign.goal}
                    srLabel={`Progres strângere fonduri: ${progressPercentage}%`}
                    heightClass="h-4"
                  />

                  <div className="flex justify-between text-sm text-gray-600 mt-4">
                    <span>
                      <span className="font-semibold text-green-600">
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
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 bg-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-700 transition-colors duration-300 shadow-lg hover:shadow-xl">
                    Donează acum
                  </button>
                  <button className="flex items-center justify-center px-6 py-4 border-2 border-gray-300 rounded-full font-semibold hover:border-purple-600 hover:text-purple-600 transition-colors duration-300">
                    <Share2 className="w-5 h-5 mr-2" />
                    Distribuie
                  </button>
                </div>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                <Target className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatRON(campaign.goal)}
                </div>
                <div className="text-gray-600">Ținta campaniei</div>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {campaign.donorCount || 0}
                </div>
                <div className="text-gray-600">Donatori</div>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {campaign.daysLeft || "Nelimitat"}
                </div>
                <div className="text-gray-600">Zile rămase</div>
              </div>
            </div>

            {/* Descrierea completă */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Despre această campanie
              </h2>

              {campaign.description ? (
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: campaign.description }}
                />
              ) : (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {campaign.shortDescription}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

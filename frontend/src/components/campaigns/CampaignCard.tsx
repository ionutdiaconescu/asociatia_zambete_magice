import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Progress } from "../ui/Progress";
import type { CampaignSummary } from "../../types/Campaign";
import { formatRON, formatPercent } from "../../utils/format";

interface CampaignCardProps {
  campaign: CampaignSummary;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const percent =
    (campaign.progressPercent ??
      parseInt(formatPercent(campaign.raised, campaign.goal))) + "%";

  return (
    <Link to={`/campaigns/${campaign.slug}`} className="block group">
      <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
        {campaign.coverImage && (
          <div className="overflow-hidden rounded-t-md -mx-5 -mt-5 mb-4">
            <img
              src={campaign.coverImage}
              alt={campaign.title}
              className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        <CardHeader className="mb-2">
          <CardTitle className="line-clamp-2 text-lg group-hover:text-blue-600 transition-colors">
            {campaign.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 flex-grow">
          <p className="text-sm text-gray-600 line-clamp-3">
            {campaign.shortDescription}
          </p>
          <div className="mt-auto space-y-2">
            <Progress
              value={campaign.raised}
              max={campaign.goal}
              srLabel={`Progres strângere fonduri: ${percent}`}
              heightClass="h-2"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>
                {formatRON(campaign.raised)} strânși din{" "}
                {formatRON(campaign.goal)}
              </span>
              <span className="font-medium text-gray-800">{percent}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function CampaignCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 h-64 flex flex-col gap-3">
      <div className="h-32 w-full rounded-md bg-gray-200" />
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
      <div className="h-4 w-1/2 bg-gray-200 rounded" />
      <div className="mt-auto h-3 w-full bg-gray-100 rounded" />
    </div>
  );
}

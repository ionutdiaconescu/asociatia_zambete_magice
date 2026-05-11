import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Progress } from "../ui/Progress";
import type { CampaignSummary } from "../../types/campaign";
import { formatRON, formatPercent } from "../../utils/format";

interface CampaignCardProps {
  campaign: CampaignSummary;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const percent =
    (campaign.progressPercent ??
      parseInt(formatPercent(campaign.raised, campaign.goal))) + "%";

  return (
    <Card className="flex flex-col h-full border-slate-200/90 transition group hover:scale-[1.015]">
      {campaign.coverImage && (
        <div className="overflow-hidden rounded-t-2xl -mx-6 -mt-6 mb-4">
          <img
            src={campaign.coverImage}
            alt={campaign.title}
            className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <CardHeader className="mb-2">
        <CardTitle className="line-clamp-2 text-lg transition-colors hover:text-amber-800">
          <Link
            to={`/campanii/${campaign.slug}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
          >
            {campaign.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-grow">
        <p className="text-sm text-slate-600 line-clamp-3">
          {campaign.shortDescription}
        </p>
        <div className="mt-auto space-y-2">
          <Progress
            value={campaign.raised}
            max={campaign.goal}
            srLabel={`Progres strângere fonduri: ${percent}`}
            heightClass="h-2"
          />
          <div className="flex flex-col gap-1 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span className="break-words">
              {formatRON(campaign.raised)} strânși din{" "}
              {formatRON(campaign.goal)}
            </span>
            <span className="font-semibold text-slate-800 sm:text-right">
              {percent}
            </span>
          </div>
          <Link
            to={`/campanii/${campaign.slug}`}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            Vezi detalii
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function CampaignCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white/90 p-5 h-64 flex flex-col gap-3 shadow-sm">
      <div className="h-32 w-full rounded-xl bg-slate-200" />
      <div className="h-4 w-3/4 bg-slate-200 rounded" />
      <div className="h-4 w-1/2 bg-slate-200 rounded" />
      <div className="mt-auto h-3 w-full bg-slate-100 rounded" />
    </div>
  );
}

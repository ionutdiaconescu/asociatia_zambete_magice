import type { CampaignSummary, EnhancedCampaign } from "../types/campaign";

export function computeProgress(raised: number, goal: number): number {
  if (!goal || goal <= 0) return 0;
  const pct = Math.round((raised / goal) * 100);
  return Math.min(100, Math.max(0, pct));
}

function isPastEndDate(endDate?: string) {
  if (!endDate) return false;

  const end = new Date(`${endDate}T23:59:59`);
  if (Number.isNaN(end.getTime())) return false;

  return end.getTime() < Date.now();
}

export function enhanceCampaign<
  T extends {
    raised: number;
    goal: number;
    status?: string;
    endDate?: string;
  },
>(c: T): EnhancedCampaign<T> {
  const progressPercent = computeProgress(c.raised, c.goal);
  const remainingRaw = c.goal - c.raised;
  const normalizedStatus = String(c.status || "")
    .trim()
    .toLowerCase();
  const isCompleted = c.goal > 0 && c.raised >= c.goal;
  const historicalByStatus =
    normalizedStatus === "completed" || normalizedStatus === "closed";
  const historicalByDate = isPastEndDate(c.endDate);
  const isHistorical = historicalByStatus || historicalByDate || isCompleted;

  return Object.assign({}, c, {
    progressPercent,
    remaining: remainingRaw > 0 ? remainingRaw : 0,
    isCompleted,
    isActiveNow: !isHistorical,
    isHistorical,
  });
}

export function enhanceMany(
  campaigns: CampaignSummary[],
): EnhancedCampaign<CampaignSummary>[] {
  return campaigns.map((c) => enhanceCampaign(c));
}

export function isCampaignActive<T extends { isActiveNow?: boolean }>(
  campaign: T,
) {
  return campaign.isActiveNow === true;
}

export function isCampaignHistorical<T extends { isHistorical?: boolean }>(
  campaign: T,
) {
  return campaign.isHistorical === true;
}

export function getActiveCampaigns<T extends { isActiveNow?: boolean }>(
  campaigns: T[] | null | undefined,
) {
  return (campaigns || []).filter(isCampaignActive);
}

export function getHistoricalCampaigns<T extends { isHistorical?: boolean }>(
  campaigns: T[] | null | undefined,
) {
  return (campaigns || []).filter(isCampaignHistorical);
}

import type { CampaignSummary } from "../types/campaign";

export function computeProgress(raised: number, goal: number): number {
  if (!goal || goal <= 0) return 0;
  const pct = Math.round((raised / goal) * 100);
  return Math.min(100, Math.max(0, pct));
}

export function enhanceCampaign<T extends { raised: number; goal: number }>(
  c: T
): T & { progressPercent: number; remaining: number; isCompleted: boolean } {
  const progressPercent = computeProgress(c.raised, c.goal);
  const remainingRaw = c.goal - c.raised;
  return Object.assign({}, c, {
    progressPercent,
    remaining: remainingRaw > 0 ? remainingRaw : 0,
    isCompleted: c.goal > 0 && c.raised >= c.goal,
  });
}

export function enhanceMany(campaigns: CampaignSummary[]): CampaignSummary[] {
  return campaigns.map((c) => enhanceCampaign(c));
}

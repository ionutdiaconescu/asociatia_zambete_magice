export interface CampaignDerivedState {
  progressPercent?: number; // 0..100 (rounded integer)
  remaining?: number; // goal - raised (never negative)
  isCompleted?: boolean; // true if raised >= goal and goal>0
  isActiveNow?: boolean;
  isHistorical?: boolean;
}

export type EnhancedCampaign<T> = T & {
  progressPercent: number;
  remaining: number;
  isCompleted: boolean;
  isActiveNow: boolean;
  isHistorical: boolean;
};

export interface Campaign extends CampaignDerivedState {
  id: number;
  slug: string;
  title: string;
  shortDescription: string;
  description?: string;
  goal: number;
  raised: number;
  status: string;
  coverImage: string | null;
  donorCount?: number;
  daysLeft?: number | string;
  isFeatured?: boolean;
  startDate?: string; // ISO date (YYYY-MM-DD)
  endDate?: string; // ISO date (YYYY-MM-DD)
}
export interface CampaignSummary extends CampaignDerivedState {
  id: string;
  title: string;
  slug: string; // friendly identifier (fallback to id if missing)
  shortDescription: string;
  goal: number;
  raised: number; // may be 0 until donation aggregation implemented
  status?: string; // mapped from Strapi 'stare' / 'status'
  coverImage?: string;
  updatedAt?: string; // last update timestamp
  isFeatured?: boolean; // featured flag
  startDate?: string;
  endDate?: string;
}

export interface CampaignDetail extends CampaignSummary {
  body: string;
  createdAt: string;
  updatedAt: string; // ensure non-optional in detail
}

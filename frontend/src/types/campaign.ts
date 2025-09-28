export interface CampaignSummary {
  id: string;
  title: string;
  slug: string; // friendly identifier (fallback to id if missing)
  shortDescription: string;
  goal: number;
  raised: number; // may be 0 until donation aggregation implemented
  status?: string; // mapped from Strapi 'stare' / 'status'
  coverImage?: string;
  updatedAt?: string; // last update timestamp
  // Computed/enhanced fields (optional so older mapping code still compiles):
  progressPercent?: number; // 0..100 (rounded integer)
  remaining?: number; // goal - raised (never negative)
  isCompleted?: boolean; // true if raised >= goal and goal>0
}

export interface CampaignDetail extends CampaignSummary {
  body: string;
  createdAt: string;
  updatedAt: string; // ensure non-optional in detail
}

// Generic async state shape (kept here for reuse by related hooks)
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

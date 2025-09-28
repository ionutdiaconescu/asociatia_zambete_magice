export interface StaticPage {
  id: string;
  slug: string;
  title: string;
  body: string;
  updatedAt?: string;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

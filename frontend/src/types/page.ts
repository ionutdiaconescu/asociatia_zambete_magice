export interface StaticPage {
  id: string;
  slug: string;
  title: string;
  body: string;
  updatedAt?: string;
  heroImageUrl?: string | null;
  galleryUrls?: string[];
  // Contact-specific optional fields
  address?: string;
  phone?: string;
  email?: string;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

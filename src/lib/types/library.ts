// Types for /library route data
import type { Picture } from 'vite-imagetools';

export type ContentType = 'book' | 'webpage' | 'photograph';

export type LibraryItem = {
  id: string;
  type: ContentType;
  title: string;
  published: string; // ISO date string - when content was published
  published_by: string; // Authors, creators, etc.
  thumbnail?: string | Picture; // External URL (books) or enhanced-img import Picture
  note: string; // Personal review/thoughts
};

// Data loading types
export type LibraryData = {
  items: LibraryItem[];
  buildTime: string;
};

// Filter helpers
export type FilterType = ContentType | 'all';

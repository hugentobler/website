// Library content types for modern Svelte 5 app

export type ContentType = 'book' | 'webpage' | 'photograph';

export type BaseLibraryItem = {
  id: string;
  type: ContentType;
  title: string;
  date: string; // ISO date string
  review?: string; // Optional personal review/thoughts
};

export type Author = {
  id: string;
  name: string;
};

export type Book = BaseLibraryItem & {
  type: 'book';
  subtitle?: string;
  description?: string;
  slug: string;
  cover?: string;
  authors: Author[];
  finishedDate?: string;
};

export type Webpage = BaseLibraryItem & {
  type: 'webpage';
  content: string;
  tags: string[];
  slug: string;
  url?: string; // Optional external URL
};

export type Photograph = BaseLibraryItem & {
  type: 'photograph';
  // For enhanced-img, we'll use local imports
  imagePath: string; // Path to image in $lib/images/
  caption?: string;
  location?: string;
  camera?: string;
  // Enhanced-img import for optimized images
  enhancedImage?: any; // Enhanced image import
  // Alternative: external URL for remote photos
  externalUrl?: string;
};

export type LibraryItem = Book | Webpage | Photograph;

// Data loading types
export type LibraryData = {
  items: LibraryItem[];
  buildTime: string;
};

// Filter helpers
export type FilterType = ContentType | 'all';

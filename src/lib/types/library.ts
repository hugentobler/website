import type { Picture } from "vite-imagetools";

// Possible item types
export type ItemType = "book" | "webpage" | "photograph";

// Individual item
export type Item = {
  id: string;
  type: ItemType;
  title: string;
  published: string; // ISO date string - when content was published
  published_by: string; // Authors, creators, etc.
  decade: number; // Decade when content was published (e.g., 2020, 2010)
  thumbnail?: string | Picture; // External URL (books) or enhanced-img import Picture
  note?: string; // Review, thoughts, description etc.
};

import type { Picture } from "vite-imagetools";

// Possible item types
export const ITEM_TYPE = ["book", "webpage", "photograph"] as const;
export type ItemType = (typeof ITEM_TYPE)[number];

// Individual item
export type Item = {
  id: string;
  type: ItemType;
  title: string;
  published: string; // ISO date string - when content was published
  published_by: string; // Authors, creators, etc.
  thumbnail?: string | Picture; // External URL (books) or enhanced-img import Picture
  note: string; // Review, thoughts, description etc.
};

// Filters
export type ItemTypeFilter = ItemType | "all";
export type ItemDecadeFilter = string | "all";

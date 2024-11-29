import type { Component } from "svelte";

// declare frontmatter type
export type Frontmatter = {
  slug: string;
  title: string;
  count: number;
  color: string;
  list: string[];
};

// declare mdxvex module type, mdxvex docs mentioned declaring an ambient module, but couldn't get it to work in svelte 5
export interface MarkdownFile {
  default: Component;
  metadata: Omit<Frontmatter, "slug">;
}

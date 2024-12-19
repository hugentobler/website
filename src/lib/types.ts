import type { Component, Snippet } from 'svelte';

// declare frontmatter type
export type Frontmatter = {
  slug: string;
  title: string;
  description?: string;
  published: string;
  updated?: string;
  layout?: string;
};

// declare processed data from MDSvex - it reformats the dates
export interface MarkdownFile {
  default: Component;
  metadata: Omit<Frontmatter, 'slug'>;
}

// declare props for mdxvex layouts
export interface MarkdownLayoutProps extends Omit<Frontmatter, 'slug'> {
  children: Snippet;
}

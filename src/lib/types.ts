import type { Component, Snippet } from 'svelte';

import type { Tag } from '@markdoc/markdoc';

// declare frontmatter type
export type Frontmatter = {
  slug: string;
  title: string;
  description?: string;
  published: string;
  updated?: string;
  layout?: string;
};

// declare processed data from MDSvex
// MDSvex auto converts valid date strings into ISO format
// export interface MarkdownFile {
//   default: Component;
//   metadata: Omit<Frontmatter, 'slug'>;
// }

// declare markdoc processed content
export interface MarkdocFile {
  default: Tag;
  frontmatter: Omit<Frontmatter, 'slug'>;
}

// declare props for mdxvex layouts
export interface MarkdownLayoutProps extends Omit<Frontmatter, 'slug'> {
  children: Snippet;
}

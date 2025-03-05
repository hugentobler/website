import type { Component } from 'svelte';

import type { Tag } from '@markdoc/markdoc';

export type Frontmatter = {
  slug: string;
  title: string;
  description?: string;
  published: string;
  updated?: string;
  layout?: string;
};

export interface MarkdocFile {
  default: Tag;
  frontmatter: Omit<Frontmatter, 'slug'>;
}

export interface MarkdocPageData {
  content: Tag;
  frontmatter: Omit<Frontmatter, 'slug'>;
  slug: string;
}

export interface MarkdocPageProps {
  components?: Record<string, Component>;
  data: MarkdocPageData;
}

import type { Component } from 'svelte';

// declare ISO 8601 date string type
type Year = `${number}${number}${number}${number}`;
type Month = `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | `1${0 | 1 | 2}`;
type Day =
  | `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
  | `${1 | 2}${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
  | `3${0 | 1}`;
type ISODateString = `${Year}-${Month}-${Day}`;

// declare frontmatter type
export type Frontmatter = {
  slug: string;
  title: string;
  description?: string;
  published: ISODateString;
  updated?: ISODateString;
};

// declare mdxvex module type, mdxvex docs mentioned declaring an ambient module, but couldn't get it to work in svelte 5
export interface MarkdownFile {
  default: Component;
  metadata: Omit<Frontmatter, 'slug'>;
}

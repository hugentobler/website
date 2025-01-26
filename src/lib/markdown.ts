import { error } from '@sveltejs/kit';

import type { Frontmatter, MarkdownFile } from '$lib/types';

// type guard for date, mdxvex exports date as iso date string
const isValidDate = (date: string): boolean => {
  return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(T\d{2}:\d{2}:\d{2}\.\d{3}Z)?$/.test(date);
};

// runtime validation of dates in frontmatter and handle error
// only needed if not all markdown content will be pre-rendered
const validateDates = (slug: string, dates: (string | undefined)[]) => {
  for (const date of dates) {
    if (date && !isValidDate(date)) {
      throw error(422, `Invalid date format in ${slug}: ${date}`);
    }
  }
};

export const get = async (slug: string) => {
  const file: MarkdownFile = await import(`../markdown/${slug}.md`).catch(() => {
    throw error(404, `Content ${slug} not found`);
  });
  validateDates(slug, [file.metadata.published, file.metadata.updated]);
  return { content: file.default, frontmatter: file.metadata, slug };
};

export const list = async () => {
  const frontmatters: Frontmatter[] = [];
  let modules: Record<string, MarkdownFile>;

  try {
    modules = import.meta.glob('../markdown/*.md', {
      eager: true
    });
    // import multiple modules from fs, not lazy loaded
    // ref: https://vite.dev/guide/features.html#glob-import
  } catch {
    throw error(404, 'Markdown files not found');
  }

  for (const path in modules) {
    const file = modules[path];
    const slug = path.split('/').at(-1)?.replace('.md', '');

    if (file && typeof file === 'object' && 'metadata' in file && slug) {
      validateDates(slug, [file.metadata.published, file.metadata.updated]);

      const frontmatter = {
        ...file.metadata,
        slug
      } satisfies Frontmatter;
      // mdxvex exports .md file frontmatter as metadata
      // append slug to frontmatter
      frontmatters.push(frontmatter);
    }
  }
  return { frontmatters };
};

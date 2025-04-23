import { error } from '@sveltejs/kit';

import type { Frontmatter, MarkdocFile, MarkdocPageData } from './types';

// Eagerly import all markdown files
// Vite will preprocess the markdown files, see vite.config.ts
// const markdownModules = import.meta.glob('$lib/markdown/*.md', { eager: true });
// const validateDates = (slug: string, dates: string[]) => {
//   for (const date of dates) {
//     if (!date) continue;

//     const parsed = new Date(date);
//     if (isNaN(parsed.getTime())) {
//       throw error(422, `Invalid date in ${slug}: ${date}`);
//     }
//   }
// };

// Import a single markdown file
export const single = async (slug: string) => {
  try {
    const module = await import(`$lib/markdown/${slug}.md`);
    return {
      content: module.default,
      frontmatter: module.metadata
    };
  } catch (e) {
    throw error(404, e as Error);
  }
};
// const path = `/src/markdown/${slug}.md`;
// if (!(path in markdownModules)) {
//   throw error(404, `Content ${slug} not found`);
// }

// const file = markdownModules[path] as MarkdocFile;
// validateDates(slug, [file.frontmatter.published ?? '', file.frontmatter.updated ?? '']);

// return { content: file.default, frontmatter: file.frontmatter, slug } as MarkdocPageData;

// const file = markdownModules[path];
// return {
//   component: file.default,
//   slug
// };
// };

// Import a list of all markdown files
// export const all = async () => {
//   const frontmatters: Frontmatter[] = [];

//   for (const path in markdownModules) {
//     // const file = markdownModules[path] as MarkdocFile;
//     // const slug = path.split('/').at(-1)?.replace('.md', '');
//     // if (!slug) continue;

//     // validateDates(slug, [file.frontmatter.published ?? '', file.frontmatter.updated ?? '']);

//     // const frontmatter = {
//     //   ...file.frontmatter,
//     //   slug
//     // } satisfies Frontmatter;
//     const frontmatter = {
//       slug: path,
//       title: path
//     };

//     frontmatters.push(frontmatter);
//   }

//   return { frontmatters };
// };

import { error } from '@sveltejs/kit';
import type { MarkdocModule } from 'markdoc-svelte';

import type { EntryGenerator, PageLoad } from './$types';

const markdownModules = import.meta.glob('$lib/markdown/*.md');

export const load: PageLoad = async ({ params }) => {
  const slug = params.catchall;

  try {
    const markdown = (await import(`$lib/markdown/${slug}.md`)) as MarkdocModule;
    return { markdown };
  } catch {
    throw error(404, `Markdown file not found for slug "${slug}"`);
  }
};

// Prerender and export entries
export const prerender = true;

export const entries: EntryGenerator = async () => {
  const content = await Promise.all(
    Object.values(markdownModules).map(async (importModule) => {
      const module = (await importModule()) as MarkdocModule;
      return {
        catchall: module.slug
      };
    })
  );
  return content;
};

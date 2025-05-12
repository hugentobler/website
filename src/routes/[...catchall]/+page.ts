import { error } from '@sveltejs/kit';
import type { MarkdocModule } from 'markdoc-svelte';

import type { PageLoad } from './$types';

export const prerender = 'true';

export const load: PageLoad = async ({ params }) => {
  const { catchall: slug } = params;

  try {
    const markdoc = (await import(`$lib/markdown/${slug}.md`)) as MarkdocModule;
    return { markdoc };
  } catch {
    throw error(404, `Markdown file not found for slug “${slug}”`);
  }
};

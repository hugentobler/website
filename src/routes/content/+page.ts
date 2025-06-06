import type { MarkdocModule } from 'markdoc-svelte';

import type { PageLoad } from './$types';

const markdownModules = import.meta.glob('$lib/markdown/*.md');

export const load: PageLoad = async () => {
  const content = await Promise.all(
    Object.values(markdownModules).map(async (importModule) => {
      const module = (await importModule()) as MarkdocModule;

      return {
        slug: module.slug,
        frontmatter: module.frontmatter
      };
    })
  );

  return { content };
};

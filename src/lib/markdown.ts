import type { Frontmatter, MarkdownFile } from '$lib/types';

export const get = async (slug: string) => {
  const file: MarkdownFile = await import(`../markdown/${slug}.md`);

  return {
    content: file.default,
    frontmatter: file.metadata,
    slug
  };
};

export const list = async () => {
  const frontmatters: Frontmatter[] = [];

  const modules: Record<string, MarkdownFile> = import.meta.glob('../markdown/*.md', {
    eager: true
  });
  // import multiple modules from fs, not lazy loaded
  // ref: https://vite.dev/guide/features.html#glob-import

  for (const path in modules) {
    const file = modules[path];
    const slug = path.split('/').at(-1)?.replace('.md', '');

    if (file && typeof file === 'object' && 'metadata' in file && slug) {
      const metadata = file.metadata as Omit<Frontmatter, 'slug'>;
      // mdxvex exports .md file frontmatter as metadata
      const frontmatter = { ...metadata, slug } satisfies Frontmatter;
      // append slug to frontmatter
      frontmatters.push(frontmatter);
    }
  }
  return { frontmatters };
};

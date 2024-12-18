import type { MarkdownFile } from "$lib/types";
import { error } from "@sveltejs/kit";

export const load = async ({ params }) => {
  const { catchall } = params;

  try {
    const file: MarkdownFile = await import(`./markdown/${catchall}.md`);
    // dynamic import .md file using catchall slug

    return {
      content: file.default,
      frontmatter: file.metadata,
    };
  } catch {
    throw error(404, "Not found");
  }
};

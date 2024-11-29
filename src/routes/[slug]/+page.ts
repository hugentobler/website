import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const { slug } = params;

  try {
    const post = await import(`../../lib/posts/${slug}.md`);
    // dynamic import posts from lib/posts

    return {
      content: post.default,
      metadata: post.metadata,
    };
  } catch (e) {
    error(404, "Not found");
  }
};

import { json } from "@sveltejs/kit";
import type { Post } from "$lib/types";

/** Retrieves and processes markdown posts, extracting metadata and slugs from files in /src/lib/posts/ */
const getPosts = async () => {
  let posts: Post[] = [];

  const modules = import.meta.glob("/src/lib/posts/*.md", { eager: true });
  // Import multiple modules from fs, not lazy loaded
  // Ref: https://vite.dev/guide/features.html#glob-import

  for (const path in modules) {
    const file = modules[path];
    const slug = path.split("/").at(-1)?.replace(".md", "");

    if (file && typeof file === "object" && "metadata" in file && slug) {
      const metadata = file.metadata as Omit<Post, "slug">;
      // mdxvex exports .md file frontmatter as metadata
      const post = { ...metadata, slug } satisfies Post;
      posts.push(post);
    }
  }
  return posts;
};

/** GET handler for /posts */
const GET = async () => {
  const posts = await getPosts();
  return json(posts);
};

export { GET };

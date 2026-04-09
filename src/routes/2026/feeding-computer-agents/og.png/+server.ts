import { frontmatter } from "$lib/markdown/feeding-computer-agents.md";
import { generateOgImage } from "$lib/og";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
	const png = await generateOgImage({
		published: frontmatter?.published,
		title: frontmatter?.title ?? "Feeding Computer Agents",
	});

	return new Response(png, {
		headers: {
			"Cache-Control": "public, max-age=604800, immutable",
			"Content-Type": "image/png",
		},
	});
};

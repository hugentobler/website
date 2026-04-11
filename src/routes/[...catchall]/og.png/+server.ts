import { error } from "@sveltejs/kit";
import type { MarkdocModule } from "markdoc-svelte";
import { generateOgImage } from "$lib/og";
import type { RequestHandler } from "./$types";

const SLUG_ALIASES: Record<string, string> = {
	"2025/durable-ai-initiatives": "durable-ai-initiatives",
	"2026/feeding-computer-agents": "feeding-computer-agents",
};

export const prerender = true;

export const GET: RequestHandler = async ({ params }) => {
	const slug = SLUG_ALIASES[params.catchall] ?? params.catchall;

	let markdown: MarkdocModule;
	try {
		markdown = (await import(`$lib/markdown/${slug}.md`)) as MarkdocModule;
	} catch {
		throw error(404, `No content for "${params.catchall}"`);
	}

	const { frontmatter } = markdown;
	const png = await generateOgImage({
		published: frontmatter?.published,
		title: frontmatter?.title ?? slug,
	});

	return new Response(png, {
		headers: {
			"Cache-Control": "public, max-age=604800, immutable",
			"Content-Type": "image/png",
		},
	});
};

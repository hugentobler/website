import { error } from "@sveltejs/kit";
import type { MarkdocModule } from "markdoc-svelte";
import { generateOgImage } from "$lib/og";
import { liveWritings, slugAliases } from "$lib/writing";
import type { EntryGenerator, RequestHandler } from "./$types";

export const prerender = true;

// Tells the prerenderer which og.png URLs to build. SvelteKit's crawler
// doesn't follow `<meta og:image>`, so without this it never finds them.
export const entries: EntryGenerator = () =>
	liveWritings.map((w) => ({ catchall: `${w.year}/${w.slug}` }));

export const GET: RequestHandler = async ({ params }) => {
	const slug = slugAliases[params.catchall] ?? params.catchall;

	let markdown: MarkdocModule;
	try {
		markdown = (await import(`$lib/markdown/${slug}.md`)) as MarkdocModule;
	} catch {
		throw error(404, `No content for "${params.catchall}"`);
	}

	const { frontmatter } = markdown;
	const png = await generateOgImage({
		title: frontmatter?.title ?? slug,
		tldr: frontmatter?.tldr,
	});

	return new Response(png, {
		headers: {
			"Cache-Control": "public, max-age=604800, immutable",
			"Content-Type": "image/png",
		},
	});
};

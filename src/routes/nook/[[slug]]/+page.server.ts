import { error, redirect } from "@sveltejs/kit";
import { entries, slugs } from "$lib/nook";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ params }) => {
	// No slug → redirect to a random permalink
	if (!params.slug) {
		const slug = slugs[Math.floor(Math.random() * slugs.length)];
		redirect(302, `/nook/${slug}`);
	}

	const entry = entries.find((e) => e.slug === params.slug);
	if (!entry) throw error(404, `No entry "${params.slug}"`);

	// Pre-pick the next random entry for the shuffle button
	const others = slugs.filter((s) => s !== params.slug);
	const nextSlug =
		others.length > 0 ? others[Math.floor(Math.random() * others.length)] : params.slug;

	return { entry, nextSlug };
};

import { pickRecentVisitor } from "$lib/server/visitor";
import type { LayoutServerLoad } from "./$types";

// First-paint visitor for the footer. The client then takes over via a
// heartbeat to GET /api/visitor (see VisitorFeed.svelte), so this SSR value
// is only visible until the first successful poll.
export const load: LayoutServerLoad = async ({ platform, url }) => {
	const visitor = await pickRecentVisitor(platform?.env?.DB, url.pathname);
	return { visitor };
};

/**
 * One R2 object for an archive card.
 * Raw responses only: error() and redirect() drop Cache-Control.
 */

import { archiveObjectKey, contentTypeFor } from "$lib/archive/serve";
import { entries } from "$lib/nook";
import type { RequestHandler } from "./$types";

export const prerender = false;

const PLAIN = {
	"cache-control": "no-store",
	"content-type": "text/plain; charset=utf-8",
} as const;

function notFound(): Response {
	return new Response("Not found", { headers: PLAIN, status: 404 });
}

export const GET: RequestHandler = async ({ params, platform, request }) => {
	const captured = params.captured;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(captured)) return notFound();

	const entry = entries.find((candidate) => candidate.slug === params.slug);
	if (
		entry == null ||
		entry.kind !== "archive" ||
		entry.captured !== captured ||
		entry.archive == null
	) {
		return notFound();
	}

	const file = params.file;
	if (file == null || file === "" || file === ".") {
		return new Response(null, {
			headers: {
				"cache-control": "no-store",
				location: `/a/${entry.slug}/${entry.captured}/index.html`,
			},
			status: 308,
		});
	}

	const key = archiveObjectKey(entry.archive, file);
	if (key == null) return notFound();

	const bucket = platform?.env?.ARCHIVE;
	if (bucket == null) {
		return new Response("Archive binding unavailable", { headers: PLAIN, status: 500 });
	}

	const object = await bucket.get(key);
	if (object == null) return notFound();

	const contentType = contentTypeFor(file);
	const headers = new Headers({
		"cache-control": "public, max-age=31536000, immutable",
		"content-signal": "ai-train=no, search=no, ai-input=no",
		"content-type": contentType,
		etag: object.httpEtag,
		"x-content-type-options": "nosniff",
		"x-robots-tag": "noindex, nofollow",
	});
	if (contentType.startsWith("text/html")) {
		headers.set(
			"content-security-policy",
			"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'; object-src 'none'",
		);
	}

	if (request.headers.get("if-none-match") === object.httpEtag) {
		return new Response(null, { headers, status: 304 });
	}

	return new Response(object.body, { headers, status: 200 });
};

export function fallback() {
	return new Response("Method not allowed", {
		headers: {
			allow: "GET, HEAD",
			"cache-control": "no-store",
			"content-type": "text/plain; charset=utf-8",
		},
		status: 405,
	});
}

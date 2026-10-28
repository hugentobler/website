const CONTENT_TYPES: Record<string, string> = {
	avif: "image/avif",
	css: "text/css; charset=utf-8",
	gif: "image/gif",
	html: "text/html; charset=utf-8",
	ico: "image/x-icon",
	jpeg: "image/jpeg",
	jpg: "image/jpeg",
	js: "text/javascript; charset=utf-8",
	json: "application/json; charset=utf-8",
	mjs: "text/javascript; charset=utf-8",
	otf: "font/otf",
	pdf: "application/pdf",
	png: "image/png",
	svg: "image/svg+xml",
	ttf: "font/ttf",
	txt: "text/plain; charset=utf-8",
	webp: "image/webp",
	woff: "font/woff",
	woff2: "font/woff2",
	xml: "application/xml; charset=utf-8",
};

export function contentTypeFor(relative: string): string {
	const name = relative.slice(relative.lastIndexOf("/") + 1);
	const dot = name.lastIndexOf(".");
	if (dot < 0) return "application/octet-stream";
	const ext = name.slice(dot + 1).toLowerCase();
	return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

export function archiveObjectKey(archive: string, relative: string): string | null {
	for (const segment of relative.split("/")) {
		if (
			segment === "" ||
			segment === "." ||
			segment === ".." ||
			segment.includes("\\") ||
			segment.includes("%")
		) {
			return null;
		}
	}
	return `nook/${archive}/${relative}`;
}

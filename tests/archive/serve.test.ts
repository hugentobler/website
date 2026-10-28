import { describe, expect, it } from "vitest";
import { archiveObjectKey, contentTypeFor } from "../../src/lib/archive/serve";

const archive = "the-proportional-web/2026-10-28";

describe("archiveObjectKey", () => {
	it("joins the card prefix and the relative path", () => {
		expect(archiveObjectKey(archive, "src/demo/vitruvian-man.jpg")).toBe(
			"nook/the-proportional-web/2026-10-28/src/demo/vitruvian-man.jpg",
		);
		expect(archiveObjectKey(archive, "fonts/google-fonts.css")).toBe(
			`nook/${archive}/fonts/google-fonts.css`,
		);
	});

	it("builds the index.html key", () => {
		expect(archiveObjectKey(archive, "index.html")).toBe(
			"nook/the-proportional-web/2026-10-28/index.html",
		);
	});

	it("rejects .. segments", () => {
		expect(archiveObjectKey(archive, "..")).toBeNull();
		expect(archiveObjectKey(archive, "../bm-variable.woff2")).toBeNull();
		expect(archiveObjectKey(archive, "src/../index.html")).toBeNull();
		expect(archiveObjectKey(archive, "foo/bar/../../../x")).toBeNull();
	});

	it("rejects empty, dot, backslash, and percent segments", () => {
		expect(archiveObjectKey(archive, "")).toBeNull();
		expect(archiveObjectKey(archive, ".")).toBeNull();
		expect(archiveObjectKey(archive, "src//demo.css")).toBeNull();
		expect(archiveObjectKey(archive, "src/./demo.css")).toBeNull();
		expect(archiveObjectKey(archive, "src\\demo.css")).toBeNull();
		expect(archiveObjectKey(archive, "src/%2e%2e/demo.css")).toBeNull();
		expect(archiveObjectKey(archive, "index.html/")).toBeNull();
	});
});

describe("contentTypeFor", () => {
	it("maps extensions, including paths and an unknown or missing extension", () => {
		const types: Array<[string, string]> = [
			["index.html", "text/html; charset=utf-8"],
			["index.css", "text/css; charset=utf-8"],
			["index.js", "text/javascript; charset=utf-8"],
			["module.mjs", "text/javascript; charset=utf-8"],
			["data.json", "application/json; charset=utf-8"],
			["icon.svg", "image/svg+xml"],
			["image.png", "image/png"],
			["photo.jpg", "image/jpeg"],
			["photo.jpeg", "image/jpeg"],
			["Photo.JPEG", "image/jpeg"],
			["anim.gif", "image/gif"],
			["image.webp", "image/webp"],
			["image.avif", "image/avif"],
			["font.woff", "font/woff"],
			["fonts/face.woff2", "font/woff2"],
			["font.ttf", "font/ttf"],
			["font.otf", "font/otf"],
			["favicon.ico", "image/x-icon"],
			["notes.txt", "text/plain; charset=utf-8"],
			["feed.xml", "application/xml; charset=utf-8"],
			["doc.pdf", "application/pdf"],
			["src/demo/file.bin", "application/octet-stream"],
			["README", "application/octet-stream"],
		];

		for (const [path, type] of types) {
			expect(contentTypeFor(path)).toBe(type);
		}
	});
});

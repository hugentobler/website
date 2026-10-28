import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import {
	type ArchiveFetcher,
	type ArchiveFile,
	BROWSER_USER_AGENT,
	fetchArchive,
	interpretProbe,
	rewriteArchive,
	wranglerProbeCommand,
	wranglerPutCommand,
} from "../../src/lib/archive/rewrite";

const encode = (text: string): Uint8Array => new TextEncoder().encode(text);
const decode = (body: Uint8Array): string => new TextDecoder().decode(body);

function fixtureFetch(
	files: Record<string, { body: Uint8Array; contentType?: string | null; status?: number }>,
): { calls: string[]; fetch: ArchiveFetcher } {
	const calls: string[] = [];
	const fetch: ArchiveFetcher = async (url) => {
		calls.push(url);
		const hit = files[url];
		if (!hit) throw new Error(`unexpected fetch ${url}`);
		return {
			body: hit.body,
			contentType: hit.contentType ?? null,
			status: hit.status ?? 200,
			url,
		};
	};
	return { calls, fetch };
}

function documentFrom(html: string, url: string): Document {
	return new JSDOM(html, { url }).window.document;
}

function fileNamed(files: ArchiveFile[], path: string): ArchiveFile {
	const file = files.find((item) => item.path === path);
	if (!file) throw new Error(`missing ${path}`);
	return file;
}

describe("rewriteArchive", () => {
	it("rewrites subresources and leaves anchors and scripts alone", async () => {
		const page = "https://owickstrom.github.io/the-proportional-web/";
		const indexCss = [
			'/* @import "https://example.com/not-real.css"; */',
			"/* license */",
			'@import "https://fonts.googleapis.com/css2?family=Alegreya&display=swap";',
			"",
		].join("\n");
		const rootCss = "body { background: url(/the-proportional-web/src/demo/vitruvian-man.jpg); }\n";
		const demoCss = "aside { float: right; }\n";
		const indexJs = 'const hidden = "https://example.com/from-js-file.js";\n';
		const googleCss =
			"@font-face { src: url(https://fonts.gstatic.com/s/alegreya/v1/AbCd.woff2) format('woff2'); }\n";
		const image = Uint8Array.from([1, 2, 3, 4]);
		const font = Uint8Array.from([9, 8, 7, 6]);
		const html = `<!DOCTYPE html>
<html>
<head>
  <link rel="canonical" href="https://owickstrom.github.io/the-proportional-web/">
  <link rel="stylesheet" href="index.css">
  <link rel="stylesheet" href="/the-proportional-web/root.css">
  <link rel="stylesheet" href="https://owickstrom.github.io/the-proportional-web/src/demo/demo.css">
</head>
<body>
  <img src="src/demo/vitruvian-man.jpg" srcset="src/demo/vitruvian-man.jpg 1x, /the-proportional-web/src/demo/vitruvian-man.jpg 640w" alt="">
  <a href="https://practicaltypography.com/">Practical Typography</a>
  <a href="#foreword">Foreword</a>
  <a href="https://owickstrom.github.io/the-monospace-web/">Monospace</a>
  <script src="https://owickstrom.github.io/the-proportional-web/index.js"></script>
  <script>const remote = "https://example.com/only-in-script.js";</script>
</body>
</html>`;
		const { calls, fetch } = fixtureFetch({
			[new URL("index.css", page).href]: { body: encode(indexCss), contentType: "text/css" },
			[new URL("/the-proportional-web/root.css", page).href]: {
				body: encode(rootCss),
				contentType: "text/css",
			},
			"https://owickstrom.github.io/the-proportional-web/src/demo/demo.css": {
				body: encode(demoCss),
				contentType: "text/css",
			},
			[new URL("src/demo/vitruvian-man.jpg", page).href]: {
				body: image,
				contentType: "image/jpeg",
			},
			"https://fonts.googleapis.com/css2?family=Alegreya&display=swap": {
				body: encode(googleCss),
				contentType: "text/css",
			},
			"https://fonts.gstatic.com/s/alegreya/v1/AbCd.woff2": {
				body: font,
				contentType: "font/woff2",
			},
			"https://owickstrom.github.io/the-proportional-web/index.js": {
				body: encode(indexJs),
				contentType: "text/javascript",
			},
		});
		const document = documentFrom(html, page);
		const { files } = await rewriteArchive({ document, documentUrl: page, fetch });

		expect(document.querySelector("img")?.getAttribute("src")).toBe("src/demo/vitruvian-man.jpg");
		expect(document.querySelector("img")?.getAttribute("srcset")).toBe(
			"src/demo/vitruvian-man.jpg 1x, src/demo/vitruvian-man.jpg 640w",
		);
		const links = [...document.querySelectorAll("link")].map((el) => el.getAttribute("href"));
		expect(links).toEqual([
			"https://owickstrom.github.io/the-proportional-web/",
			"index.css",
			"root.css",
			"src/demo/demo.css",
		]);
		expect(document.querySelector("script[src]")?.getAttribute("src")).toBe("index.js");
		expect(document.querySelector('a[href="https://practicaltypography.com/"]')).not.toBeNull();
		expect(document.querySelector('a[href="#foreword"]')).not.toBeNull();
		expect(
			document.querySelector('a[href="https://owickstrom.github.io/the-monospace-web/"]'),
		).not.toBeNull();
		expect(document.querySelector("script:not([src])")?.textContent).toContain(
			"https://example.com/only-in-script.js",
		);

		expect(calls).not.toContain("https://example.com/only-in-script.js");
		expect(calls).not.toContain("https://example.com/from-js-file.js");
		expect(calls).not.toContain("https://example.com/not-real.css");
		expect(calls).not.toContain("https://practicaltypography.com/");
		expect(calls).not.toContain("https://owickstrom.github.io/the-monospace-web/");
		expect(calls).not.toContain(page);

		expect(decode(fileNamed(files, "index.css").body)).toBe(
			[
				'/* @import "https://example.com/not-real.css"; */',
				"/* license */",
				'@import "fonts/google-fonts.css";',
				"",
			].join("\n"),
		);
		expect(decode(fileNamed(files, "root.css").body)).toBe(
			"body { background: url(src/demo/vitruvian-man.jpg); }\n",
		);
		expect(decode(fileNamed(files, "src/demo/demo.css").body)).toBe(demoCss);
		expect(decode(fileNamed(files, "index.js").body)).toBe(indexJs);
		expect(fileNamed(files, "src/demo/vitruvian-man.jpg").body).toEqual(image);
		const google = decode(fileNamed(files, "fonts/google-fonts.css").body);
		expect(google).toBe("@font-face { src: url(AbCd.woff2) format('woff2'); }\n");
		expect(google).not.toContain("fonts.gstatic.com");
		expect(fileNamed(files, "fonts/AbCd.woff2").body).toEqual(font);
		expect(fileNamed(files, "fonts/AbCd.woff2").contentType).toBe("font/woff2");
		expect(decode(fileNamed(files, "index.html").body)).toContain(
			'href="https://practicaltypography.com/"',
		);
		expect(decode(fileNamed(files, "index.html").body)).toContain(
			"https://example.com/only-in-script.js",
		);

		const out = ".archives/the-proportional-web/2026-10-28";
		expect(wranglerProbeCommand("the-proportional-web", "2026-10-28", "index.css")).toBe(
			"npx wrangler r2 object get hugentobler/nook/the-proportional-web/2026-10-28/index.css --file=/tmp/nook-archive-probe --remote",
		);
		expect(
			wranglerPutCommand(
				"the-proportional-web",
				"2026-10-28",
				"fonts/AbCd.woff2",
				`${out}/fonts/AbCd.woff2`,
				"font/woff2",
			),
		).toBe(
			`npx wrangler r2 object put hugentobler/nook/the-proportional-web/2026-10-28/fonts/AbCd.woff2 --file=${out}/fonts/AbCd.woff2 --content-type="font/woff2" --cache-control="public, max-age=31536000, immutable" --remote`,
		);
	});

	it("resolves against base href and then removes base", async () => {
		const html = `<!DOCTYPE html><html><head>
      <base href="https://example.com/real/">
      <link rel="stylesheet" href="site.css">
    </head><body><img src="pic.jpg" alt=""><a href="#top">Top</a></body></html>`;
		const pic = Uint8Array.from([4, 5]);
		const { calls, fetch } = fixtureFetch({
			"https://example.com/real/pic.jpg": { body: pic, contentType: "image/jpeg" },
			"https://example.com/real/site.css": { body: encode("p{}\n"), contentType: "text/css" },
		});
		const document = documentFrom(html, "https://example.com/ignored/index.html");
		const { files } = await rewriteArchive({
			document,
			documentUrl: "https://example.com/ignored/index.html",
			fetch,
		});
		expect(calls).toEqual([
			"https://example.com/real/site.css",
			"https://example.com/real/pic.jpg",
		]);
		expect(document.querySelector("base")).toBeNull();
		expect(document.querySelector("link")?.getAttribute("href")).toBe("site.css");
		expect(document.querySelector("img")?.getAttribute("src")).toBe("pic.jpg");
		expect(document.querySelector("a")?.getAttribute("href")).toBe("#top");
		expect(decode(fileNamed(files, "index.html").body)).not.toContain("<base");
		expect(fileNamed(files, "pic.jpg").body).toEqual(pic);
	});

	it("rewrites @import url() and disambiguates woff2 filenames", async () => {
		const page = "https://example.com/article/";
		const google =
			'@font-face{src:url("https://fonts.gstatic.com/s/a/v1/Same.woff2")}' +
			"@font-face{src:url(https://fonts.gstatic.com/s/b/v1/Same.woff2)}";
		const { fetch } = fixtureFetch({
			[new URL("index.css", page).href]: {
				body: encode('@import url("https://fonts.googleapis.com/css?family=Quoted");\n'),
				contentType: "text/css",
			},
			"https://fonts.googleapis.com/css?family=Quoted": {
				body: encode(google),
				contentType: "text/css",
			},
			"https://fonts.gstatic.com/s/a/v1/Same.woff2": {
				body: Uint8Array.from([1]),
				contentType: "font/woff2",
			},
			"https://fonts.gstatic.com/s/b/v1/Same.woff2": {
				body: Uint8Array.from([2]),
				contentType: "font/woff2",
			},
		});
		const document = documentFrom('<link rel="stylesheet" href="index.css">', page);
		const { files } = await rewriteArchive({ document, documentUrl: page, fetch });
		expect(decode(fileNamed(files, "index.css").body)).toBe(
			'@import url("fonts/google-fonts.css");\n',
		);
		const saved = decode(fileNamed(files, "fonts/google-fonts.css").body);
		expect(saved).not.toContain("fonts.gstatic.com");
		expect(saved).toContain('url("Same.woff2")');
		expect(saved).toMatch(/url\([0-9a-f]{8}-Same\.woff2\)/);
		expect(files.filter((file) => file.path.endsWith("Same.woff2"))).toHaveLength(2);
	});

	it("fails when a fetch is not 200", async () => {
		const { fetch } = fixtureFetch({
			"https://example.com/missing.jpg": { body: encode("nope"), status: 404 },
		});
		const document = documentFrom('<img src="missing.jpg" alt="">', "https://example.com/");
		await expect(
			rewriteArchive({ document, documentUrl: "https://example.com/", fetch }),
		).rejects.toThrow("fetch failed 404 https://example.com/missing.jpg");
	});

	it("fails when a stylesheet is HTML", async () => {
		const { fetch } = fixtureFetch({
			"https://example.com/index.css": {
				body: encode("<!DOCTYPE html><html></html>"),
				contentType: "text/html",
			},
		});
		const document = documentFrom(
			'<link rel="stylesheet" href="index.css">',
			"https://example.com/",
		);
		await expect(
			rewriteArchive({ document, documentUrl: "https://example.com/", fetch }),
		).rejects.toThrow("stylesheet is not css: https://example.com/index.css");
	});

	it("fails when saved text still names a remote font host", async () => {
		const document = documentFrom("<p>cdn.hugentobler.xyz</p>", "https://example.com/");
		await expect(
			rewriteArchive({
				document,
				documentUrl: "https://example.com/",
				fetch: async () => {
					throw new Error("unexpected fetch");
				},
			}),
		).rejects.toThrow("index.html still mentions cdn.hugentobler.xyz");
	});

	it("fails when an object or the tree is over the limit", async () => {
		const big = fixtureFetch({
			"https://example.com/big.bin": { body: Uint8Array.from([1, 2, 3, 4, 5]) },
		});
		await expect(
			rewriteArchive({
				document: documentFrom('<img src="big.bin" alt="">', "https://example.com/"),
				documentUrl: "https://example.com/",
				fetch: big.fetch,
				maxObjectBytes: 4,
			}),
		).rejects.toThrow("object exceeds 25 MB: https://example.com/big.bin");

		await expect(
			rewriteArchive({
				document: documentFrom("<p>hello there</p>", "https://example.com/"),
				documentUrl: "https://example.com/",
				fetch: async () => {
					throw new Error("unexpected fetch");
				},
				maxTreeBytes: 4,
			}),
		).rejects.toThrow("tree exceeds 50 MB");
	});
});

describe("fetchArchive", () => {
	it("sends the browser user agent and follows at most 5 redirects", async () => {
		const seen: { redirect: RequestRedirect | undefined; ua: string | null; url: string }[] = [];
		const fetchImpl: typeof fetch = async (input, init) => {
			const url = String(input);
			seen.push({
				redirect: init?.redirect,
				ua: new Headers(init?.headers).get("user-agent"),
				url,
			});
			const hop = Number(new URL(url).pathname.slice(1));
			if (hop < 5) {
				return new Response(null, {
					headers: { location: `https://example.com/${hop + 1}` },
					status: 302,
				});
			}
			return new Response("done", { headers: { "content-type": "text/plain" }, status: 200 });
		};
		const ok = await fetchArchive("https://example.com/0", { fetch: fetchImpl });
		expect(decode(ok.body)).toBe("done");
		expect(ok.url).toBe("https://example.com/5");
		expect(seen).toHaveLength(6);
		expect(seen[0]?.ua).toBe(BROWSER_USER_AGENT);
		expect(seen[0]?.redirect).toBe("manual");

		const tooMany: typeof fetch = async (input) => {
			const hop = Number(new URL(String(input)).pathname.slice(1));
			return new Response(null, {
				headers: { location: `https://example.com/${hop + 1}` },
				status: 302,
			});
		};
		await expect(fetchArchive("https://example.com/0", { fetch: tooMany })).rejects.toThrow(
			"more than 5 redirects: https://example.com/0",
		);
	});

	it("fails on a non-200, a timeout, and an object over 25 MB", async () => {
		const missing: typeof fetch = async () => new Response("no", { status: 404 });
		await expect(fetchArchive("https://example.com/missing", { fetch: missing })).rejects.toThrow(
			"fetch failed 404 https://example.com/missing",
		);

		const hanging: typeof fetch = (_input, init) =>
			new Promise((_resolve, reject) => {
				init?.signal?.addEventListener("abort", () => {
					const error = new Error("aborted");
					error.name = "AbortError";
					reject(error);
				});
			});
		await expect(
			fetchArchive("https://example.com/slow", { fetch: hanging, timeoutMs: 20 }),
		).rejects.toThrow("timeout after 15s: https://example.com/slow");

		const huge: typeof fetch = async () =>
			new Response("tiny", {
				headers: { "content-length": String(26 * 1024 * 1024) },
				status: 200,
			});
		await expect(fetchArchive("https://example.com/huge", { fetch: huge })).rejects.toThrow(
			"object exceeds 25 MB: https://example.com/huge",
		);

		const stream: typeof fetch = async () =>
			new Response(
				new ReadableStream({
					start(controller) {
						controller.enqueue(new Uint8Array([1, 2, 3]));
						controller.close();
					},
				}),
				{ status: 200 },
			);
		await expect(
			fetchArchive("https://example.com/stream", { fetch: stream, maxObjectBytes: 2 }),
		).rejects.toThrow("object exceeds 25 MB: https://example.com/stream");
	});
});

describe("interpretProbe", () => {
	it("trusts a probe only when --remote was set", () => {
		expect(interpretProbe(false, 0, "")).toBe("abort");
		expect(interpretProbe(false, 1, "The specified key does not exist.")).toBe("abort");
		expect(interpretProbe(true, 0, "")).toBe("exists");
		expect(interpretProbe(true, 1, "Error: The specified key does not exist.\n")).toBe("missing");
		expect(interpretProbe(true, 1, "Authentication error")).toBe("abort");
	});
});

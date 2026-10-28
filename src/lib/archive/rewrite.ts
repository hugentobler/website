import { createHash } from "node:crypto";
import path from "node:path";

export const BROWSER_USER_AGENT =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export const CACHE_CONTROL = "public, max-age=31536000, immutable";
export const MAX_REDIRECTS = 5;
export const FETCH_TIMEOUT_MS = 15_000;
export const MAX_OBJECT_BYTES = 25 * 1024 * 1024;
export const MAX_TREE_BYTES = 50 * 1024 * 1024;
export const PROBE_FILE = "/tmp/nook-archive-probe";
export const MISSING_KEY_TEXT = "The specified key does not exist.";

const FORBIDDEN_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com", "cdn.hugentobler.xyz"];
const TEXT_EXTENSIONS = new Set(["css", "html", "js", "json", "mjs", "svg", "txt", "xml"]);

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

export type ArchiveResponse = {
	status: number;
	body: Uint8Array;
	contentType: string | null;
	url: string;
};

export type ArchiveFetcher = (url: string) => Promise<ArchiveResponse>;

export type ArchiveFile = {
	path: string;
	body: Uint8Array;
	contentType: string;
};

export type ProbeVerdict = "exists" | "missing" | "abort";

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

function extensionOf(filePath: string): string {
	const base = filePath.split("/").pop() ?? "";
	const dot = base.lastIndexOf(".");
	return dot === -1 ? "" : base.slice(dot + 1).toLowerCase();
}

export function contentTypeFor(filePath: string): string {
	return CONTENT_TYPES[extensionOf(filePath)] ?? "application/octet-stream";
}

export function archiveObjectName(slug: string, captured: string, rel: string): string {
	return `hugentobler/nook/${slug}/${captured}/${rel}`;
}

export function archiveFilePath(outDir: string, rel: string): string {
	return path.posix.join(outDir, rel);
}

function shellQuote(value: string): string {
	return `'${value.replaceAll("'", "'\\''")}'`;
}

export function wranglerProbeCommand(slug: string, captured: string, rel: string): string {
	const key = shellQuote(archiveObjectName(slug, captured, rel));
	return `npx wrangler r2 object get ${key} --file=${shellQuote(PROBE_FILE)} --remote`;
}

export function wranglerPutCommand(
	slug: string,
	captured: string,
	rel: string,
	filePath: string,
	contentType: string,
): string {
	const key = shellQuote(archiveObjectName(slug, captured, rel));
	return `npx wrangler r2 object put ${key} --file=${shellQuote(filePath)} --content-type="${contentType}" --cache-control="${CACHE_CONTROL}" --remote`;
}

/** A local wrangler probe exits 0 even when the production key is absent. */
export function interpretProbe(remote: boolean, exitCode: number, stderr: string): ProbeVerdict {
	if (!remote) return "abort";
	if (exitCode === 0) return "exists";
	if (stderr.includes(MISSING_KEY_TEXT)) return "missing";
	return "abort";
}

type FetchArchiveOptions = {
	fetch?: typeof fetch;
	timeoutMs?: number;
	maxObjectBytes?: number;
};

export async function fetchArchive(
	url: string,
	options: FetchArchiveOptions = {},
): Promise<ArchiveResponse> {
	const fetchImpl = options.fetch ?? fetch;
	const timeoutMs = options.timeoutMs ?? FETCH_TIMEOUT_MS;
	const maxObjectBytes = options.maxObjectBytes ?? MAX_OBJECT_BYTES;
	let current = url;
	let redirects = 0;

	while (true) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeoutMs);
		try {
			const response = await fetchImpl(current, {
				headers: {
					accept: "*/*",
					"user-agent": BROWSER_USER_AGENT,
				},
				redirect: "manual",
				signal: controller.signal,
			});

			if (response.status >= 300 && response.status < 400) {
				redirects += 1;
				if (redirects > MAX_REDIRECTS) {
					throw new Error(`more than 5 redirects: ${url}`);
				}
				const location = response.headers.get("location");
				if (!location) {
					throw new Error(`fetch failed ${response.status} ${current}`);
				}
				const next = new URL(location, current);
				if (next.protocol !== "http:" && next.protocol !== "https:") {
					throw new Error(`fetch failed ${response.status} ${current}`);
				}
				await response.body?.cancel();
				current = next.href;
				continue;
			}

			if (response.status !== 200) {
				await response.body?.cancel();
				throw new Error(`fetch failed ${response.status} ${current}`);
			}

			const body = await readLimited(response, maxObjectBytes, current);
			return {
				body,
				contentType: response.headers.get("content-type"),
				status: 200,
				url: current,
			};
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === "AbortError" || error.name === "TimeoutError") {
					throw new Error(`timeout after 15s: ${current}`);
				}
				if (
					error.message.startsWith("fetch failed") ||
					error.message.startsWith("timeout after") ||
					error.message.startsWith("more than 5 redirects") ||
					error.message.startsWith("object exceeds")
				) {
					throw error;
				}
				throw new Error(`fetch failed ${current}: ${error.message}`);
			}
			throw error;
		} finally {
			clearTimeout(timer);
		}
	}
}

async function readLimited(response: Response, max: number, url: string): Promise<Uint8Array> {
	const declared = response.headers.get("content-length");
	if (declared !== null && Number(declared) > max) {
		await response.body?.cancel();
		throw new Error(`object exceeds 25 MB: ${url}`);
	}
	if (!response.body) {
		const buf = new Uint8Array(await response.arrayBuffer());
		if (buf.byteLength > max) throw new Error(`object exceeds 25 MB: ${url}`);
		return buf;
	}
	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let total = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		if (!value) continue;
		total += value.byteLength;
		if (total > max) {
			await reader.cancel();
			throw new Error(`object exceeds 25 MB: ${url}`);
		}
		chunks.push(value);
	}
	const out = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		out.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return out;
}

type CssRef = {
	kind: "import" | "url";
	url: string;
	urlStart: number;
	urlEnd: number;
	after: number;
};

function isIdentChar(ch: string): boolean {
	return /[A-Za-z0-9_-]/.test(ch) || ch.charCodeAt(0) > 127;
}

function skipWsAndComments(css: string, index: number): number {
	let i = index;
	while (i < css.length) {
		const ch = css[i];
		if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r" || ch === "\f") {
			i += 1;
			continue;
		}
		if (ch === "/" && css[i + 1] === "*") {
			const end = css.indexOf("*/", i + 2);
			i = end === -1 ? css.length : end + 2;
			continue;
		}
		break;
	}
	return i;
}

function skipEscaped(css: string, index: number): number {
	if (css[index] !== "\\") return index + 1;
	return index + (css[index + 1] === undefined ? 1 : 2);
}

function readCssString(
	css: string,
	index: number,
): { contentStart: number; contentEnd: number; end: number } | null {
	const quote = css[index];
	if (quote !== '"' && quote !== "'") return null;
	let j = index + 1;
	const contentStart = j;
	while (j < css.length) {
		const ch = css[j];
		if (ch === "\\") {
			j = skipEscaped(css, j);
			continue;
		}
		if (ch === quote) return { contentEnd: j, contentStart, end: j + 1 };
		if (ch === "\n" || ch === "\r") return null;
		j += 1;
	}
	return null;
}

function readUnquotedUrl(
	css: string,
	index: number,
): { start: number; end: number; after: number } | null {
	let j = index;
	while (j < css.length) {
		const ch = css[j];
		if (ch === "\\") {
			j = skipEscaped(css, j);
			continue;
		}
		if (ch === ")" || ch === undefined) break;
		if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r" || ch === "\f") break;
		if (ch === '"' || ch === "'" || ch === "(") break;
		j += 1;
	}
	const afterWs = skipWsAndComments(css, j);
	if (css[afterWs] !== ")") return null;
	return { after: afterWs + 1, end: j, start: index };
}

function parseUrlFunction(css: string, index: number): CssRef | null {
	const j = skipWsAndComments(css, index + 4);
	if (css[j] === '"' || css[j] === "'") {
		const str = readCssString(css, j);
		if (!str) return null;
		const afterWs = skipWsAndComments(css, str.end);
		if (css[afterWs] !== ")") return null;
		return {
			after: afterWs + 1,
			kind: "url",
			url: css.slice(str.contentStart, str.contentEnd),
			urlEnd: str.contentEnd,
			urlStart: str.contentStart,
		};
	}
	const raw = readUnquotedUrl(css, j);
	if (!raw) return null;
	return {
		after: raw.after,
		kind: "url",
		url: css.slice(raw.start, raw.end),
		urlEnd: raw.end,
		urlStart: raw.start,
	};
}

function parseImport(css: string, index: number): CssRef | null {
	const j = skipWsAndComments(css, index + "@import".length);
	if (css.slice(j, j + 4).toLowerCase() === "url(") {
		const parsed = parseUrlFunction(css, j);
		if (!parsed) return null;
		return { ...parsed, kind: "import" };
	}
	if (css[j] === '"' || css[j] === "'") {
		const str = readCssString(css, j);
		if (!str) return null;
		return {
			after: str.end,
			kind: "import",
			url: css.slice(str.contentStart, str.contentEnd),
			urlEnd: str.contentEnd,
			urlStart: str.contentStart,
		};
	}
	return null;
}

function findCssRefs(css: string): CssRef[] {
	const refs: CssRef[] = [];
	let i = 0;
	while (i < css.length) {
		const ch = css[i];
		if (ch === "/" && css[i + 1] === "*") {
			const end = css.indexOf("*/", i + 2);
			i = end === -1 ? css.length : end + 2;
			continue;
		}
		if (ch === "@" && css.slice(i, i + 7).toLowerCase() === "@import") {
			const before = i === 0 ? "" : (css[i - 1] ?? "");
			if (!before || !isIdentChar(before)) {
				const parsed = parseImport(css, i);
				if (parsed) {
					refs.push(parsed);
					i = parsed.after > i ? parsed.after : i + 1;
					continue;
				}
			}
		}
		if (css.slice(i, i + 4).toLowerCase() === "url(") {
			const before = i === 0 ? "" : (css[i - 1] ?? "");
			if (!before || !isIdentChar(before)) {
				const parsed = parseUrlFunction(css, i);
				if (parsed) {
					refs.push(parsed);
					i = parsed.after > i ? parsed.after : i + 1;
					continue;
				}
			}
		}
		if (ch === '"' || ch === "'") {
			const str = readCssString(css, i);
			i = str ? str.end : i + 1;
			continue;
		}
		i += 1;
	}
	return refs;
}

function applyReplacements(
	source: string,
	replacements: { start: number; end: number; text: string }[],
): string {
	const ordered = [...replacements].sort((a, b) => b.start - a.start);
	let out = source;
	for (const replacement of ordered) {
		out = out.slice(0, replacement.start) + replacement.text + out.slice(replacement.end);
	}
	return out;
}

function resolveHttpUrl(raw: string, base: string): string | null {
	const trimmed = raw.trim();
	if (!trimmed || trimmed.startsWith("#")) return null;
	const lower = trimmed.toLowerCase();
	if (
		lower.startsWith("data:") ||
		lower.startsWith("blob:") ||
		lower.startsWith("mailto:") ||
		lower.startsWith("javascript:")
	) {
		return null;
	}
	let url: URL;
	try {
		url = new URL(trimmed, base);
	} catch {
		return null;
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") return null;
	url.hash = "";
	return url.href;
}

function isPathRelative(raw: string): boolean {
	const trimmed = raw.trim();
	if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//") || trimmed.startsWith("/")) {
		return false;
	}
	return !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
}

function decodeSeg(segment: string): string {
	try {
		return decodeURIComponent(segment);
	} catch {
		return segment;
	}
}

function pathSegments(pathname: string): string[] {
	const parts = pathname.split("/");
	if (parts[0] === "") parts.shift();
	if (parts.length > 0 && parts[parts.length - 1] === "") parts.pop();
	return parts.map(decodeSeg);
}

function assertSafeSegments(parts: string[]): void {
	if (parts.length === 0) throw new Error("unsafe archive path");
	for (const segment of parts) {
		if (
			!segment ||
			segment === "." ||
			segment === ".." ||
			segment.includes("/") ||
			segment.includes("\\") ||
			segment.includes("\0")
		) {
			throw new Error(`unsafe archive path: ${parts.join("/")}`);
		}
	}
}

function directoryUrl(url: URL): URL {
	return new URL(".", url);
}

function sameSite(resource: URL, documentUrl: URL): boolean {
	return (
		resource.hostname.toLowerCase() === documentUrl.hostname.toLowerCase() &&
		resource.port === documentUrl.port
	);
}

function sameHostSavePath(resource: URL, rootDir: URL): string {
	const rootParts = pathSegments(rootDir.pathname);
	const resParts = pathSegments(resource.pathname);
	const underRoot =
		resParts.length >= rootParts.length &&
		rootParts.every((part, index) => part === resParts[index]);
	const rest = underRoot ? resParts.slice(rootParts.length) : resParts;
	const parts = rest.length === 0 ? ["index.html"] : rest;
	assertSafeSegments(parts);
	return parts.join("/");
}

function fileName(url: URL): string {
	const parts = pathSegments(url.pathname);
	const last = parts[parts.length - 1] ?? "file";
	assertSafeSegments([last]);
	return last;
}

function shortHash(value: string): string {
	return createHash("sha256").update(value).digest("hex").slice(0, 8);
}

function prefixHash(savedPath: string, hash: string): string {
	const slash = savedPath.lastIndexOf("/");
	const dir = slash === -1 ? "" : savedPath.slice(0, slash + 1);
	const base = slash === -1 ? savedPath : savedPath.slice(slash + 1);
	return `${dir}${hash}-${base}`;
}

function vendorSavePath(resource: URL): string {
	const host = shortHash(resource.hostname.toLowerCase());
	const parts = pathSegments(resource.pathname);
	const safe = parts.length === 0 ? ["index"] : parts;
	assertSafeSegments(safe);
	return ["vendor", host, ...safe].join("/");
}

function parentDir(filePath: string): string {
	const slash = filePath.lastIndexOf("/");
	return slash === -1 ? "" : filePath.slice(0, slash);
}

function relativePosix(fromDir: string, toPath: string): string {
	return path.posix.relative(fromDir || ".", toPath) || ".";
}

function normalizeRelative(fromDir: string, rel: string): string | null {
	const parts = fromDir.split("/").filter(Boolean);
	for (const segment of rel.split("/")) {
		if (segment === "" || segment === ".") continue;
		if (segment === "..") {
			if (parts.length === 0) return null;
			parts.pop();
			continue;
		}
		const decoded = decodeSeg(segment);
		if (
			decoded.includes("/") ||
			decoded.includes("\\") ||
			decoded.includes("\0") ||
			decoded === ".."
		) {
			return null;
		}
		parts.push(decoded);
	}
	return parts.join("/");
}

function rewriteReference(containingFile: string, savedPath: string, original: string): string {
	const containingDir = parentDir(containingFile);
	if (isPathRelative(original)) {
		const pathOnly = original.trim().split(/[?#]/)[0] ?? "";
		const resolved = normalizeRelative(containingDir, pathOnly);
		if (resolved === savedPath) return original.trim();
	}
	return relativePosix(containingDir, savedPath);
}

function looksLikeCss(text: string, contentType: string | null): boolean {
	const ct = contentType?.split(";")[0]?.trim().toLowerCase() ?? "";
	if (
		ct === "text/html" ||
		ct === "application/xhtml+xml" ||
		ct === "application/json" ||
		ct === "text/javascript" ||
		ct === "application/javascript" ||
		ct.startsWith("image/") ||
		ct.startsWith("font/")
	) {
		return false;
	}
	const trimmed = text.trimStart().slice(0, 200).toLowerCase();
	return !(
		trimmed.startsWith("<!doctype") ||
		trimmed.startsWith("<html") ||
		trimmed.startsWith("<head") ||
		trimmed.startsWith("<body")
	);
}

function isGoogleFontCss(url: URL, stylesheet: boolean): boolean {
	if (url.hostname.toLowerCase() !== "fonts.googleapis.com") return false;
	return stylesheet || url.pathname.toLowerCase().startsWith("/css");
}

function isTextFile(file: ArchiveFile): boolean {
	if (TEXT_EXTENSIONS.has(extensionOf(file.path))) return true;
	const ct = file.contentType.toLowerCase();
	return (
		ct.startsWith("text/") ||
		ct.includes("javascript") ||
		ct.includes("json") ||
		ct.includes("xml") ||
		ct.includes("svg")
	);
}

function assertNoForbiddenHosts(files: ArchiveFile[]): void {
	for (const file of files) {
		if (!isTextFile(file)) continue;
		const text = decoder.decode(file.body);
		for (const host of FORBIDDEN_HOSTS) {
			if (text.includes(host)) {
				throw new Error(`${file.path} still mentions ${host}`);
			}
		}
	}
}

function serializeDocument(document: Document): string {
	const html = document.documentElement?.outerHTML ?? "";
	const doctype = document.doctype;
	if (!doctype) return html;
	let decl = `<!DOCTYPE ${doctype.name}`;
	if (doctype.publicId) {
		decl += ` PUBLIC "${doctype.publicId}"`;
		if (doctype.systemId) decl += ` "${doctype.systemId}"`;
	} else if (doctype.systemId) {
		decl += ` SYSTEM "${doctype.systemId}"`;
	}
	decl += ">";
	return `${decl}\n${html}`;
}

function relTokens(el: Element): string[] {
	return (el.getAttribute("rel") ?? "").toLowerCase().split(/\s+/).filter(Boolean);
}

function isSubresourceLink(el: Element): boolean {
	return relTokens(el).some(
		(token) =>
			token === "stylesheet" || token === "preload" || token === "icon" || token.endsWith("-icon"),
	);
}

function isStylesheetLink(el: Element): boolean {
	const tokens = relTokens(el);
	if (tokens.includes("stylesheet")) return true;
	return tokens.includes("preload") && (el.getAttribute("as") ?? "").toLowerCase() === "style";
}

export type RewriteArchiveOptions = {
	document: Document;
	documentUrl: string;
	fetch: ArchiveFetcher;
	maxObjectBytes?: number;
	maxTreeBytes?: number;
};

export async function rewriteArchive(
	options: RewriteArchiveOptions,
): Promise<{ files: ArchiveFile[] }> {
	const maxObjectBytes = options.maxObjectBytes ?? MAX_OBJECT_BYTES;
	const maxTreeBytes = options.maxTreeBytes ?? MAX_TREE_BYTES;
	const documentUrl = new URL(options.documentUrl);
	const baseElement = options.document.querySelector("base[href]");
	const baseAttr = baseElement?.getAttribute("href")?.trim();
	const effectiveBase = baseAttr ? new URL(baseAttr, documentUrl) : documentUrl;
	const rootDir = directoryUrl(effectiveBase);

	for (const base of [...options.document.querySelectorAll("base")]) base.remove();

	const filesByUrl = new Map<string, ArchiveFile>();
	const pathOwner = new Map<string, string>([["index.html", "document"]]);
	const reserved = new Map<string, string>();
	let treeBytes = 0;

	function addBytes(size: number, label: string): void {
		if (size > maxObjectBytes) throw new Error(`object exceeds 25 MB: ${label}`);
		treeBytes += size;
		if (treeBytes > maxTreeBytes) throw new Error("tree exceeds 50 MB");
	}

	function claimPath(desired: string, abs: string): string {
		const owner = pathOwner.get(desired);
		if (!owner || owner === abs) {
			pathOwner.set(desired, abs);
			return desired;
		}
		return claimPath(prefixHash(desired, shortHash(abs)), abs);
	}

	async function ingest(absolute: string, stylesheet: boolean): Promise<string> {
		const absUrl = new URL(absolute);
		absUrl.hash = "";
		const abs = absUrl.href;
		const done = filesByUrl.get(abs);
		if (done) return done.path;
		const reservedPath = reserved.get(abs);
		if (reservedPath) return reservedPath;

		const response = await options.fetch(abs);
		if (response.status !== 200) throw new Error(`fetch failed ${response.status} ${abs}`);
		if (response.body.byteLength > maxObjectBytes) throw new Error(`object exceeds 25 MB: ${abs}`);

		const finalUrl = new URL(response.url || abs);
		finalUrl.hash = "";
		const contentType = response.contentType;
		const contentTypeName = contentType?.split(";")[0]?.trim().toLowerCase() ?? "";
		const mustBeCss =
			stylesheet ||
			finalUrl.pathname.toLowerCase().endsWith(".css") ||
			contentTypeName === "text/css";
		const cssText = mustBeCss ? decoder.decode(response.body) : null;
		if (cssText !== null && !looksLikeCss(cssText, contentType)) {
			throw new Error(`stylesheet is not css: ${finalUrl.href}`);
		}

		let savedPath: string;
		if (isGoogleFontCss(finalUrl, mustBeCss)) {
			savedPath = claimPath("fonts/google-fonts.css", abs);
		} else if (finalUrl.hostname.toLowerCase() === "fonts.gstatic.com") {
			savedPath = claimPath(`fonts/${fileName(finalUrl)}`, abs);
		} else if (sameSite(finalUrl, documentUrl)) {
			savedPath = claimPath(sameHostSavePath(finalUrl, rootDir), abs);
		} else {
			savedPath = claimPath(vendorSavePath(finalUrl), abs);
		}
		reserved.set(abs, savedPath);
		if (finalUrl.href !== abs) reserved.set(finalUrl.href, savedPath);

		let body = response.body;
		if (cssText !== null) {
			body = encoder.encode(await rewriteCssText(cssText, finalUrl.href, savedPath));
		}

		addBytes(body.byteLength, abs);
		const file: ArchiveFile = { body, contentType: contentTypeFor(savedPath), path: savedPath };
		filesByUrl.set(abs, file);
		if (finalUrl.href !== abs) filesByUrl.set(finalUrl.href, file);
		return savedPath;
	}

	async function rewriteCssText(css: string, cssUrl: string, savedPath: string): Promise<string> {
		const refs = findCssRefs(css);
		const replacements: { start: number; end: number; text: string }[] = [];
		for (const ref of refs) {
			const resolved = resolveHttpUrl(ref.url, cssUrl);
			if (!resolved) continue;
			const child = await ingest(resolved, ref.kind === "import");
			replacements.push({
				end: ref.urlEnd,
				start: ref.urlStart,
				text: rewriteReference(savedPath, child, ref.url),
			});
		}
		return applyReplacements(css, replacements);
	}

	async function rewriteAttr(el: Element, attr: string, stylesheet: boolean): Promise<void> {
		const raw = el.getAttribute(attr);
		if (raw === null) return;
		const resolved = resolveHttpUrl(raw, effectiveBase.href);
		if (!resolved) return;
		const saved = await ingest(resolved, stylesheet);
		el.setAttribute(attr, rewriteReference("index.html", saved, raw));
	}

	async function rewriteSrcset(el: Element, attr: string): Promise<void> {
		const raw = el.getAttribute(attr);
		if (raw === null) return;
		const parts: string[] = [];
		for (const part of raw.split(",")) {
			const trimmed = part.trim();
			if (!trimmed) continue;
			const tokens = trimmed.split(/\s+/);
			const candidate = tokens[0] ?? "";
			const descriptor = tokens.slice(1).join(" ");
			const resolved = resolveHttpUrl(candidate, effectiveBase.href);
			if (!resolved) {
				parts.push(trimmed);
				continue;
			}
			const saved = await ingest(resolved, false);
			const next = rewriteReference("index.html", saved, candidate);
			parts.push(descriptor ? `${next} ${descriptor}` : next);
		}
		el.setAttribute(attr, parts.join(", "));
	}

	for (const el of [...options.document.querySelectorAll("link[href]")]) {
		if (!isSubresourceLink(el)) continue;
		await rewriteAttr(el, "href", isStylesheetLink(el));
	}

	const simpleAttrs: [string, string][] = [
		["audio[src]", "src"],
		["img[src]", "src"],
		["object[data]", "data"],
		["script[src]", "src"],
		["source[src]", "src"],
		["video[poster]", "poster"],
		["video[src]", "src"],
	];
	for (const [selector, attr] of simpleAttrs) {
		for (const el of [...options.document.querySelectorAll(selector)]) {
			await rewriteAttr(el, attr, false);
		}
	}
	for (const el of [...options.document.querySelectorAll("img[srcset], source[srcset]")]) {
		await rewriteSrcset(el, "srcset");
	}
	for (const el of [...options.document.querySelectorAll("style")]) {
		el.textContent = await rewriteCssText(el.textContent ?? "", effectiveBase.href, "index.html");
	}
	for (const el of [...options.document.querySelectorAll("[style]")]) {
		const raw = el.getAttribute("style");
		if (raw === null) continue;
		el.setAttribute("style", await rewriteCssText(raw, effectiveBase.href, "index.html"));
	}

	const htmlBody = encoder.encode(serializeDocument(options.document));
	addBytes(htmlBody.byteLength, options.documentUrl);
	const byPath = new Map<string, ArchiveFile>();
	for (const file of filesByUrl.values()) byPath.set(file.path, file);
	byPath.set("index.html", {
		body: htmlBody,
		contentType: contentTypeFor("index.html"),
		path: "index.html",
	});
	const files = [...byPath.values()];
	assertNoForbiddenHosts(files);
	return { files };
}

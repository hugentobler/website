import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import dotenv from "dotenv";
import { JSDOM } from "jsdom";
import {
	archiveFilePath,
	archiveObjectName,
	CACHE_CONTROL,
	fetchArchive,
	interpretProbe,
	PROBE_FILE,
	rewriteArchive,
	wranglerProbeCommand,
	wranglerPutCommand,
} from "./src/lib/archive/rewrite.ts";

const DEFAULT_URL = "https://owickstrom.github.io/the-proportional-web/";
const SLUG = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;
const CAPTURED = /^\d{4}-\d{2}-\d{2}$/;

function readFlags(argv) {
	try {
		const { values } = parseArgs({
			args: argv,
			options: {
				captured: { type: "string" },
				out: { type: "string" },
				slug: { type: "string" },
				upload: { default: false, type: "boolean" },
				url: { default: DEFAULT_URL, type: "string" },
			},
			strict: true,
		});
		return {
			captured: values.captured ?? "",
			out: values.out ?? "",
			slug: values.slug ?? "",
			upload: Boolean(values.upload),
			url: values.url ?? DEFAULT_URL,
		};
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

function requireFlags(flags) {
	if (!flags.slug || !flags.captured || !flags.out) {
		console.error(
			"usage: bun capture_archive.js --slug <slug> --captured YYYY-MM-DD --out <dir> [--url <url>] [--upload]",
		);
		process.exit(1);
	}
	if (!SLUG.test(flags.slug)) {
		console.error(`invalid --slug: ${flags.slug}`);
		process.exit(1);
	}
	if (!CAPTURED.test(flags.captured)) {
		console.error(`invalid --captured: ${flags.captured}`);
		process.exit(1);
	}
	let url;
	try {
		url = new URL(flags.url);
	} catch {
		console.error(`invalid --url: ${flags.url}`);
		process.exit(1);
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		console.error(`invalid --url: ${flags.url}`);
		process.exit(1);
	}
}

function decodeHtml(body, contentType) {
	const match = /charset=([^;]+)/i.exec(contentType ?? "");
	const charset = match?.[1]?.trim().replaceAll('"', "").replaceAll("'", "") || "utf-8";
	try {
		return new TextDecoder(charset).decode(body);
	} catch {
		return new TextDecoder("utf-8").decode(body);
	}
}

function writeTree(outDir, files) {
	const root = path.resolve(outDir);
	for (const file of files) {
		const dest = path.resolve(root, file.path);
		const relative = path.relative(root, dest);
		if (
			relative === "" ||
			relative === ".." ||
			relative.startsWith("../") ||
			relative.startsWith("..\\") ||
			path.isAbsolute(relative)
		) {
			throw new Error(`refusing to write outside output: ${file.path}`);
		}
		fs.mkdirSync(path.dirname(dest), { recursive: true });
		fs.writeFileSync(dest, file.body);
	}
}

// Wrangler stays local unless --remote is present.
function runWrangler(args) {
	if (!args.includes("--remote")) {
		throw new Error("refusing to run wrangler without --remote");
	}
	const result = spawnSync("npx", ["wrangler", ...args], { encoding: "utf-8" });
	const stderr = `${result.stderr ?? ""}${result.error ? result.error.message : ""}`;
	return { status: result.status ?? 1, stderr };
}

function uploadFile(slug, captured, rel, filePath, contentType) {
	const key = archiveObjectName(slug, captured, rel);
	const probe = runWrangler(["r2", "object", "get", key, `--file=${PROBE_FILE}`, "--remote"]);
	const verdict = interpretProbe(true, probe.status, probe.stderr);
	if (verdict === "exists") throw new Error(`key exists, not putting: ${key}`);
	if (verdict !== "missing") throw new Error(`probe failed: ${key}\n${probe.stderr}`);
	const put = runWrangler([
		"r2",
		"object",
		"put",
		key,
		`--file=${filePath}`,
		`--content-type=${contentType}`,
		`--cache-control=${CACHE_CONTROL}`,
		"--remote",
	]);
	if (put.status !== 0) throw new Error(`put failed: ${key}\n${put.stderr}`);
}

async function main() {
	const flags = readFlags(process.argv.slice(2));
	requireFlags(flags);
	const fetched = await fetchArchive(flags.url);
	const html = decodeHtml(fetched.body, fetched.contentType);
	const document = new JSDOM(html, { url: fetched.url }).window.document;
	const { files } = await rewriteArchive({
		document,
		documentUrl: fetched.url,
		fetch: fetchArchive,
	});
	files.sort((a, b) => a.path.localeCompare(b.path));
	writeTree(flags.out, files);
	const total = files.reduce((sum, file) => sum + file.body.byteLength, 0);
	console.log(`${files.length} files, ${total} bytes`);
	for (const file of files) {
		const filePath = archiveFilePath(flags.out, file.path);
		console.log(wranglerProbeCommand(flags.slug, flags.captured, file.path));
		console.log(
			wranglerPutCommand(flags.slug, flags.captured, file.path, filePath, file.contentType),
		);
	}
	if (!flags.upload) return;
	dotenv.config();
	if (!process.env.CLOUDFLARE_API_TOKEN) {
		console.error("CLOUDFLARE_API_TOKEN is not found");
		process.exit(1);
	}
	for (const file of files) {
		uploadFile(
			flags.slug,
			flags.captured,
			file.path,
			archiveFilePath(flags.out, file.path),
			file.contentType,
		);
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});

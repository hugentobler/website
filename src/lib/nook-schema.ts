export type NookKind = "markdown" | "archive";

export type Entry = {
	slug: string;
	title: string;
	author: string;
	source: string;
	date: string;
	year: number;
	publication?: string;
	language: string;
	kind: NookKind;
	captured?: string;
	archive?: string;
};

const CAPTURED_DATE = /^\d{4}-\d{2}-\d{2}$/;

function requiredString(slug: string, value: unknown, key: string): string {
	if (typeof value !== "string" || value.length === 0) {
		throw new Error(`Nook entry "${slug}" is missing required frontmatter (${key})`);
	}
	return value;
}

function assertArchivePrefix(slug: string, archive: string): void {
	if (archive.startsWith("/") || archive.includes("\\")) {
		throw new Error(`Nook entry "${slug}" archive must not include a leading slash or backslash`);
	}
	for (const segment of archive.split("/")) {
		if (segment === "" || segment === "." || segment === "..") {
			throw new Error(
				`Nook entry "${slug}" archive must not include ".", "..", or an empty segment`,
			);
		}
	}
}

export function parseNookFrontmatter(
	slug: string,
	fm: { [key: string]: unknown } | null | undefined,
): {
	title: string;
	author: string;
	source: string;
	date: string;
	publication?: string;
	language?: string;
	kind: NookKind;
	captured?: string;
	archive?: string;
} {
	if (fm == null) {
		throw new Error(
			`Nook entry "${slug}" is missing required frontmatter (title, author, source, date)`,
		);
	}

	const title = requiredString(slug, fm.title, "title");
	const author = requiredString(slug, fm.author, "author");
	const source = requiredString(slug, fm.source, "source");
	const date = requiredString(slug, fm.date, "date");
	const publication = typeof fm.publication === "string" ? fm.publication : undefined;
	const language = typeof fm.language === "string" ? fm.language : undefined;

	const kindValue = fm.kind;
	if (kindValue !== undefined && kindValue !== "markdown" && kindValue !== "archive") {
		throw new Error(`Nook entry "${slug}" has unknown kind ${JSON.stringify(kindValue)}`);
	}
	const kind: NookKind = kindValue === "archive" ? "archive" : "markdown";

	if (kind === "markdown") {
		if (fm.captured !== undefined || fm.archive !== undefined) {
			throw new Error(`Nook entry "${slug}" is markdown and must not set captured or archive`);
		}
		return { author, date, kind, language, publication, source, title };
	}

	const captured = requiredString(slug, fm.captured, "captured");
	if (!CAPTURED_DATE.test(captured)) {
		throw new Error(`Nook entry "${slug}" captured must be YYYY-MM-DD`);
	}
	const archive = requiredString(slug, fm.archive, "archive");
	assertArchivePrefix(slug, archive);
	const expected = `${slug}/${captured}`;
	if (archive !== expected) {
		throw new Error(`Nook entry "${slug}" archive must be "${expected}"`);
	}

	return { archive, author, captured, date, kind, language, publication, source, title };
}

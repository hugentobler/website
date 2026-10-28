import { describe, expect, it } from "vitest";
import { parseNookFrontmatter } from "../../src/lib/nook-schema";

const essay = {
	author: "Stephen King",
	date: "1981-06",
	source: "https://example.com/jaunt",
	title: "The Jaunt",
};

describe("parseNookFrontmatter", () => {
	it("defaults kind to markdown", () => {
		const parsed = parseNookFrontmatter("the-jaunt", essay);

		expect(parsed.kind).toBe("markdown");
		expect(parsed.title).toBe("The Jaunt");
		expect(parsed.captured).toBeUndefined();
		expect(parsed.archive).toBeUndefined();
	});

	it("throws when title is missing", () => {
		const { title: _title, ...rest } = essay;

		expect(() => parseNookFrontmatter("the-jaunt", rest)).toThrow(
			'Nook entry "the-jaunt" is missing required frontmatter (title)',
		);
	});

	it("throws when an archive is missing captured", () => {
		expect(() =>
			parseNookFrontmatter("the-proportional-web", {
				...essay,
				archive: "the-proportional-web/2026-10-28",
				kind: "archive",
			}),
		).toThrow('Nook entry "the-proportional-web" is missing required frontmatter (captured)');
	});

	it("throws when archive is not slug/captured", () => {
		expect(() =>
			parseNookFrontmatter("the-proportional-web", {
				...essay,
				archive: "other/2026-10-28",
				captured: "2026-10-28",
				kind: "archive",
			}),
		).toThrow(
			'Nook entry "the-proportional-web" archive must be "the-proportional-web/2026-10-28"',
		);
	});

	it("throws when a markdown card sets archive", () => {
		expect(() =>
			parseNookFrontmatter("the-jaunt", {
				...essay,
				archive: "the-jaunt/2026-10-28",
			}),
		).toThrow('Nook entry "the-jaunt" is markdown and must not set captured or archive');
	});

	it("throws on an unknown kind", () => {
		expect(() =>
			parseNookFrontmatter("the-jaunt", {
				...essay,
				kind: "webpage",
			}),
		).toThrow('Nook entry "the-jaunt" has unknown kind "webpage"');
	});

	it("accepts an archive whose prefix is slug/captured", () => {
		const parsed = parseNookFrontmatter("the-proportional-web", {
			...essay,
			archive: "the-proportional-web/2026-10-28",
			captured: "2026-10-28",
			date: "2026-07-12",
			kind: "archive",
		});

		expect(parsed.kind).toBe("archive");
		expect(parsed.captured).toBe("2026-10-28");
		expect(parsed.archive).toBe("the-proportional-web/2026-10-28");
	});

	it("throws when a matching archive prefix is not a safe relative path", () => {
		const captured = "2026-10-28";
		const slugs = [
			"..",
			"/the-proportional-web",
			"the-proportional-web/",
			"the-proportional-web\\",
			".",
		];

		for (const slug of slugs) {
			expect(() =>
				parseNookFrontmatter(slug, {
					...essay,
					archive: `${slug}/${captured}`,
					captured,
					kind: "archive",
				}),
			).toThrow(`Nook entry "${slug}"`);
		}
	});
});

---
name: nook-add
description: Add a new reading entry to the /nook library. Use when the user provides a URL or text for a short story, essay, or article to add to the nook.
---

# Add Nook Entry

## Objective

Add a new piece of third-party content to the nook reading library at `src/lib/nook/`.

## Input

The user provides one of:
- A URL to a webpage
- A URL to a PDF/scan (with pasted text)
- Pasted text directly

Along with optional metadata: title, author, publication, date.

## Content extraction

### Webpages

Use the Cloudflare Browser Rendering API with two endpoints. The account ID is `d733a272c9d38ec4b03913407d5ade88`. If `$CLOUDFLARE_API_TOKEN` is not set in the shell, source it from `.env` first.

**Markdown endpoint** — for body text (handles nav stripping, paragraph joining):

```bash
source .env 2>/dev/null
bunx wrangler pages -- curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/d733a272c9d38ec4b03913407d5ade88/browser-rendering/markdown" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -d '{"url": "<source-url>"}'
```

**Content endpoint** — for raw HTML (to extract metadata: title, author, date, publication):

```bash
curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/d733a272c9d38ec4b03913407d5ade88/browser-rendering/content" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -d '{"url": "<source-url>"}'
```

Cross-compare both outputs: use the markdown endpoint for the body, the HTML endpoint for metadata that the markdown conversion may lose.

### Verifying structure against original publication

The extracted content often references where the piece was originally published (e.g. "first appeared in Interzone #25, 1988"). Look for these references — they provide the `publication` and `date` frontmatter values, and can help locate the original print version (e.g. on archive.org) to verify chapter breaks and section structure that web republications often flatten. Present any findings to the user.

### PDFs / scans / paywalled content

Text cannot be auto-extracted from scanned pages. Ask the user to paste the content. The agent handles formatting and file creation from the pasted text.

## Create the markdown file

Save to `src/lib/nook/<slug>.md` where slug is a kebab-case version of the title.

Frontmatter format (all required unless noted):

```yaml
---
title: "Title"
author: "Author Name"
source: "https://original-url"
date: "YYYY-MM-DD"          # as precise as known (YYYY-MM or YYYY ok)
publication: "Publication"   # optional — journal, magazine, website name
language: "en"               # optional — defaults to "en" if omitted
---
```

## Format the body

Convert the content to clean markdown:
- Separate every paragraph with a blank line (required for Markdoc)
- Use `## Heading` for section headings if the original has them
- Use `---` (thematic break) between chapters/sections if the original has no headings but has clear divisions
- Do not add an `h1` — the title renders from frontmatter
- Preserve the author's formatting, emphasis, and structure faithfully
- Each story's structure is different — use judgment for section breaks based on the original publication's layout when available

## Verify

Run `bun run build` and confirm no errors.

## Important

- Do not modify any files outside `src/lib/nook/`. The registry (`src/lib/nook.ts`) auto-discovers entries.
- These pages are excluded from search engines (noindex, robots.txt Disallow). Do not add them to the sitemap.
- The nook uses the same Markdoc pipeline as the rest of the site — all standard Markdoc tags and nodes work.

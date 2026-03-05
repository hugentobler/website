---
name: can-i-use
description: Check current browser support for a web platform feature using caniuse.com. Use when asked if a feature is safe to use, supported by major browsers, or when validating support for a specific CSS/JS/API feature.
---

# Can I Use

## Objective

Verify real-world browser support for a feature via caniuse.com and report only major desktop and mobile browsers.

## Query

Open `https://caniuse.com/?search=<url-encoded feature>` and pick the most specific matching feature entry.

## Major browsers

- Desktop: Chrome, Edge, Firefox, Safari
- Mobile: iOS Safari, Chrome for Android

## Interpretation

- Count **full support** only.
- Treat **partial**, **behind a flag**, or **needs prefix** as **not supported**.
- If caniuse has no entry or looks ambiguous, say so and fall back to MDN Browser Compat Data; link both.

## Response format

- If all major browsers have full support: `Yes - you can use it.`
- Otherwise: list only the major browsers that lack full support.
- Keep it short; no tables unless asked.

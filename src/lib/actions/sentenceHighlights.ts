/**
 * Svelte action: sentence-level highlights with collective "warmth."
 *
 * Applied to the article content container via use:sentenceHighlights.
 * After hydration, walks <p> elements, splits text at sentence boundaries,
 * wraps each sentence in a <span class="sentence">, then layers on:
 *   - crowd warmth (fetched from /api/highlights/[slug])
 *   - personal highlights (localStorage)
 *   - hover preview + click-to-toggle interaction
 */

import type { Action } from "svelte/action";

interface HighlightParams {
	slug: string;
}

// ---------------------------------------------------------------------------
// Hashing (FNV-1a 32-bit)
// ---------------------------------------------------------------------------

function normalize(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

function hash(text: string): string {
	const s = normalize(text);
	let h = 0x811c9dc5;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return (h >>> 0).toString(36);
}

// ---------------------------------------------------------------------------
// localStorage
// ---------------------------------------------------------------------------

function getOwn(slug: string): Set<string> {
	try {
		const raw = localStorage.getItem(`hl:${slug}`);
		return new Set(raw ? JSON.parse(raw) : []);
	} catch {
		return new Set();
	}
}

function setOwn(slug: string, keys: Set<string>): void {
	localStorage.setItem(`hl:${slug}`, JSON.stringify([...keys]));
}

// ---------------------------------------------------------------------------
// Intensity
// ---------------------------------------------------------------------------

function intensity(count: number, maxCount: number): number {
	if (count <= 0) return 0;
	const floor = Math.max(maxCount, 10);
	return Math.log(1 + count) / Math.log(1 + floor);
}

// ---------------------------------------------------------------------------
// Sentence splitting
// ---------------------------------------------------------------------------

/** Split text into sentences at .!? followed by whitespace + uppercase. */
function splitSentences(text: string): string[] {
	return text.split(/(?<=[.!?])\s+(?=[A-Z\u00C0-\u024F])/).filter((s) => s.trim());
}

// ---------------------------------------------------------------------------
// DOM wrapping
// ---------------------------------------------------------------------------

/** Selectors for <p> elements we should skip. */
const SKIP_ANCESTORS = ".citations, svg";

function shouldSkip(p: HTMLElement): boolean {
	return !!p.closest(SKIP_ANCESTORS);
}

/**
 * Collect all text nodes inside an element in document order.
 * Skips nodes inside nested block-level elements.
 */
function textNodesIn(el: HTMLElement): Text[] {
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
	const nodes: Text[] = [];
	for (;;) {
		const next = walker.nextNode() as Text | null;
		if (!next) break;
		nodes.push(next);
	}
	return nodes;
}

/**
 * Wrap sentences inside a prose element (<p>, <li>, <td>, etc.).
 * Returns a map of sentenceKey → span element.
 *
 * Strategy:
 * 1. Split fullText into sentences.
 * 2. Compute character offsets for each sentence boundary.
 * 3. Split direct-child text nodes at those offsets (reverse order
 *    so earlier positions stay valid after later splits).
 * 4. Group the resulting child nodes by cumulative character count
 *    to align with sentence boundaries, then wrap each group.
 */
function wrapParagraph(el: HTMLElement): Map<string, HTMLSpanElement> {
	const result = new Map<string, HTMLSpanElement>();
	const fullText = el.textContent ?? "";
	if (!fullText.trim()) return result;

	// Special case: <br> acts as a hard sentence boundary. Walk direct
	// children, collect each br-separated segment, and wrap each as its
	// own sentence span. Leaves <br> elements in place between spans.
	if (el.querySelector(":scope > br")) {
		const segments: { nodes: Node[]; text: string }[] = [];
		let currentNodes: Node[] = [];
		let currentText = "";
		for (const child of Array.from(el.childNodes)) {
			if (child.nodeName === "BR") {
				if (currentText.trim()) segments.push({ nodes: currentNodes, text: currentText });
				currentNodes = [];
				currentText = "";
			} else {
				currentNodes.push(child);
				currentText += child.textContent ?? "";
			}
		}
		if (currentText.trim()) segments.push({ nodes: currentNodes, text: currentText });

		for (const seg of segments) {
			const key = hash(seg.text);
			const span = document.createElement("span");
			span.className = "sentence";
			span.dataset.sentence = key;
			el.insertBefore(span, seg.nodes[0]);
			for (const node of seg.nodes) span.appendChild(node);
			result.set(key, span);
		}
		return result;
	}

	const sentences = splitSentences(fullText);
	if (sentences.length === 0) return result;

	// Single sentence — wrap all contents in one span.
	if (sentences.length === 1) {
		const key = hash(fullText);
		const span = document.createElement("span");
		span.className = "sentence";
		span.dataset.sentence = key;
		while (el.firstChild) span.appendChild(el.firstChild);
		el.appendChild(span);
		result.set(key, span);
		return result;
	}

	// Build cumulative character offsets for each sentence boundary.
	const boundaries: number[] = [];
	let offset = 0;
	for (let i = 0; i < sentences.length - 1; i++) {
		offset += sentences[i].length;
		boundaries.push(offset);
		const remaining = fullText.slice(offset);
		const ws = remaining.match(/^\s+/);
		if (ws) offset += ws[0].length;
	}

	// Phase 1: split direct-child text nodes at boundary positions.
	// Process in reverse so earlier char positions aren't invalidated.
	for (let b = boundaries.length - 1; b >= 0; b--) {
		const target = boundaries[b];
		let charPos = 0;
		for (const tn of textNodesIn(el)) {
			const nodeStart = charPos;
			const nodeEnd = charPos + tn.length;
			if (target > nodeStart && target < nodeEnd && tn.parentNode === el) {
				tn.splitText(target - nodeStart);
				break;
			}
			if (target <= nodeEnd) break;
			charPos = nodeEnd;
		}
	}

	// Phase 2: compute cumulative end-of-sentence char positions.
	const sentenceEnds: number[] = [];
	let pos = 0;
	for (let i = 0; i < sentences.length; i++) {
		pos += sentences[i].length;
		sentenceEnds.push(pos);
		if (i < sentences.length - 1) {
			const remaining = fullText.slice(pos);
			const ws = remaining.match(/^\s+/);
			if (ws) pos += ws[0].length;
		}
	}

	// Phase 3: group child nodes by sentence and wrap.
	let totalChars = 0;
	let sentenceIdx = 0;
	let group: Node[] = [];

	for (const child of Array.from(el.childNodes)) {
		group.push(child);
		totalChars += (child.textContent ?? "").length;

		if (sentenceIdx < sentences.length && totalChars >= sentenceEnds[sentenceIdx]) {
			const key = hash(sentences[sentenceIdx]);
			const span = document.createElement("span");
			span.className = "sentence";
			span.dataset.sentence = key;
			el.insertBefore(span, group[0]);
			for (const node of group) span.appendChild(node);
			result.set(key, span);
			sentenceIdx++;
			group = [];
		}
	}

	// Flush remaining nodes as the last sentence.
	if (group.length > 0 && sentenceIdx < sentences.length) {
		const key = hash(sentences[sentenceIdx]);
		const span = document.createElement("span");
		span.className = "sentence";
		span.dataset.sentence = key;
		el.insertBefore(span, group[0]);
		for (const node of group) span.appendChild(node);
		result.set(key, span);
	}

	return result;
}

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export const sentenceHighlights: Action<HTMLElement, HighlightParams> = (node, params) => {
	const slug = params?.slug ?? "";
	const spans = new Map<string, HTMLSpanElement>();
	let crowd: Record<string, number> = {};
	const own = getOwn(slug);

	// 1. Wrap sentences in all prose elements (paragraphs + list items).
	const prose = node.querySelectorAll<HTMLElement>("p, li, td, th, figcaption");
	for (const el of prose) {
		if (shouldSkip(el)) continue;
		if (!el.textContent?.trim()) continue;
		const wrapped = wrapParagraph(el);
		for (const [key, span] of wrapped) {
			spans.set(key, span);
		}
	}

	// 2. Apply initial own-highlight indicators (before crowd data arrives).
	for (const [key, span] of spans) {
		if (own.has(key)) span.setAttribute("data-own", "");
	}

	// 3. Fetch crowd data.
	fetch(`/api/highlights${slug}`)
		.then((r) => r.json() as Promise<Record<string, number>>)
		.then((data) => {
			crowd = data;
			applyWarmth();
		})
		.catch(() => {});

	// 4. Visual state.
	function applyWarmth() {
		const maxCount = Math.max(...Object.values(crowd), 0);
		for (const [key, span] of spans) {
			const count = crowd[key] ?? 0;
			const w = intensity(count, maxCount);
			span.style.setProperty("--crowd-warmth", w.toFixed(3));
			if (own.has(key)) {
				span.setAttribute("data-own", "");
			} else {
				span.removeAttribute("data-own");
			}
		}
	}

	// 5. Click handler (event delegation).
	function onClick(e: Event) {
		const target = (e.target as HTMLElement).closest<HTMLElement>(".sentence");
		if (!target) return;
		const key = target.dataset.sentence;
		if (!key) return;

		// Don't highlight if user is selecting text.
		const selection = window.getSelection();
		if (selection && selection.toString().length > 0) return;

		const isOwn = own.has(key);
		const action = isOwn ? "remove" : "add";
		const text = target.textContent ?? "";

		// Optimistic update.
		if (isOwn) {
			own.delete(key);
			crowd[key] = Math.max(0, (crowd[key] ?? 0) - 1);
		} else {
			own.add(key);
			crowd[key] = (crowd[key] ?? 0) + 1;
		}
		setOwn(slug, own);
		applyWarmth();

		// Fire-and-forget POST.
		fetch(`/api/highlights${slug}`, {
			body: JSON.stringify({ action, key, text: isOwn ? undefined : text }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		}).catch(() => {});
	}

	node.addEventListener("click", onClick);

	return {
		destroy() {
			node.removeEventListener("click", onClick);
		},
	};
};

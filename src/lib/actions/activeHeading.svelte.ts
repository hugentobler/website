/**
 * Tracks which article heading is "currently being read" and which
 * is coming up next, based on scroll position. The active heading is
 * the last one whose top has passed a threshold line near the top of
 * the viewport. The next heading is the first one still below that
 * line. Updates are throttled to requestAnimationFrame, reads are
 * layout-only (no writes), and the computation is O(headings) per
 * frame, which stays fast for typical long-form articles.
 */
export class HeadingTracker {
	active = $state<string | null>(null);
	next = $state<string | null>(null);

	#elements: HTMLElement[] = [];
	#onFrame: (() => void) | null = null;

	start(ids: string[]) {
		this.stop();
		if (typeof window === "undefined") return;

		this.#elements = ids
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);

		if (this.#elements.length === 0) return;

		let ticking = false;
		const update = () => {
			const threshold = Math.max(120, window.innerHeight * 0.25);
			let current: string | null = null;
			let upcoming: string | null = null;
			for (const el of this.#elements) {
				const top = el.getBoundingClientRect().top;
				if (top <= threshold) {
					current = el.id;
				} else if (upcoming === null) {
					upcoming = el.id;
				}
			}
			if (current === null && upcoming === null) {
				upcoming = this.#elements[0]?.id ?? null;
			}
			this.active = current;
			this.next = upcoming;
		};

		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				update();
				ticking = false;
			});
		};

		this.#onFrame = onScroll;
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll, { passive: true });
		update();
	}

	stop() {
		if (this.#onFrame) {
			window.removeEventListener("scroll", this.#onFrame);
			window.removeEventListener("resize", this.#onFrame);
			this.#onFrame = null;
		}
		this.#elements = [];
		this.active = null;
		this.next = null;
	}
}

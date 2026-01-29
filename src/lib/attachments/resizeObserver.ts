import type { Attachment } from "svelte/attachments";

/** Generic ResizeObserver attachment that re-runs if the callback reference changes. */
export const resizeObserver =
  (callback: (entry: ResizeObserverEntry) => void): Attachment =>
  (node) => {
    const ro = new ResizeObserver(([entry]) => callback(entry));
    ro.observe(node);
    return () => ro.disconnect();
  };

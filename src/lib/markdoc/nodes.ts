import type { Config } from "markdoc-svelte";
import { Markdoc } from "markdoc-svelte";

const nodes: Config["nodes"] = {
	document: {
		...Markdoc.nodes.document,
		render: "", // Disable default wrapping in <article>
	},
	paragraph: {
		...Markdoc.nodes.paragraph,
		transform(node, config) {
			const raw = node.children ?? [];
			if (raw.length === 1) {
				const only = raw[0];
				if (only?.type === "image") {
					// Unwrap paragraphs that directly contain a single image node.
					return only.transform(config);
				}
				if (only?.type === "inline" && Array.isArray(only.children)) {
					const inlineChildren = only.children.filter(
						(child) => !(child?.type === "text" && String(child?.attributes?.content ?? "").trim() === ""),
					);
					if (inlineChildren.length === 1 && inlineChildren[0]?.type === "image") {
						// Unwrap paragraphs where the inline content is only an image (plus whitespace).
						return inlineChildren[0].transform(config);
					}
				}
			}
			const children = node.transformChildren(config);
			return new Markdoc.Tag("p", {}, children);
		},
	},
	image: {
		attributes: {
			...Markdoc.nodes.image.attributes,
		},
		render: "EnhancedImage",
	},
	link: {
		attributes: {
			...Markdoc.nodes.link.attributes,
		},
		render: "DecoratedLink",
		transform(node, config) {
			const attributes = node.transformAttributes(config);
			const children = node.transformChildren(config);
			// If the link is external, open in a new tab
			let target = "_self";
			try {
				const url = new URL(attributes.href);
				if (url.hostname) target = "_blank";
			} catch {
				// If the URL is invalid, do nothing
			}
			return new Markdoc.Tag("DecoratedLink", { ...attributes, target }, children);
		},
	},
};

export default nodes;

import type { Config } from "markdoc-svelte";
import { Markdoc } from "markdoc-svelte";

const nodes: Config["nodes"] = {
	document: {
		...Markdoc.nodes.document,
		render: "", // Disable default wrapping in <article>
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

import type { Config } from "markdoc-svelte";
import { Markdoc } from "markdoc-svelte";

const tags: Config["tags"] = {
	citations: {
		children: ["cite"],
		render: "Citations",
		// Markdoc wraps adjacent block content in a paragraph, so the
		// children of {% citations %} arrive as [<p>[<Cite>,<Cite>,...]</p>].
		// Since Citations.svelte renders an <ol>, that produces
		// <ol><p><li>...</li></p></ol> — invalid HTML. The browser's parser
		// auto-closes the <p> before the first <li>, the runtime DOM no
		// longer matches the SSR string, and Svelte 5 hydration walks off
		// the tree and throws HierarchyRequestError on appendChild.
		// Unwrap the paragraph so the component receives flat cite children.
		transform(node, config) {
			const attributes = node.transformAttributes(config);
			const flatten = (children: unknown[]): unknown[] => {
				const out: unknown[] = [];
				for (const child of children) {
					if (
						child &&
						typeof child === "object" &&
						"name" in child &&
						(child as { name: unknown }).name === "p" &&
						"children" in child
					) {
						out.push(...flatten((child as { children: unknown[] }).children ?? []));
					} else {
						out.push(child);
					}
				}
				return out;
			};
			const children = flatten(node.transformChildren(config));
			return new Markdoc.Tag("Citations", attributes, children);
		},
	},
	cite: {
		attributes: {
			n: { required: true, type: Number },
		},
		render: "Cite",
	},
	matrix: {
		attributes: {
			bottom: { required: true, type: String },
			bottomLeft: { required: true, type: String },
			bottomRight: { required: true, type: String },
			left: { required: true, type: String },
			right: { required: true, type: String },
			top: { required: true, type: String },
			topLeft: { required: true, type: String },
			topRight: { required: true, type: String },
		},
		render: "Matrix",
		selfClosing: true,
	},
	panzoom: {
		attributes: {
			alt: { type: String },
			src: { required: true, type: String },
		},
		render: "Panzoom",
	},
	ref: {
		attributes: {
			n: { required: true, type: Number },
		},
		render: "Ref",
		selfClosing: true,
	},
	underline: {
		children: ["link"],
		render: "Underline",
	},
};

export default tags;

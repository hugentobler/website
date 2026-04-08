import type { Config } from "markdoc-svelte";

const tags: Config["tags"] = {
	panzoom: {
		attributes: {
			alt: { type: String },
			src: { required: true, type: String },
		},
		render: "Panzoom",
		selfClosing: true,
	},
	underline: {
		children: ["link"],
		render: "Underline",
	},
};

export default tags;

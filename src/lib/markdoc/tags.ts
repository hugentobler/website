import type { Config } from "markdoc-svelte";

const tags: Config["tags"] = {
	citations: {
		render: "Citations",
	},
	cite: {
		attributes: {
			n: { required: true, type: Number },
		},
		render: "Cite",
	},
	panzoom: {
		attributes: {
			alt: { type: String },
			src: { required: true, type: String },
		},
		render: "Panzoom",
		selfClosing: true,
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

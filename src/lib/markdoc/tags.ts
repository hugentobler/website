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

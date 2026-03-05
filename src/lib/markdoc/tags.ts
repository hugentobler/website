import type { Config } from "markdoc-svelte";

const tags: Config["tags"] = {
	underline: {
		children: ["link"],
		render: "Underline",
	},
};

export default tags;

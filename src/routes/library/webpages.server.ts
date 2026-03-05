import { parse } from "yaml";
import webpagesYaml from "$data/webpages.yaml?raw";
import { createItem } from "./item.server";

export const getWebpages = () => {
	const rawData = parse(webpagesYaml);

	if (!Array.isArray(rawData)) return [];

	return rawData.flatMap((item) => {
		try {
			return [createItem("webpage", item)];
		} catch (error) {
			console.warn(error);
			return []; // Skip invalid items
		}
	});
};

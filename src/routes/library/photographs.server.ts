import { parse } from "yaml";
import photographsYaml from "$data/photographs.yaml?raw";
// Enhanced image imports
import hackathonImg from "$lib/images/end-of-year-team-hackathon-in-december-2021.jpg?enhanced";
import medicineOfficeImg from "$lib/images/guests-touring-the-traditional-chinese-medicine-office.jpg?enhanced";
import claimsImg from "$lib/images/it's-easy-to-submit-claims-online!.jpg?enhanced";
import { createItem } from "./item.server.js";

// Map image keys to enhanced imports
const imageMap = {
	hackathon: hackathonImg,
	"medicine-office": medicineOfficeImg,
	claims: claimsImg,
} as const;

export const getPhotographs = () => {
	const rawData = parse(photographsYaml);

	if (!Array.isArray(rawData)) return [];

	return rawData.flatMap((item) => {
		try {
			// Get the enhanced image for this item
			const thumbnail = imageMap[item.image_key as keyof typeof imageMap];

			if (!thumbnail) {
				console.warn(
					`No image found for key "${item.image_key}" in photograph "${item.id}"`,
				);
				return [];
			}

			return [
				createItem("photograph", {
					...item,
					thumbnail,
				}),
			];
		} catch (error) {
			console.warn(error);
			return [];
		}
	});
};

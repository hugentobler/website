// Using existing images from $lib/images with enhanced-img
import hackathonImg from "$lib/images/end-of-year-team-hackathon-in-december-2021.jpg?enhanced";
import medicineOfficeImg from "$lib/images/guests-touring-the-traditional-chinese-medicine-office.jpg?enhanced";
import claimsImg from "$lib/images/it's-easy-to-submit-claims-online!.jpg?enhanced";
import type { Item } from "$lib/types/library.js";

export const photographs: Item[] = [
  {
    id: "photo-1",
    type: "photograph",
    title: "End of Year Team Hackathon",
    published: "2021-12-15T18:00:00Z",
    published_by: "Me",
    thumbnail: hackathonImg,
    note: "Great energy and creativity from the whole team. Love these collaborative sessions and the innovation that comes out.",
  },
  {
    id: "photo-2",
    type: "photograph",
    title: "Traditional Chinese Medicine Office Tour",
    published: "2023-03-10T14:30:00Z",
    published_by: "Me",
    thumbnail: medicineOfficeImg,
    note: "Fascinating look into traditional healing methods. Great learning experience about different approaches to medicine.",
  },
  {
    id: "photo-3",
    type: "photograph",
    title: "Online Claims Submission",
    published: "2023-08-22T11:15:00Z",
    published_by: "Me",
    thumbnail: claimsImg,
    note: "Simple and intuitive interface design. User experience keeps improving with each iteration of the product.",
  },
];

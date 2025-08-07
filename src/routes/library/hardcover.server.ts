import { error } from "@sveltejs/kit";
import { HARDCOVER_API_BEARER_TOKEN } from "$env/static/private";

const HARDCOVER_API = "https://api.hardcover.app/v1/graphql";

export const getHardcoverBooks = async () => {
  const res = await fetch(HARDCOVER_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${HARDCOVER_API_BEARER_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
        query {
          me {
            activities(
              where: {event: {_eq: "UserBookActivity"}, data: {}}
              distinct_on: book_id
            ) {
              event
              data
              book {
                subtitle
                title
                release_year
                editions(
                  order_by: {release_date: desc}
                  limit: 5
                  where: {isbn_13: {_is_null: false}}
                ) {
                  isbn_13
                  release_date
                }
              }
            }
          }
        }
      `,
		}),
	});

	if (!res.ok) throw error(res.status, "Hardcover HTTP error");

	const {
		data,
		errors,
	}: {
		data: {
			me: Array<{
				activities: Array<{
					data: {
						userBook: {
							reviewSlate?: {
								document: {
									children: Array<{
										children: Array<{
											text: string;
										}>;
									}>;
								};
							};
						};
					};
					book: {
						title: string;
						subtitle: string | null;
						release_year: number;
						editions: Array<{
							isbn_13: string;
						}>;
					};
				}>;
			}>;
		};
		errors: any;
	} = await res.json();

	if (!data || errors) {
		throw error(500, {
			message: "Hardcover GraphQL error",
			json: errors,
		});
	}

	return data.me[0].activities.map((activity) => ({
		title: activity.book.title,
		subtitle: activity.book.subtitle,
		releaseYear: activity.book.release_year,
		editionIsbns: activity.book.editions.map((edition) => edition.isbn_13),
		reviewText:
			activity.data.userBook.reviewSlate?.document.children[0].children[0].text,
	}));
};

import { error } from "@sveltejs/kit";
import { HARDCOVER_API_BEARER_TOKEN } from "$env/static/private";

const HARDCOVER_API = "https://api.hardcover.app/v1/graphql";

export const getHardcoverBooks = async (): Promise<
  HardcoverBooksResponse["data"]["me"]["activities"]
> => {
  const response = await fetch(HARDCOVER_API, {
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

  if (!response.ok) throw error(response.status, "Hardcover API failed");

  const result: HardcoverBooksResponse = await response.json();

  console.log(JSON.stringify(result));

  if (!result.data?.me?.[0]?.activities) {
    throw error(500, "No book activities found");
  }

  return result.data.me[0].activities;
};

export interface HardcoverBooksResponse {
  data: {
    me: Array<{
      activities: Array<{
        data: {
          userBook: {
            id: number;
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
          release_year: number;
          editions: Array<{
            isbn_13: string;
          }>;
        };
      }>;
    }>;
  };
}

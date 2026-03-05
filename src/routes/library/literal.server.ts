import { LITERAL_EMAIL, LITERAL_PASSWORD } from "$env/static/private";
import { handleApiResponse, handleGraphQLResponse } from "$lib/api-error-handler";

const LITERAL_API = "https://literal.club/graphql/";

// TOKEN MANAGEMENT
// In-memory cache to avoid repeated auth calls during development
let tokenCache: { token: string; expires: number } | null = null;
const TOKEN_DURATION = 1000 * 60 * 15;

const getLiteralToken = async () => {
	// Use cached token if exists
	if (tokenCache && tokenCache.expires > Date.now()) {
		return { token: tokenCache.token };
	}

	// Otherwise, fetch a new token
	const res = await fetch(LITERAL_API, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			query: `
        mutation login($email: String!, $password: String!) {
      		login(email: $email, password: $password) {
     			  token
        			profile { id }
       		}
        	}
      `,
			variables: {
				email: LITERAL_EMAIL,
				password: LITERAL_PASSWORD,
			},
		}),
	});

	await handleApiResponse(res, { 
		serviceName: "Literal", 
		operation: "getLiteralToken" 
	});

	const {
		data,
		errors,
	}: {
		data: {
			login: {
				token: string;
			};
		};
		errors: any;
	} = await res.json();

	handleGraphQLResponse(data, errors, {
		serviceName: "Literal",
		operation: "getLiteralToken"
	});

	tokenCache = {
		token: data.login.token,
		expires: Date.now() + TOKEN_DURATION,
	};

	return { token: data.login.token };
};

export const getLiteralDataForIsbn = async (isbn13: string) => {
	const { token } = await getLiteralToken();

	const res = await fetch(LITERAL_API, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			query: `
        query GetBookByIsbn($isbn13: String!) {
          book(where: { isbn13: $isbn13 }) {
            title
            cover
            authors {
              name
            }
          }
        }
      `,
			variables: {
				isbn13,
			},
		}),
	});

	await handleApiResponse(res, { 
		serviceName: "Literal", 
		operation: "getLiteralDataForIsbn" 
	});

	const {
		data,
		errors,
	}: {
		data: {
			book: {
				title: string;
				cover: string;
				authors: Array<{
					name: string;
				}>;
			} | null;
		};
		errors: any;
	} = await res.json();

	handleGraphQLResponse(data, errors, {
		serviceName: "Literal",
		operation: "getLiteralDataForIsbn"
	});

	return {
		data: data.book,
	};
};
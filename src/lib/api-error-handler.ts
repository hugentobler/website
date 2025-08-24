import { error } from "@sveltejs/kit";

interface ApiErrorOptions {
	serviceName: string;
	operation?: string;
}

export async function handleApiResponse(
	response: Response,
	options: ApiErrorOptions
): Promise<Response> {
	if (!response.ok) {
		console.error(`${options.serviceName} API error:`, {
			operation: options.operation,
			status: response.status,
			statusText: response.statusText,
			url: response.url,
			headers: Object.fromEntries(response.headers.entries())
		});

		// Try to log response body if available
		try {
			const errorBody = await response.clone().text();
			console.error(`${options.serviceName} API error body:`, errorBody);
		} catch (e) {
			console.error("Could not read error response body:", e);
		}

		throw error(response.status, `${options.serviceName} HTTP error`);
	}

	return response;
}

export async function handleGraphQLResponse(
	data: any,
	errors: any,
	options: ApiErrorOptions
) {
	if (!data || errors) {
		console.error(`${options.serviceName} GraphQL error:`, {
			operation: options.operation,
			errors
		});

		throw error(500, {
			message: `${options.serviceName} GraphQL error`,
			json: errors,
		});
	}
}
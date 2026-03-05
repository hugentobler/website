/** GET /api/visitors response */
export interface VisitorsResponse {
	total: number;
}

/** GET /api/location response */
export interface LocationResponse {
	city: string | null;
	country: string | null;
}

/** Combined data passed to VisitorFeed consumer snippet */
export type VisitorFeedData = VisitorsResponse & LocationResponse;

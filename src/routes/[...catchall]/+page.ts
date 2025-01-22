import { get } from '$lib/markdown';

export const load = async ({ params }) => {
  // Get the markdown file from the catchall route
  return await get(params.catchall);
};

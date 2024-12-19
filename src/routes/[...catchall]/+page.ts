import { get } from '$lib/markdown';

export const load = async ({ params }) => {
  return await get(params.catchall);
};

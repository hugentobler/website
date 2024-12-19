import { error } from '@sveltejs/kit';

import { get } from '$lib/markdown';

export const load = async ({ params }) => {
  try {
    return await get(params.catchall);
  } catch {
    throw error(404, 'Not found');
  }
};

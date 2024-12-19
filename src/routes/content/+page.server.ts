import { error } from '@sveltejs/kit';

import { list } from '$lib/markdown';

export const load = async () => {
  try {
    return await list();
  } catch {
    throw error(404, 'Not found');
  }
};

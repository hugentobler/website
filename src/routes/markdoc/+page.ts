import { get } from '$lib/markdown';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // get the markdown file from the catchall route
  return await get('bowtie');
};

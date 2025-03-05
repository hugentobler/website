import { single } from '$lib/markdoc/import';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // Try to import the markdown file with the catchall slug
  return await single(params.catchall);
};

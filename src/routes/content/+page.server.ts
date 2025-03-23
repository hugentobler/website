import { all as importAll } from '$lib/markdoc/import';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return await importAll();
};

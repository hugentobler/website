// import { single as importSingle } from '$lib/markdoc/import';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // Try to import the markdown file with the catchall slug
  // return await importSingle(params.catchall);

  try {
    const markdown = await import(`../../markdown/${params.catchall}.md`);

    console.log(markdown.default);
  } catch (error) {
    console.error(error);
  }
};

import { single as importSingle } from '$lib/markdoc/import';

// import markdown from '../../markdown/default.md';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // Try to import the markdown file with the catchall slug
  return await importSingle(params.catchall);

  // try {
  //   const page = await import(`../../markdown/${params.catchall}.md`);
  //   return {
  //     content: page.default
  //   };
  // } catch (error) {
  //   console.error(error);
  // }

  // try {
  //   const markdown = await import(`../../markdown/${params.catchall}.md`);

  //   return {
  //     content: markdown.default
  //   };
  // } catch (error) {
  //   console.error(error);
  // }
};

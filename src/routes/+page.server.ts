import type { PageServerLoad } from "./$types";

/** Provide posts data to page
 *  Ref: https://svelte.dev/docs/kit/load#Making-fetch-requests */
const load: PageServerLoad = async ({ fetch }) => {
  const response = await fetch("/posts");
  const posts = await response.json();
  return { posts };
};

export { load };

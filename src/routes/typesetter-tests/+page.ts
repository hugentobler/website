import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url }) => {
  const scenario = url.searchParams.get("scenario") ?? "default";
  return { scenario };
};

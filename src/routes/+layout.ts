/*
  Root layout settings.
  Prerender by default. Individual routes can opt out with prerender = false.
  hooks.server.ts runs during prerendering (build time) to produce .md files
  and inject <link rel="alternate"> tags into static HTML.
*/
export const prerender = true;

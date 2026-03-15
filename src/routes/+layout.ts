/*
  Root layout settings.
  Prerender off by default — only explicitly opted-in routes get prerendered.
  In production, hooks.server.ts 404s any route not in ALLOWED_PATHS.
*/
export const prerender = false;

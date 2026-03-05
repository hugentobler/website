# Typesetter Tests Context

## Purpose
- Fixture route and docs for typesetter E2E coverage.
- Keep behavior aligned with unit tests in `tests/typesetter`.

## Notes
- Route is dev-only and not prerendered (`+page.server.ts` sets `prerender = false`).
- Playwright uses the scenario matrix via `?scenario=default|narrow|short|wide`.
- E2E checks overlap/bounds plus one flow-group assertion.

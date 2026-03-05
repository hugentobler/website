# Typesetter Testing

## Goals
- Validate placement invariants for flow grouping, override spans, baseline snapping, and in-bounds layout.
- Exercise browser layout variability with deterministic fixtures across multiple viewport/container sizes.

## Invariants
- Flow nodes group into a single placement until the slot max rows are reached.
- Override-span nodes place independently and never overlap flow placements.
- Baseline snapping applies to headings/paragraphs and rounds up to the next baseline.
- All placed items stay in bounds and never overlap.

## Test Layers
- Unit tests (Vitest + jsdom): `measureNodes`, `findFirstFit`, `placeNodesOnPages`.
- Browser tests (Playwright): render harness and assert placement invariants in Chromium/Firefox/WebKit.

## Fixture Route
- Route: `/typesetter-tests` with headings, paragraphs, images, and figures.
- Scenario matrix is controlled by `?scenario=default|narrow|short|wide`.
- The route is dev-only: `src/routes/typesetter-tests/+page.server.ts` throws 404 outside dev.
- The route is excluded from static generation via `export const prerender = false`.

## Scenario Matrix
- `default`: 960x640, 4 columns
- `narrow`: 480x640, 2 columns
- `short`: 960x360, 4 columns
- `wide`: 1200x720, 6 columns

## What The E2E Test Asserts
- Every page has non-zero rows/cols.
- All placements stay in bounds and never overlap.
- At least one flow-group placement contains multiple flow fixtures and no override-span nodes.
- At least one override-span node exists in the fixture.

## Running
- Unit: `bun run test`
- Browser: `bun run test:e2e` (Playwright launches a dev server)

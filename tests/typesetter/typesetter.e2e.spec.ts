import { expect, test } from "@playwright/test";

test.describe("typesetter harness", () => {
	const scenarios = ["default", "narrow", "short", "wide"] as const;

	for (const scenario of scenarios) {
		test(`places items without overlap in ${scenario}`, async ({ page }) => {
			await page.goto(`/typesetter-tests?scenario=${scenario}`);
			await page.locator("[data-t8r-root][data-t8r-ready]").first().waitFor();

			const pages = page.locator("[data-t8r-page]");
			const pageCount = await pages.count();
			expect(pageCount).toBeGreaterThan(0);

			for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
				const pageEl = pages.nth(pageIndex);
				const cols = Number(await pageEl.getAttribute("data-t8r-cols"));
				const rows = Number(await pageEl.getAttribute("data-t8r-rows"));
				expect(cols).toBeGreaterThan(0);
				expect(rows).toBeGreaterThan(0);

				const placements = await pageEl.locator("[data-t8r-item]").evaluateAll((elements) =>
					elements.map((element) => ({
						colSpan: Number(element.getAttribute("data-t8r-col-span")),
						colStart: Number(element.getAttribute("data-t8r-col-start")),
						rowSpan: Number(element.getAttribute("data-t8r-row-span")),
						rowStart: Number(element.getAttribute("data-t8r-row-start")),
					})),
				);

				const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));

				for (const item of placements) {
					const colStart = item.colStart - 1;
					const rowStart = item.rowStart - 1;
					const colEnd = colStart + item.colSpan;
					const rowEnd = rowStart + item.rowSpan;
					expect(colStart).toBeGreaterThanOrEqual(0);
					expect(rowStart).toBeGreaterThanOrEqual(0);
					expect(colEnd).toBeLessThanOrEqual(cols);
					expect(rowEnd).toBeLessThanOrEqual(rows);

					for (let row = rowStart; row < rowEnd; row += 1) {
						for (let col = colStart; col < colEnd; col += 1) {
							expect(grid[row][col]).toBe(false);
							grid[row][col] = true;
						}
					}
				}
			}

			const hasFlowGroup = await page.locator("[data-t8r-item]").evaluateAll((elements) =>
				elements.some((element) => {
					const flowFixtures = element.querySelectorAll("[data-fixture]:not([data-t8r-span])");
					const overrideInside = element.querySelectorAll("[data-t8r-span]");
					return flowFixtures.length >= 2 && overrideInside.length === 0;
				}),
			);
			expect(hasFlowGroup).toBe(true);

			const overrideCount = await page.locator("[data-t8r-span]").count();
			expect(overrideCount).toBeGreaterThan(0);
		});
	}
});

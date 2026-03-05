import { describe, expect, it } from "vitest";
import type { PlacedNode } from "../../src/lib/typesetter/core";
import { findFirstFit, placeNodesOnPages } from "../../src/lib/typesetter/core";

const makeGrid = (rows: number, cols: number): boolean[][] =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));

type TestNode = Parameters<typeof placeNodesOnPages>[0][number];

const makeNode = (
  overrides: Partial<TestNode> & Pick<TestNode, "id">,
): TestNode => ({
  canSkipFlowBreak: overrides.canSkipFlowBreak ?? false,
  gridColSpan: overrides.gridColSpan ?? 1,
  gridRowSpan: overrides.gridRowSpan ?? 1,
  heightPx: overrides.heightPx ?? 10,
  html: overrides.html ?? `<div data-node="${overrides.id}"></div>`,
  id: overrides.id,
  isFlowNode: overrides.isFlowNode ?? true,
});

const assertNoOverlap = (
  page: PlacedNode[],
  cols: number,
  rows: number,
): void => {
  const grid = makeGrid(rows, cols);
  for (const item of page) {
    const colStart = item.gridColStart - 1;
    const rowStart = item.gridRowStart - 1;
    const colEnd = colStart + item.gridColSpan;
    const rowEnd = rowStart + item.gridRowSpan;
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
};

describe("typesetter placement", () => {
  it("findFirstFit places in scan order and marks occupancy", () => {
    const grid = makeGrid(2, 3);
    const nodeA = makeNode({ id: "a", isFlowNode: false });
    const nodeB = makeNode({ id: "b", isFlowNode: false });

    const placedA = findFirstFit(grid, nodeA, 3, 2);
    const placedB = findFirstFit(grid, nodeB, 3, 2);

    expect(placedA?.gridColStart).toBe(1);
    expect(placedA?.gridRowStart).toBe(1);
    expect(placedB?.gridColStart).toBe(2);
    expect(placedB?.gridRowStart).toBe(1);
  });

  it("groups consecutive flow nodes into one placement", () => {
    const nodes = [
      makeNode({ gridColSpan: 2, html: "<p data-flow='a'></p>", id: "a" }),
      makeNode({ gridColSpan: 2, html: "<p data-flow='b'></p>", id: "b" }),
      makeNode({ gridColSpan: 2, html: "<p data-flow='c'></p>", id: "c" }),
    ];

    const pages = placeNodesOnPages(nodes, 2, 3, 0, 10);

    expect(pages).toHaveLength(1);
    expect(pages[0]).toHaveLength(1);
    expect(pages[0][0].gridRowSpan).toBe(3);
    expect(pages[0][0].html).toContain("data-flow='a'");
    expect(pages[0][0].html).toContain("data-flow='c'");
  });

  it("skips override-span images while grouping flow nodes", () => {
    const nodes = [
      makeNode({ gridColSpan: 2, html: "<p data-flow='a'></p>", id: "a" }),
      makeNode({
        canSkipFlowBreak: true,
        gridColSpan: 1,
        gridRowSpan: 1,
        heightPx: 10,
        html: "<img data-override='img' />",
        id: "img",
        isFlowNode: false,
      }),
      makeNode({ gridColSpan: 2, html: "<p data-flow='b'></p>", id: "b" }),
    ];

    const pages = placeNodesOnPages(nodes, 2, 3, 0, 10);

    expect(pages[0]).toHaveLength(2);
    const flowGroup = pages[0].find((item) => item.isFlowNode);
    expect(flowGroup?.html).toContain("data-flow='a'");
    expect(flowGroup?.html).toContain("data-flow='b'");
    expect(flowGroup?.html).not.toContain("data-override");
  });

  it("keeps placements in bounds with no overlaps", () => {
    const nodes = [
      makeNode({ gridColSpan: 2, gridRowSpan: 1, id: "flow-1" }),
      makeNode({
        gridColSpan: 1,
        gridRowSpan: 2,
        id: "override-1",
        isFlowNode: false,
      }),
      makeNode({ gridColSpan: 2, gridRowSpan: 1, id: "flow-2" }),
      makeNode({
        gridColSpan: 2,
        gridRowSpan: 1,
        id: "override-2",
        isFlowNode: false,
      }),
    ];

    const pages = placeNodesOnPages(nodes, 3, 4, 0, 10);

    expect(pages.length).toBeGreaterThan(0);
    for (const page of pages) {
      assertNoOverlap(page, 3, 4);
    }
  });
});

/**
 * Definitions
 * - BASELINE_PX: baseline rhythm used to derive row sizes.
 * - defaultColSpan: default column span for flow nodes (passed into measureNodes).
 * - OVERRIDE_SPAN_ATTR: attribute name for override-span nodes (data-t8r-span).
 * - Node: measured block with grid spans, height, flow flag, html, id.
 * - PlacedNode: positioned node with grid start coords + spans, html, id.
 * - gridRowsForHeight: converts height -> row span with row height + gap.
 * - measureNodes: measures top-level nodes in ghost, sets widths, returns Node[].
 * - placeNodesOnPages: global first-fit placement across pages, grouping flow nodes.
 * - groupFlowNodes: groups consecutive default-span nodes to fit slot height.
 * - findFirstFlowSlot: finds first available slot for default-span node.
 * - findFirstFit: places override-span nodes in first available grid location.
 * - createGrid/getRowMasks/fits/mark: occupancy grid helpers.
 * - readOverrideSpan: parses data-t8r-span from top-level node.
 */
export const BASELINE_PX = 20;
const OVERRIDE_SPAN_ATTR = "data-t8r-span";

type Node = {
  /**
   * Represents a single top-level ghost child; nested content stays inside this node.
   * Measured from the ghost DOM, then converted into grid spans for placement.
   */
  id: string;
  html: string;
  isFlowNode: boolean; // Uses default span; eligible for grouping.
  heightPx: number;
  gridRowSpan: number;
  gridColSpan: number;
  canSkipFlowBreak: boolean;
};

export type PlacedNode = {
  /**
   * Final positioned node with grid start coordinates for rendering.
   * This is the output of placement and input for page rendering.
   */
  id: string;
  html: string;
  isFlowNode: boolean;
  gridColStart: number;
  gridColSpan: number;
  gridRowStart: number;
  gridRowSpan: number;
};

/**
 * Convert a measured pixel height into the number of grid rows required.
 */
const gridRowsForHeight = (
  heightPx: number,
  rowGapPx: number,
  rowHeiPx: number,
): number =>
  Math.max(1, Math.ceil((heightPx + rowGapPx) / (rowHeiPx + rowGapPx)));

const readOverrideSpan = (node: HTMLElement): number | null => {
  const raw = node.getAttribute(OVERRIDE_SPAN_ATTR);
  if (!raw) return null;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
};

/**
 * Measure each top-level element at its intended column width and translate that height
 * into grid rows.
 * Column width is determined by either an override (data-t8r-span) or defaultColSpan.
 * The node is sized in the ghost at that width, then measured to compute gridRowSpan.
 */
export const measureNodes = (
  root: HTMLElement,
  rowGapPx: number,
  rowHeiPx: number,
  pageGridCols: number,
  colGapPx: number,
  colWidPx: number,
  defaultColSpan: number,
): Node[] => {
  if (!Number.isFinite(defaultColSpan) || defaultColSpan <= 0) {
    throw new Error("measureNodes: defaultColSpan must be a positive number.");
  }
  const nodes = Array.from(root.children) as HTMLElement[];
  return nodes.map((node, index) => {
    const overrideSpan = readOverrideSpan(node);
    const canSkipFlowBreak =
      overrideSpan !== null && (node.tagName === "FIGURE" || node.tagName === "IMG");
    const rawColSpan = overrideSpan ?? defaultColSpan;
    const colSpan = Math.min(rawColSpan, pageGridCols);
    const widthPx = Math.max(
      0,
      colSpan * colWidPx + Math.max(0, colSpan - 1) * colGapPx,
    );
    node.style.width = widthPx > 0 ? `${widthPx}px` : "";
    const heightPx = node.getBoundingClientRect().height;
    const rowSpan = gridRowsForHeight(heightPx, rowGapPx, rowHeiPx);
    return {
      gridColSpan: colSpan,
      gridRowSpan: rowSpan,
      heightPx,
      html: node.outerHTML,
      id: `t8r-node-${index}`,
      isFlowNode: overrideSpan === null,
      canSkipFlowBreak,
    };
  });
};

/**
 * Place measured nodes into grid pages using global first-fit.
 * Nodes are processed in source order, but each node is placed into the first page
 * where it fits; pages are never closed, so later nodes can backfill earlier gaps.
 * Flow nodes (isFlowNode) are grouped to fit the slot's available rows.
 * Override-span nodes (isFlowNode = false) are placed individually.
 * No force-fit: if a node/group cannot fit a slot's rows, it is not placed there.
 */
export const placeNodesOnPages = (
  nodes: Node[],
  pageGridCols: number,
  pageGridRows: number,
  rowGapPx: number,
  rowHeiPx: number,
): PlacedNode[][] => {
  const pages: PlacedNode[][] = [];
  const grids: boolean[][][] = [];
  const consumedFlowNodes = new Set<number>();
  let flowCursor: { pageIndex: number; row: number; col: number } | null = null;

  const ensurePage = (pageIndex: number) => {
    if (!pages[pageIndex]) pages[pageIndex] = [];
    if (!grids[pageIndex])
      grids[pageIndex] = createGrid(pageGridRows, pageGridCols);
  };

  const createNewPage = () => {
    const pageIndex = pages.length;
    pages.push([]);
    grids.push(createGrid(pageGridRows, pageGridCols));
    return pageIndex;
  };

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.isFlowNode) {
      if (consumedFlowNodes.has(index)) continue;
			const minRows = node.gridRowSpan;
      let placed = false;
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
        if (flowCursor && pageIndex < flowCursor.pageIndex) continue;
        ensurePage(pageIndex);
        const grid = grids[pageIndex];
				const slot = findFirstFlowSlot(
          grid,
          node.gridColSpan,
          minRows,
          pageGridCols,
          pageGridRows,
          flowCursor && pageIndex === flowCursor.pageIndex
            ? { row: flowCursor.row, col: flowCursor.col }
            : null,
        );
        if (!slot) continue;

        const { groupedNode, consumedIndexes } = groupFlowNodes(
          nodes,
          index,
          slot.maxRows,
          node.gridColSpan,
          rowGapPx,
          rowHeiPx,
          consumedFlowNodes,
        );
        for (const consumedIndex of consumedIndexes) {
          consumedFlowNodes.add(consumedIndex);
        }
        const placement = placeAt(
          grid,
          slot.rowMasks,
          groupedNode,
          slot.row,
          slot.col,
        );
        pages[pageIndex].push(placement);
        flowCursor = {
          pageIndex,
          row: slot.row + groupedNode.gridRowSpan - 1,
          col: slot.col + groupedNode.gridColSpan - 1,
        };
        placed = true;
        break;
      }

      if (!placed) {
        const pageIndex = createNewPage();
        const grid = grids[pageIndex];
				const slot = findFirstFlowSlot(
          grid,
          node.gridColSpan,
          minRows,
          pageGridCols,
          pageGridRows,
          flowCursor && pageIndex === flowCursor.pageIndex
            ? { row: flowCursor.row, col: flowCursor.col }
            : null,
        );
        if (!slot) continue;
        const { groupedNode, consumedIndexes } = groupFlowNodes(
          nodes,
          index,
          slot.maxRows,
          node.gridColSpan,
          rowGapPx,
          rowHeiPx,
          consumedFlowNodes,
        );
        for (const consumedIndex of consumedIndexes) {
          consumedFlowNodes.add(consumedIndex);
        }
        const placement = placeAt(
          grid,
          slot.rowMasks,
          groupedNode,
          slot.row,
          slot.col,
        );
        pages[pageIndex].push(placement);
        flowCursor = {
          pageIndex,
          row: slot.row + groupedNode.gridRowSpan - 1,
          col: slot.col + groupedNode.gridColSpan - 1,
        };
      }
      continue;
    }

    if (node.gridRowSpan > pageGridRows) {
      continue;
    }

    let placed = false;
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
      ensurePage(pageIndex);
      const grid = grids[pageIndex];
      const placement = findFirstFit(grid, node, pageGridCols, pageGridRows);
      if (!placement) continue;
      pages[pageIndex].push(placement);
      placed = true;
      break;
    }

    if (!placed) {
      const pageIndex = createNewPage();
      const grid = grids[pageIndex];
      const placement = findFirstFit(grid, node, pageGridCols, pageGridRows);
      if (!placement) continue;
      pages[pageIndex].push(placement);
    }
  }

  return pages.filter((page) => page.length > 0);
};

const createGrid = (rows: number, columns: number): boolean[][] => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => false),
  );
};

const groupFlowNodes = (
  nodes: Node[],
  startIndex: number,
  maxRows: number,
  colSpan: number,
  rowGapPx: number,
  rowHeiPx: number,
  consumedFlowNodes: Set<number>,
): { groupedNode: Node; consumedIndexes: number[] } => {
  const html: string[] = [];
  let heightPx = 0;
  let rowSpan = 0;
  const consumedIndexes: number[] = [];

  for (let index = startIndex; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (!node.isFlowNode) {
      if (node.canSkipFlowBreak) continue;
      break;
    }
    if (consumedFlowNodes.has(index)) break;
    const nextHeightPx = heightPx + node.heightPx;
    const nextRowSpan = gridRowsForHeight(nextHeightPx, rowGapPx, rowHeiPx);
    if (nextRowSpan > maxRows) break;
    heightPx = nextHeightPx;
    rowSpan = nextRowSpan;
    html.push(node.html);
    consumedIndexes.push(index);
  }

  const groupedNode: Node = {
    gridColSpan: colSpan,
    gridRowSpan: Math.max(1, rowSpan),
    heightPx,
    html: html.join(""),
    id: `t8r-group-${startIndex}`,
    isFlowNode: true,
  };

  return { groupedNode, consumedIndexes };
};

const placeAt = (
  grid: boolean[][],
  rowMasks: number[],
  node: Node,
  row: number,
  col: number,
): PlacedNode => {
  mark(grid, rowMasks, row, col, node);
  return {
    gridColSpan: node.gridColSpan,
    gridColStart: col + 1,
    gridRowSpan: node.gridRowSpan,
    gridRowStart: row + 1,
    html: node.html,
    id: node.id,
    isFlowNode: node.isFlowNode,
  };
};

const findFirstFlowSlot = (
	grid: boolean[][],
	colSpan: number,
	minRows: number,
  pageGridCols: number,
  pageGridRows: number,
  minCursor: { row: number; col: number } | null,
): { row: number; col: number; maxRows: number; rowMasks: number[] } | null => {
  const maxRowStart = pageGridRows - 1;
  const maxColStart = pageGridCols - colSpan;
  if (maxColStart < 0) return null;
  const rowMasks = getRowMasks(grid, pageGridCols);
  const mask = (1 << colSpan) - 1;
  const isAfterCursor = (row: number, col: number): boolean => {
    if (!minCursor) return true;
    if (col > minCursor.col) return true;
    if (col < minCursor.col) return false;
    return row > minCursor.row;
  };

  for (let row = 0; row <= maxRowStart; row += 1) {
    for (let col = 0; col <= maxColStart; col += 1) {
      if (!isAfterCursor(row, col)) continue;
      const shiftedMask = mask << col;
      if (rowMasks[row] & shiftedMask) continue;
      let maxRows = 0;
      for (let r = row; r < pageGridRows; r += 1) {
        if (rowMasks[r] & shiftedMask) break;
        maxRows += 1;
      }
      if (maxRows >= minRows) {
        return { col, maxRows, row, rowMasks };
      }
    }
  }

  return null;
};

export const findFirstFit = (
  grid: boolean[][],
  node: Node,
  pageGridCols: number,
  pageGridRows: number,
): PlacedNode | null => {
  const maxRowStart = pageGridRows - node.gridRowSpan;
  const maxColStart = pageGridCols - node.gridColSpan;
  if (maxRowStart < 0 || maxColStart < 0) return null;
  const rowMasks = getRowMasks(grid, pageGridCols);

  for (let row = 0; row <= maxRowStart; row += 1) {
    for (let col = 0; col <= maxColStart; col += 1) {
      if (!fits(rowMasks, row, col, node)) continue;
      mark(grid, rowMasks, row, col, node);
      return {
        gridColSpan: node.gridColSpan,
        gridColStart: col + 1,
        gridRowSpan: node.gridRowSpan,
        gridRowStart: row + 1,
        html: node.html,
        id: node.id,
        isFlowNode: node.isFlowNode,
      };
    }
  }

  return null;
};

const getRowMasks = (grid: boolean[][], columns: number): number[] => {
  return grid.map((row) => {
    let mask = 0;
    for (let col = 0; col < columns; col += 1) {
      if (row[col]) mask |= 1 << col;
    }
    return mask;
  });
};

const fits = (
  rowMasks: number[],
  rowStart: number,
  colStart: number,
  node: Node,
): boolean => {
  const mask = ((1 << node.gridColSpan) - 1) << colStart;
  for (let row = rowStart; row < rowStart + node.gridRowSpan; row += 1) {
    if (rowMasks[row] & mask) return false;
  }

  return true;
};

const mark = (
  grid: boolean[][],
  rowMasks: number[],
  rowStart: number,
  colStart: number,
  node: Node,
): void => {
  const mask = ((1 << node.gridColSpan) - 1) << colStart;
  for (let row = rowStart; row < rowStart + node.gridRowSpan; row += 1) {
    for (let col = colStart; col < colStart + node.gridColSpan; col += 1) {
      grid[row][col] = true;
    }
    rowMasks[row] |= mask;
  }
};

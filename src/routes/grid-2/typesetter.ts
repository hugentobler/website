export const BASELINE_PX = 20;
const IMAGE_COL_SPAN = 2;
export const TEXT_COL_SPAN = 2;

type NodeType = "text" | "image";

type Node = {
  /**
   * Represents a single top-level ghost child; nested content stays inside this node.
   * Measured from the ghost DOM, then converted into grid spans for placement.
   */
  id: string;
  html: string;
  type: NodeType;
  heightPx: number;
  gridRowSpan: number;
  gridColSpan: number;
};

export type PlacedNode = {
  /**
   * Final positioned node with grid start coordinates for rendering.
   * This is the output of placement and input for page rendering.
   */
  id: string;
  html: string;
  type: NodeType;
  gridColStart: number;
  gridColSpan: number;
  gridRowStart: number;
  gridRowSpan: number;
};

const isMediaElement = (node: Element): boolean =>
  node.tagName === "FIGURE" ||
  node.tagName === "IMG" ||
  node.tagName === "PICTURE";

/**
 * Identify nodes that represent image blocks, including markdown wrappers like <p><figure>...</figure></p>.
 */
const nodeIsImage = (node: HTMLElement): boolean => {
  if (isMediaElement(node)) return true;
  const imageEl = node.querySelector("img");
  if (!imageEl) return false;

  if (node.children.length === 1) {
    const onlyChild = node.children[0];
    if (isMediaElement(onlyChild)) return true;
    if (onlyChild.querySelector("img, picture, figure")) return true;
  }

  if (node.tagName === "P") {
    return node.textContent?.trim() === "";
  }

  return true;
};

const rowSpanForHeight = (
  heightPx: number,
  pageGridRowGapPx: number,
  pageGridRowHeightPx: number,
): number =>
  Math.max(
    1,
    Math.ceil(
      (heightPx + pageGridRowGapPx) / (pageGridRowHeightPx + pageGridRowGapPx),
    ),
  );

/**
 * Measure top-level nodes and derive grid spans from the row rhythm.
 * Note: we intentionally measure block-level children of the markdown wrapper
 * so images wrapped in paragraphs/figures become their own nodes (no text grouping).
 */
export const measureNodes = (
  root: HTMLElement,
  pageGridRowGapPx: number,
  pageGridRowHeightPx: number,
  pageGridCols: number,
  pageGridColGapPx: number,
  pageGridColWidthPx: number,
): Node[] => {
  const blockRoot = getBlockRoot(root);
  const nodes = Array.from(
    blockRoot.querySelectorAll(":scope > *"),
  ) as HTMLElement[];
  return nodes.map((node, index) => {
    const isImage = nodeIsImage(node);
    const rawColSpan = isImage ? IMAGE_COL_SPAN : TEXT_COL_SPAN;
    const colSpan = Math.min(rawColSpan, pageGridCols);
    const widthPx = Math.max(
      0,
      colSpan * pageGridColWidthPx +
        Math.max(0, colSpan - 1) * pageGridColGapPx,
    );
    node.style.width = widthPx > 0 ? `${widthPx}px` : "";
    const heightPx = node.getBoundingClientRect().height;
    const rowSpan = rowSpanForHeight(
      heightPx,
      pageGridRowGapPx,
      pageGridRowHeightPx,
    );
    return {
      gridColSpan: rawColSpan,
      gridRowSpan: rowSpan,
      heightPx,
      html: node.outerHTML,
      id: `typesetter-${index}`,
      type: isImage ? "image" : "text",
    };
  });
};

const getBlockRoot = (root: HTMLElement): HTMLElement => {
  const elementChildren = Array.from(root.children) as HTMLElement[];
  if (elementChildren.length === 1) {
    const child = elementChildren[0];
    if (["DIV", "ARTICLE", "SECTION", "MAIN"].includes(child.tagName)) {
      return child;
    }
  }

  return root;
};

/**
 * Group consecutive text nodes into column-length chunks.
 */
export const groupNodes = (
  nodes: Node[],
  pageGridRows: number,
  pageGridRowGapPx: number,
  pageGridRowHeightPx: number,
): Node[] => {
  const grouped: Node[] = [];
  // Accumulate consecutive text nodes into a single column group.
  let textGroup: {
    html: string[];
    gridRowSpan: number;
    heightPx: number;
  } | null = null;
  let imageGroup: {
    html: string[];
    gridColSpan: number;
    gridRowSpan: number;
    heightPx: number;
  } | null = null;
  let groupIndex = 0;

  // Commit the current text group into the output list.
  const flushTextGroup = () => {
    if (!textGroup) return;
    grouped.push({
      gridColSpan: TEXT_COL_SPAN,
      gridRowSpan: textGroup.gridRowSpan,
      heightPx: textGroup.heightPx,
      html: textGroup.html.join(""),
      id: `typesetter-group-${groupIndex}`,
      type: "text",
    });
    groupIndex += 1;
    textGroup = null;
  };

  const flushImageGroup = () => {
    if (!imageGroup) return;
    grouped.push({
      gridColSpan: imageGroup.gridColSpan,
      gridRowSpan: imageGroup.gridRowSpan,
      heightPx: imageGroup.heightPx,
      html: imageGroup.html.join(""),
      id: `typesetter-group-${groupIndex}`,
      type: "image",
    });
    groupIndex += 1;
    imageGroup = null;
  };

  for (const node of nodes) {
    if (node.type === "text") {
      flushImageGroup();
      // Start a new text group if none exists.
      if (!textGroup) {
        textGroup = {
          gridRowSpan: rowSpanForHeight(
            node.heightPx,
            pageGridRowGapPx,
            pageGridRowHeightPx,
          ),
          heightPx: node.heightPx,
          html: [node.html],
        };
        continue;
      }

      // Append to the current group if it fits in the column height.
      const nextHeightPx = textGroup.heightPx + node.heightPx;
      const nextRowSpan = rowSpanForHeight(
        nextHeightPx,
        pageGridRowGapPx,
        pageGridRowHeightPx,
      );
      if (nextRowSpan <= pageGridRows) {
        textGroup.html.push(node.html);
        textGroup.heightPx = nextHeightPx;
        textGroup.gridRowSpan = nextRowSpan;
        continue;
      }

      // Otherwise, flush and start a new group.
      flushTextGroup();
      textGroup = {
        gridRowSpan: rowSpanForHeight(
          node.heightPx,
          pageGridRowGapPx,
          pageGridRowHeightPx,
        ),
        heightPx: node.heightPx,
        html: [node.html],
      };
      continue;
    }

    if (node.type === "image") {
      flushTextGroup();
      // Start a new image group if none exists.
      if (!imageGroup) {
        imageGroup = {
          gridColSpan: node.gridColSpan,
          gridRowSpan: rowSpanForHeight(
            node.heightPx,
            pageGridRowGapPx,
            pageGridRowHeightPx,
          ),
          heightPx: node.heightPx,
          html: [node.html],
        };
        continue;
      }

      if (node.gridColSpan !== imageGroup.gridColSpan) {
        flushImageGroup();
        imageGroup = {
          gridColSpan: node.gridColSpan,
          gridRowSpan: rowSpanForHeight(
            node.heightPx,
            pageGridRowGapPx,
            pageGridRowHeightPx,
          ),
          heightPx: node.heightPx,
          html: [node.html],
        };
        continue;
      }

      const nextHeightPx = imageGroup.heightPx + node.heightPx;
      const nextRowSpan = rowSpanForHeight(
        nextHeightPx,
        pageGridRowGapPx,
        pageGridRowHeightPx,
      );
      if (nextRowSpan <= pageGridRows) {
        imageGroup.html.push(node.html);
        imageGroup.heightPx = nextHeightPx;
        imageGroup.gridRowSpan = nextRowSpan;
        continue;
      }

      flushImageGroup();
      imageGroup = {
        gridColSpan: node.gridColSpan,
        gridRowSpan: rowSpanForHeight(
          node.heightPx,
          pageGridRowGapPx,
          pageGridRowHeightPx,
        ),
        heightPx: node.heightPx,
        html: [node.html],
      };
    }
  }

  // Flush any remaining text group after the loop.
  flushTextGroup();
  flushImageGroup();
  return grouped;
};

/**
 * Place grouped nodes onto pages using an occupancy grid.
 */
export const placeNodesOnPages = (
  nodes: Node[],
  pageGridCols: number,
  pageGridRows: number,
): PlacedNode[][] => {
  const pages: PlacedNode[][] = [];
  let currentPage: PlacedNode[] = [];
  let grid = createGrid(pageGridRows, pageGridCols);

  // Finalize the current page and reset the page-level occupancy grid.
  const pushPage = () => {
    if (currentPage.length === 0) return;
    pages.push(currentPage);
    currentPage = [];
    grid = createGrid(pageGridRows, pageGridCols);
  };

  const applyPlacement = (placement: PlacedNode) => {
    // Track placements on the current page.
    currentPage.push(placement);
  };

  for (const node of nodes) {
    const normalizedNode = {
      ...node,
      // Clamp to the available column count so oversized content uses the closest fit.
      gridColSpan: Math.min(node.gridColSpan, pageGridCols),
    };
    // TODO: Surface skipped nodes (e.g., warn or collect) instead of dropping silently.
    // Skip nodes that cannot fit the grid at all.
    if (normalizedNode.gridRowSpan > pageGridRows) {
      continue;
    }

    // Try to place on the current page first.
    let placement = placeNodeOnGrid(
      grid,
      normalizedNode,
      pageGridCols,
      pageGridRows,
    );
    if (!placement) {
      // Start a new page and retry placement once.
      pushPage();
      placement = placeNodeOnGrid(
        grid,
        normalizedNode,
        pageGridCols,
        pageGridRows,
      );
      if (!placement) continue;
    }

    applyPlacement(placement);
  }

  // Flush the trailing page after all nodes are processed.
  pushPage();
  return pages;
};

/**
 * Creates an empty page occupancy grid.
 */
const createGrid = (rows: number, columns: number): boolean[][] => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => false),
  );
};

/**
 * Finds the first placement for a node and marks the grid when placed.
 */
const placeNodeOnGrid = (
  grid: boolean[][],
  node: Node,
  pageGridCols: number,
  pageGridRows: number,
): PlacedNode | null => {
  const maxRowStart = pageGridRows - node.gridRowSpan;
  const maxColStart = pageGridCols - node.gridColSpan;
  // Precompute row masks for fast overlap checks.
  const rowMasks = getRowMasks(grid, pageGridCols);

  for (let col = 0; col <= maxColStart; col += 1) {
    // Scan rows within this column start.
    for (let row = 0; row <= maxRowStart; row += 1) {
      if (!fits(rowMasks, row, col, node)) continue;
      mark(grid, rowMasks, row, col, node);
      return {
        gridColSpan: node.gridColSpan,
        gridColStart: col + 1,
        gridRowSpan: node.gridRowSpan,
        gridRowStart: row + 1,
        html: node.html,
        id: node.id,
        type: node.type,
      };
    }
  }

  return null;
};

/**
 * Converts each occupancy row into a bitmask for quick intersection tests.
 */
const getRowMasks = (grid: boolean[][], columns: number): number[] => {
  return grid.map((row) => {
    let mask = 0;
    for (let col = 0; col < columns; col += 1) {
      if (row[col]) mask |= 1 << col;
    }
    return mask;
  });
};

/**
 * Checks whether a node fits at the given row/col start.
 */
const fits = (
  rowMasks: number[],
  rowStart: number,
  colStart: number,
  node: Node,
): boolean => {
  // Build a bitmask covering the node's column span.
  const mask = ((1 << node.gridColSpan) - 1) << colStart;
  for (let row = rowStart; row < rowStart + node.gridRowSpan; row += 1) {
    if (rowMasks[row] & mask) return false;
  }

  return true;
};

/**
 * Marks occupied cells and updates row masks after placement.
 */
const mark = (
  grid: boolean[][],
  rowMasks: number[],
  rowStart: number,
  colStart: number,
  node: Node,
): void => {
  // Update grid cells and row masks for the node span.
  const mask = ((1 << node.gridColSpan) - 1) << colStart;
  for (let row = rowStart; row < rowStart + node.gridRowSpan; row += 1) {
    for (let col = colStart; col < colStart + node.gridColSpan; col += 1) {
      grid[row][col] = true;
    }
    rowMasks[row] |= mask;
  }
};

export type BlockType = "text" | "image";

export type MeasuredBlock = {
  /**
   * Measurement output for a single top-level block element.
   * Grid spans are derived from DOM height and the baseline line height.
   */
  id: string;
  html: string;
  type: BlockType;
  height: number;
  gridRowSpan: number;
  gridColSpan: number;
};

export type LayoutItem = {
  /**
   * Final positioned element ready for rendering.
   * This is the output of placement.
   */
  id: string;
  html: string;
  type: BlockType;
  gridColStart: number;
  gridColSpan: number;
  gridRowStart: number;
  gridRowSpan: number;
};

export type Config = {
  pageGridCols: number;
  pageGridRows: number;
  baseLineHeightPx: number;
  textColSpan: number;
  imageColSpan: number;
};

export const DEFAULT_CONFIG: Config = {
  baseLineHeightPx: 24,
  imageColSpan: 6,
  pageGridCols: 6,
  pageGridRows: 9,
  textColSpan: 6,
};

export function measureBlocks(
  root: HTMLElement,
  config: Config = DEFAULT_CONFIG,
): MeasuredBlock[] {
  /**
   * Measures each top-level child and derives grid spans from height and baseline.
   * Width is currently a fixed span based on block kind.
   */
  const blocks = Array.from(root.children) as HTMLElement[];
  return blocks.map((block, index) => {
    const height = block.getBoundingClientRect().height;
    const lines = Math.max(1, Math.ceil(height / config.baseLineHeightPx));
    const isImage = block.tagName === "FIGURE";
    return {
      gridColSpan: isImage ? config.imageColSpan : config.textColSpan,
      gridRowSpan: lines,
      height,
      html: block.outerHTML,
      id: `block-${index}`,
      type: isImage ? "image" : "text",
    };
  });
}

export function paginateBlocks(
  measuredBlocks: MeasuredBlock[],
  config: Config = DEFAULT_CONFIG,
): LayoutItem[][] {
  const pages: LayoutItem[][] = [];
  let currentPage: LayoutItem[] = [];
  let grid = createGrid(config.pageGridRows, config.pageGridCols);
  let flowBarrierRow = 0;

  for (const block of measuredBlocks) {
    if (
      block.gridRowSpan > config.pageGridRows ||
      block.gridColSpan > config.pageGridCols
    ) {
      continue;
    }

    const placement = findPlacement(grid, block, config, flowBarrierRow);
    if (!placement) {
      if (currentPage.length > 0) {
        pages.push(currentPage);
      }
      currentPage = [];
      grid = createGrid(config.pageGridRows, config.pageGridCols);
      flowBarrierRow = 0;
      const nextPlacement = findPlacement(grid, block, config, flowBarrierRow);
      if (!nextPlacement) {
        continue;
      }
      currentPage.push(nextPlacement);
      if (nextPlacement.type === "image") {
        flowBarrierRow = Math.max(
          flowBarrierRow,
          nextPlacement.gridRowStart + nextPlacement.gridRowSpan - 1,
        );
      }
      continue;
    }

    currentPage.push(placement);
    if (placement.type === "image") {
      flowBarrierRow = Math.max(
        flowBarrierRow,
        placement.gridRowStart + placement.gridRowSpan - 1,
      );
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}

function createGrid(rows: number, columns: number): boolean[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => false),
  );
}

function findPlacement(
  grid: boolean[][],
  block: MeasuredBlock,
  config: Config,
  minRowStart: number,
): LayoutItem | null {
  const maxRowStart = config.pageGridRows - block.gridRowSpan;
  const maxColStart = config.pageGridCols - block.gridColSpan;

  for (let col = 0; col <= maxColStart; col += block.gridColSpan) {
    for (let row = minRowStart; row <= maxRowStart; row += 1) {
      if (!fits(grid, row, col, block)) continue;
      mark(grid, row, col, block);
      return {
        gridColSpan: block.gridColSpan,
        gridColStart: col + 1,
        gridRowSpan: block.gridRowSpan,
        gridRowStart: row + 1,
        html: block.html,
        id: block.id,
        type: block.type,
      };
    }
  }

  return null;
}

function fits(
  grid: boolean[][],
  rowStart: number,
  colStart: number,
  block: MeasuredBlock,
): boolean {
  for (let row = rowStart; row < rowStart + block.gridRowSpan; row += 1) {
    for (let col = colStart; col < colStart + block.gridColSpan; col += 1) {
      if (grid[row]?.[col]) return false;
    }
  }

  return true;
}

function mark(
  grid: boolean[][],
  rowStart: number,
  colStart: number,
  block: MeasuredBlock,
): void {
  for (let row = rowStart; row < rowStart + block.gridRowSpan; row += 1) {
    for (let col = colStart; col < colStart + block.gridColSpan; col += 1) {
      grid[row][col] = true;
    }
  }
}

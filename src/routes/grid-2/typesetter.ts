export const BASELINE_PX = 20;
const IMAGE_COL_SPAN = 6;
export const TEXT_COL_SPAN = 2;

type NodeType = "text" | "image";

type Node = {
	/**
	 * Measurement output for a single top-level block element.
	 * Grid spans are derived from DOM height and the baseline line height.
	 * This is the bridge between DOM sizing and layout placement.
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
	 * Final positioned element ready for rendering.
	 * This is the output of placement and the input for page rendering.
	 */
	id: string;
	html: string;
	type: NodeType;
	gridColStart: number;
	gridColSpan: number;
	gridRowStart: number;
	gridRowSpan: number;
};

const nodeIsImage = (node: HTMLElement): boolean => node.tagName === "FIGURE";

export const measureNodes = (
	root: HTMLElement,
	pageGridRowGapPx: number,
	pageGridRowHeightPx: number,
): Node[] => {
	/**
	 * Measures each top-level child and derives grid spans from the row rhythm.
	 * Width is currently a fixed span based on block kind.
	 */
	const nodes = Array.from(root.children) as HTMLElement[];
	return nodes.map((node, index) => {
		const heightPx = node.getBoundingClientRect().height;
		const rowSpan = Math.max(
			1,
			Math.ceil((heightPx + pageGridRowGapPx) / (pageGridRowHeightPx + pageGridRowGapPx)),
		);
		const isImage = nodeIsImage(node);
		return {
			gridColSpan: isImage ? IMAGE_COL_SPAN : TEXT_COL_SPAN,
			gridRowSpan: rowSpan,
			heightPx,
			html: node.outerHTML,
			id: `typesetter-${index}`,
			type: isImage ? "image" : "text",
		};
	});
};

export const groupNodes = (nodes: Node[], pageGridRows: number): Node[] => {
	const grouped: Node[] = [];
	// Accumulate consecutive text nodes into a single column group.
	let textGroup: {
		html: string[];
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
			id: `typesetter-${groupIndex}`,
			type: "text",
		});
		groupIndex += 1;
		textGroup = null;
	};

	for (const node of nodes) {
		// Non-text nodes break text flow and stand alone.
		if (node.type !== "text") {
			flushTextGroup();
			grouped.push(node);
			continue;
		}

		// Start a new text group if none exists.
		if (!textGroup) {
			textGroup = {
				gridRowSpan: node.gridRowSpan,
				heightPx: node.heightPx,
				html: [node.html],
			};
			continue;
		}

		// Append to the current group if it fits in the column height.
		if (textGroup.gridRowSpan + node.gridRowSpan <= pageGridRows) {
			textGroup.html.push(node.html);
			textGroup.gridRowSpan += node.gridRowSpan;
			textGroup.heightPx += node.heightPx;
			continue;
		}

		// Otherwise, flush and start a new group.
		flushTextGroup();
		textGroup = {
			gridRowSpan: node.gridRowSpan,
			heightPx: node.heightPx,
			html: [node.html],
		};
	}

	// Flush any remaining text group after the loop.
	flushTextGroup();
	return grouped;
};

export const placeNodesOnPages = (
	nodes: Node[],
	pageGridCols: number,
	pageGridRows: number,
): PlacedNode[][] => {
	/**
	 * Places already-grouped nodes onto pages using a page-level occupancy grid.
	 * Returns pages of placed nodes ready for rendering.
	 */
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
		// Skip nodes that cannot fit the grid at all.
		if (node.gridRowSpan > pageGridRows || node.gridColSpan > pageGridCols) {
			continue;
		}

		// Try to place on the current page first.
		let placement = placeNodeOnGrid(grid, node, pageGridCols, pageGridRows);
		if (!placement) {
			// Start a new page and retry placement once.
			pushPage();
			placement = placeNodeOnGrid(grid, node, pageGridCols, pageGridRows);
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
	return Array.from({ length: rows }, () => Array.from({ length: columns }, () => false));
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
function getRowMasks(grid: boolean[][], columns: number): number[] {
	return grid.map((row) => {
		let mask = 0;
		for (let col = 0; col < columns; col += 1) {
			if (row[col]) mask |= 1 << col;
		}
		return mask;
	});
}

/**
 * Checks whether a node fits at the given row/col start.
 */
function fits(rowMasks: number[], rowStart: number, colStart: number, node: Node): boolean {
	// Build a bitmask covering the node's column span.
	const mask = ((1 << node.gridColSpan) - 1) << colStart;
	for (let row = rowStart; row < rowStart + node.gridRowSpan; row += 1) {
		if (rowMasks[row] & mask) return false;
	}

	return true;
}

/**
 * Marks occupied cells and updates row masks after placement.
 */
function mark(
	grid: boolean[][],
	rowMasks: number[],
	rowStart: number,
	colStart: number,
	node: Node,
): void {
	// Update grid cells and row masks for the node span.
	const mask = ((1 << node.gridColSpan) - 1) << colStart;
	for (let row = rowStart; row < rowStart + node.gridRowSpan; row += 1) {
		for (let col = colStart; col < colStart + node.gridColSpan; col += 1) {
			grid[row][col] = true;
		}
		rowMasks[row] |= mask;
	}
}

export const BASELINE_PX = 20;
const IMAGE_COL_SPAN = 3;
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
	node.tagName === "FIGURE" || node.tagName === "IMG" || node.tagName === "PICTURE";

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

const rowSpanForHeight = (heightPx: number, rowGapPx: number, rowHeiPx: number): number =>
	Math.max(1, Math.ceil((heightPx + rowGapPx) / (rowHeiPx + rowGapPx)));

/**
 * Measure top-level nodes and derive grid spans from the row rhythm.
 * Note: we intentionally measure block-level children of the markdown wrapper
 * so images wrapped in paragraphs/figures become their own nodes (no text grouping).
 */
export const measureNodes = (
	root: HTMLElement,
	rowGapPx: number,
	rowHeiPx: number,
	pageGridCols: number,
	colGapPx: number,
	colWidPx: number,
): Node[] => {
	const blockRoot = getBlockRoot(root);
	const nodes = Array.from(blockRoot.querySelectorAll(":scope > *")) as HTMLElement[];
	return nodes.map((node, index) => {
		const isImage = nodeIsImage(node);
		const rawColSpan = isImage ? IMAGE_COL_SPAN : TEXT_COL_SPAN;
		const colSpan = Math.min(rawColSpan, pageGridCols);
		const widthPx = Math.max(0, colSpan * colWidPx + Math.max(0, colSpan - 1) * colGapPx);
		node.style.width = widthPx > 0 ? `${widthPx}px` : "";
		const heightPx = node.getBoundingClientRect().height;
		const rowSpan = rowSpanForHeight(heightPx, rowGapPx, rowHeiPx);
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

export const placeNodesOnPages = (
	nodes: Node[],
	pageGridCols: number,
	pageGridRows: number,
): PlacedNode[][] => {
	const pages: PlacedNode[][] = [];
	let currentPage: PlacedNode[] = [];
	let grid = createGrid(pageGridRows, pageGridCols);
	let cursor = { col: 0, row: 0 };

	const pushPage = () => {
		if (currentPage.length === 0) return;
		pages.push(currentPage);
		currentPage = [];
		grid = createGrid(pageGridRows, pageGridCols);
		cursor = { col: 0, row: 0 };
	};

	for (const node of nodes) {
		const normalizedNode = {
			...node,
			gridColSpan: Math.min(node.gridColSpan, pageGridCols),
		};
		if (normalizedNode.gridRowSpan > pageGridRows) {
			continue;
		}

		let placement = findFirstFitFrom(
			grid,
			normalizedNode,
			cursor.row,
			cursor.col,
			pageGridCols,
			pageGridRows,
		);
		if (!placement) {
			pushPage();
			placement = findFirstFitFrom(grid, normalizedNode, 0, 0, pageGridCols, pageGridRows);
			if (!placement) continue;
		}

		currentPage.push(placement);

		const nextCol = placement.gridColStart - 1 + placement.gridColSpan;
		let nextRow = placement.gridRowStart - 1;
		let nextCursorCol = nextCol;
		if (nextCursorCol >= pageGridCols) {
			nextRow += 1;
			nextCursorCol = 0;
		}
		cursor = {
			col: Math.min(nextCursorCol, pageGridCols - 1),
			row: Math.min(nextRow, pageGridRows - 1),
		};
	}

	pushPage();
	return pages;
};

/**
 * Group consecutive text nodes into chunks that fit the page grid height.
 * Images remain ungrouped to preserve strict source order placement.
 */
export const groupNodes = (
	nodes: Node[],
	pageGridRows: number,
	rowGapPx: number,
	rowHeiPx: number,
): Node[] => {
	const grouped: Node[] = [];
	let textGroup: {
		html: string[];
		gridRowSpan: number;
		heightPx: number;
	} | null = null;
	let groupIndex = 0;

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

	for (const node of nodes) {
		if (node.type === "image") {
			flushTextGroup();
			grouped.push(node);
			continue;
		}

		if (!textGroup) {
			textGroup = {
				gridRowSpan: rowSpanForHeight(node.heightPx, rowGapPx, rowHeiPx),
				heightPx: node.heightPx,
				html: [node.html],
			};
			continue;
		}

		const nextHeightPx = textGroup.heightPx + node.heightPx;
		const nextRowSpan = rowSpanForHeight(nextHeightPx, rowGapPx, rowHeiPx);
		if (nextRowSpan <= pageGridRows) {
			textGroup.html.push(node.html);
			textGroup.heightPx = nextHeightPx;
			textGroup.gridRowSpan = nextRowSpan;
			continue;
		}

		flushTextGroup();
		textGroup = {
			gridRowSpan: rowSpanForHeight(node.heightPx, rowGapPx, rowHeiPx),
			heightPx: node.heightPx,
			html: [node.html],
		};
	}

	flushTextGroup();
	return grouped;
};

const createGrid = (rows: number, columns: number): boolean[][] => {
	return Array.from({ length: rows }, () => Array.from({ length: columns }, () => false));
};

export const findFirstFitFrom = (
	grid: boolean[][],
	node: Node,
	startRow: number,
	startCol: number,
	pageGridCols: number,
	pageGridRows: number,
): PlacedNode | null => {
	const maxRowStart = pageGridRows - node.gridRowSpan;
	const maxColStart = pageGridCols - node.gridColSpan;
	if (maxRowStart < 0 || maxColStart < 0) return null;
	if (startRow > maxRowStart) return null;
	const rowMasks = getRowMasks(grid, pageGridCols);

	for (let row = startRow; row <= maxRowStart; row += 1) {
		const initialCol = row === startRow ? startCol : 0;
		for (let col = initialCol; col <= maxColStart; col += 1) {
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

const getRowMasks = (grid: boolean[][], columns: number): number[] => {
	return grid.map((row) => {
		let mask = 0;
		for (let col = 0; col < columns; col += 1) {
			if (row[col]) mask |= 1 << col;
		}
		return mask;
	});
};

const fits = (rowMasks: number[], rowStart: number, colStart: number, node: Node): boolean => {
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

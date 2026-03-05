export type MeasuredBlock = {
	html: string;
	lines: number;
	colSpan: number;
	rowSpan: number;
	kind: "text" | "image";
};

export type LayoutItem = {
	html: string;
	colStart: number;
	colSpan: number;
	rowStart: number;
	rowSpan: number;
	kind: MeasuredBlock["kind"];
};

/**
 * Measure top-level blocks inside the provided element.
 * `measureRoot` is the container sized to match the visible column,
 * `lineHeightPx` is the fixed line height for line calculations,
 * `textColSpan` is the grid span for text blocks,
 * `fullColSpan` is the grid span for full-width image blocks.
 */
export function measureBlocks(
	measureRoot: HTMLElement,
	lineHeightPx: number,
	textColSpan: number,
	imageColSpan: number,
): MeasuredBlock[] {
	const blockRoot = getBlockRoot(measureRoot);
	const blocks = Array.from(blockRoot.querySelectorAll(":scope > *")) as HTMLElement[];
	return blocks.map((block) => {
		const imageEl = block.tagName === "IMG" ? block : block.querySelector("img");
		const height = block.getBoundingClientRect().height;
		const lines = Math.max(1, Math.ceil(height / lineHeightPx));
		const isFigure = block.tagName === "FIGURE";
		const isImage = isFigure || block.tagName === "IMG" || Boolean(imageEl);
		const colSpan = isImage ? imageColSpan : textColSpan;
		return {
			html: block.outerHTML,
			lines,
			colSpan,
			rowSpan: lines,
			kind: isImage ? "image" : "text",
		};
	});
}

function getBlockRoot(measureRoot: HTMLElement): HTMLElement {
	const elementChildren = Array.from(measureRoot.children) as HTMLElement[];
	if (elementChildren.length === 1) {
		const child = elementChildren[0];
		if (["DIV", "ARTICLE", "SECTION", "MAIN"].includes(child.tagName)) {
			return child;
		}
	}

	return measureRoot;
}

/**
 * Paginate measured blocks into pages of columns.
 * `measuredBlocks` is the ordered content with line counts,
 * `gridColumns` is how many grid columns each page has,
 * `rowsPerPage` is the number of grid rows per page.
 */
export function paginateBlocks(
	measuredBlocks: MeasuredBlock[],
	gridColumns: number,
	rowsPerPage: number,
): LayoutItem[][] {
	const pages: LayoutItem[][] = [];
	let currentPage: LayoutItem[] = [];
	let grid = createGrid(rowsPerPage, gridColumns);
	let flowBarrierRow = 0;
	let lastTextIndexByColumn = new Map<string, number>();

	for (const block of measuredBlocks) {
		if (block.rowSpan > rowsPerPage || block.colSpan > gridColumns) {
			continue;
		}

		const placement = findPlacement(grid, block, gridColumns, rowsPerPage, flowBarrierRow);
		if (!placement) {
			if (currentPage.length > 0) {
				pages.push(currentPage);
			}
			currentPage = [];
			grid = createGrid(rowsPerPage, gridColumns);
			lastTextIndexByColumn = new Map();
			flowBarrierRow = 0;
			const nextPlacement = findPlacement(
				grid,
				block,
				gridColumns,
				rowsPerPage,
				flowBarrierRow,
			);
			if (!nextPlacement) {
				continue;
			}
			applyPlacement(currentPage, nextPlacement, lastTextIndexByColumn);
			if (nextPlacement.kind === "image") {
				flowBarrierRow = Math.max(
					flowBarrierRow,
					nextPlacement.rowStart + nextPlacement.rowSpan - 1,
				);
			}
			continue;
		}

		applyPlacement(currentPage, placement, lastTextIndexByColumn);
		if (placement.kind === "image") {
			flowBarrierRow = Math.max(
				flowBarrierRow,
				placement.rowStart + placement.rowSpan - 1,
			);
		}
	}

	if (currentPage.length > 0) {
		pages.push(currentPage);
	}

	return pages;
}

function applyPlacement(
	items: LayoutItem[],
	placement: LayoutItem,
	lastTextIndexByColumn: Map<string, number>,
): void {
	if (placement.kind !== "text") {
		items.push(placement);
		return;
	}

	const key = `${placement.colStart}-${placement.colSpan}`;
	const lastIndex = lastTextIndexByColumn.get(key);
	if (lastIndex !== undefined) {
		const lastItem = items[lastIndex];
		if (
			lastItem.kind === "text" &&
			lastItem.rowStart + lastItem.rowSpan === placement.rowStart
		) {
			lastItem.html += placement.html;
			lastItem.rowSpan += placement.rowSpan;
			return;
		}
	}

	items.push(placement);
	lastTextIndexByColumn.set(key, items.length - 1);
}

function createGrid(rowsPerPage: number, columnsPerPage: number): boolean[][] {
	return Array.from({ length: rowsPerPage }, () =>
		Array.from({ length: columnsPerPage }, () => false),
	);
}

function findPlacement(
	grid: boolean[][],
	block: MeasuredBlock,
	columnsPerPage: number,
	rowsPerPage: number,
	minRowStart: number,
): LayoutItem | null {
	const maxRowStart = rowsPerPage - block.rowSpan;
	const maxColStart = columnsPerPage - block.colSpan;

	for (let col = 0; col <= maxColStart; col += block.colSpan) {
		for (let row = minRowStart; row <= maxRowStart; row += 1) {
			if (!fits(grid, row, col, block)) continue;
			mark(grid, row, col, block);
			return {
				html: block.html,
				colStart: col + 1,
				colSpan: block.colSpan,
				rowStart: row + 1,
				rowSpan: block.rowSpan,
				kind: block.kind,
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
	for (let row = rowStart; row < rowStart + block.rowSpan; row += 1) {
		for (let col = colStart; col < colStart + block.colSpan; col += 1) {
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
	for (let row = rowStart; row < rowStart + block.rowSpan; row += 1) {
		for (let col = colStart; col < colStart + block.colSpan; col += 1) {
			grid[row][col] = true;
		}
	}
}

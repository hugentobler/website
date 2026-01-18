export type BlockKind = "text" | "image";

export type ContentRootSelector = {
	/**
	 * Returns the element whose direct children are the top-level blocks.
	 * We control the markdown pipeline (p, figure), so this is strict by design.
	 */
	select(measureRoot: HTMLElement): HTMLElement;
};

export type BlockClassifier = {
	/**
	 * Determines how a DOM block participates in the grid layout.
	 * The result drives column span, flow barriers, and later block rules.
	 */
	classify(block: HTMLElement): BlockKind;
};

export type ColumnModel = {
	/**
	 * Grid definition for a page.
	 * `textColSpan` is the base span for text blocks.
	 * `imageColSpan` is the base span for image blocks.
	 */
	columns: number;
	lineHeightPx: number;
	textColSpan: number;
	imageColSpan: number;
};

export type MeasuredBlock = {
	/**
	 * Raw measurement output from the DOM.
	 * `rowSpan` is derived from height and line height.
	 */
	id: string;
	html: string;
	kind: BlockKind;
	heightPx: number;
	rowSpan: number;
	colSpan: number;
};

export type FlowRule = {
	/**
	 * Placement policy for the engine.
	 * `barrierAfterKinds` defines which blocks prevent following content
	 * from being placed above them.
	 */
	scanOrder: "column-first";
	barrierAfterKinds: BlockKind[];
};

export type PlacementGrid = {
	/**
	 * Occupancy model used for layout computation.
	 * This is pure data (not HTML).
	 */
	rows: number;
	columns: number;
	occupied: boolean[][];
};

export type LayoutItem = {
	/**
	 * Final positioned element ready for rendering.
	 * This is the output of placement.
	 */
	id: string;
	html: string;
	kind: BlockKind;
	colStart: number;
	colSpan: number;
	rowStart: number;
	rowSpan: number;
};

export type LayouterConfig = {
	contentRootSelector: ContentRootSelector;
	blockClassifier: BlockClassifier;
	columnModel: ColumnModel;
	flowRule: FlowRule;
};

// Type scale configuration using t-shirt sizing
// Everything is derived from DEFAULT_TYPE_SCALE for single source of truth

export type TypeScaleLevel = {
	fontSize: number; // in pixels
	lineUnits: number; // how many grid units for line box height
	rows: number; // how many rows to display in preview grid
};

// Default base grid unit
export const DEFAULT_BASE_GRID_UNIT = 6; // px

// Default type scale using standard size naming - SINGLE SOURCE OF TRUTH
// lineUnits × baseGridUnit = line box height
// lineHeight = (lineUnits × baseGridUnit) / fontSize
export const DEFAULT_TYPE_SCALE = {
	xl: { fontSize: 48, lineUnits: 10, rows: 1 },
	lg: { fontSize: 36, lineUnits: 8, rows: 2 },
	md: { fontSize: 24, lineUnits: 6, rows: 3 },
	sm: { fontSize: 18, lineUnits: 4, rows: 4 },
	xs: { fontSize: 14, lineUnits: 4, rows: 5 },
} satisfies Record<string, TypeScaleLevel>;

// Derive types from the DEFAULT_TYPE_SCALE
export type TypeSize = keyof typeof DEFAULT_TYPE_SCALE;
export type TypeScale = typeof DEFAULT_TYPE_SCALE;

// Sample text for type specimens
export const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog";

// Helper to get ordered type sizes from the scale
export function getTypeSizes(): TypeSize[] {
	return Object.keys(DEFAULT_TYPE_SCALE) as TypeSize[];
}

// Helper function to calculate lineHeight from grid system
export function calculateLineHeight(
	fontSize: number,
	lineUnits: number,
	baseGridUnit: number,
): number {
	const lineBoxHeight = lineUnits * baseGridUnit;
	return lineBoxHeight / fontSize;
}

// Helper function to calculate line box height
export function calculateLineBoxHeight(lineUnits: number, baseGridUnit: number): number {
	return lineUnits * baseGridUnit;
}

/**
 * Typography CSS Generator (Vite plugin)
 *
 * Parses typography.ts at build time and generates typography.css with:
 *   - Fluid clamp() expressions for fontSize and lineHeight (when TYPE_SCALES_MIN exists)
 *   - Grid-locked lineHeight via calc(baseline × N) for clean baseline multiples
 *   - Snap padding variables for non-grid-aligned sizes
 *   - Font utility classes (.sans, .mono) that scope type scale variables
 *   - Type size classes (.type-lg, .type-base, etc.)
 *
 * Clamp formula:
 *   slope = (max - min) / (vpMaxRem - vpMinRem)
 *   intercept = min - slope × vpMinRem
 *   clamp(min, intercept + slope × 100vw, max)
 *
 * Watches typography.ts in dev and regenerates on change with HMR.
 */

import fs from "node:fs";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite";

const TYPOGRAPHY_SOURCE = "src/lib/typography.ts";
const TYPOGRAPHY_OUTPUT = "src/styles/typography.css";

// =============================================================================
// Types
// =============================================================================

type TypeScale = Record<string, { fontSize: number; lineHeight: number }>;

interface TypographyConfig {
	TYPE_SCALES: Record<string, TypeScale>;
	TYPE_SCALES_MIN: Record<string, TypeScale> | null;
	FLUID_VIEWPORT: { min: number; max: number } | null;
}

// =============================================================================
// Formatting
// =============================================================================

/** Format a rem value, stripping trailing zeros after the decimal point. */
const formatRem = (rem: number) =>
	rem
		.toFixed(4)
		.replace(/(\.\d*?)0+$/, "$1")
		.replace(/\.$/, "");

// =============================================================================
// Parsing
// =============================================================================

/**
 * Parse typography.ts via regex + eval to extract scale data.
 * Fragile by design — avoids needing a TS compiler at build time.
 * Only works with the current object-literal format.
 */
async function loadTypographyConfig(): Promise<TypographyConfig> {
	const absolutePath = path.resolve(process.cwd(), TYPOGRAPHY_SOURCE);
	const content = await fs.promises.readFile(absolutePath, "utf-8");

	// TYPE_SCALES (max values) — negative lookahead avoids matching TYPE_SCALES_MIN
	const scalesMatch = content.match(/export const TYPE_SCALES(?!_MIN)[^=]*=\s*(\{[\s\S]*?\n\};)/);
	if (!scalesMatch) throw new Error("Could not find TYPE_SCALES in typography.ts");
	const TYPE_SCALES = new Function(`return ${scalesMatch[1].replace(/\};$/, "}")}`)() as Record<
		string,
		TypeScale
	>;

	// TYPE_SCALES_MIN (optional)
	let TYPE_SCALES_MIN: Record<string, TypeScale> | null = null;
	const minMatch = content.match(/export const TYPE_SCALES_MIN[^=]*=\s*(\{[\s\S]*?\n\};)/);
	if (minMatch) {
		TYPE_SCALES_MIN = new Function(`return ${minMatch[1].replace(/\};$/, "}")}`)() as Record<
			string,
			TypeScale
		>;
	}

	// FLUID_VIEWPORT (optional)
	let FLUID_VIEWPORT: { min: number; max: number } | null = null;
	const vpMatch = content.match(/export const FLUID_VIEWPORT[^=]*=\s*(\{[\s\S]*?\})\s*as const/);
	if (vpMatch) {
		FLUID_VIEWPORT = new Function(`return ${vpMatch[1]}`)() as { min: number; max: number };
	}

	return { FLUID_VIEWPORT, TYPE_SCALES, TYPE_SCALES_MIN };
}

// =============================================================================
// Fluid type helpers
// =============================================================================

/** Returns the integer if value/base is a clean integer multiple, otherwise null. */
function getCleanMultiple(value: number, base: number, epsilon = 0.001): number | null {
	const multiple = value / base;
	const rounded = Math.round(multiple);
	if (rounded > 0 && Math.abs(multiple - rounded) < epsilon) {
		return rounded;
	}
	return null;
}

/** CSS clamp() for linear interpolation between two viewport widths. */
function computeClamp(min: number, max: number, vpMinRem: number, vpMaxRem: number): string {
	if (Math.abs(min - max) < 0.0001) return `${formatRem(min)}rem`;
	const range = vpMaxRem - vpMinRem;
	const slope = (max - min) / range;
	const intersection = min - slope * vpMinRem;
	const slopeVw = slope * 100;
	return `clamp(${formatRem(min)}rem, ${formatRem(intersection)}rem + ${formatRem(slopeVw)}vw, ${formatRem(max)}rem)`;
}

/** Snap padding to round a lineHeight up to the next baseline grid line. */
function computeSnap(
	lineHeight: number,
	baseline: number,
	epsilon = 0.001,
): { ceiling: number; snap: number } {
	const multiple = lineHeight / baseline;
	const rounded = Math.round(multiple);
	if (Math.abs(multiple - rounded) < epsilon) {
		return { ceiling: rounded, snap: 0 };
	}
	const ceiling = Math.ceil(multiple - epsilon);
	return { ceiling, snap: ceiling * baseline - lineHeight };
}

// =============================================================================
// CSS Generation
// =============================================================================

function generateCSS(config: TypographyConfig): string {
	const { TYPE_SCALES, TYPE_SCALES_MIN, FLUID_VIEWPORT } = config;
	const sizes = Object.keys(TYPE_SCALES.sans);
	const isFluid = TYPE_SCALES_MIN !== null && FLUID_VIEWPORT !== null;

	const baselineMax = TYPE_SCALES.sans.base.lineHeight;
	const baselineMin = TYPE_SCALES_MIN?.sans?.base?.lineHeight ?? baselineMax;
	const vpMinRem = (FLUID_VIEWPORT?.min ?? 0) / 16;
	const vpMaxRem = (FLUID_VIEWPORT?.max ?? 0) / 16;

	const baselineExpr = isFluid
		? computeClamp(baselineMin, baselineMax, vpMinRem, vpMaxRem)
		: `${formatRem(baselineMax)}rem`;

	/**
	 * Generate CSS custom properties for a font's type scale.
	 * Auto-detects clean baseline multiples to lock lineHeight to the grid.
	 */
	function generateFontVars(fontId: string, scale: TypeScale, scaleMin: TypeScale | null): string {
		const bl = scale.base.lineHeight;
		const blMin = scaleMin?.base?.lineHeight ?? bl;

		return Object.entries(scale)
			.map(([size, { fontSize, lineHeight }]) => {
				const fsMin = scaleMin?.[size]?.fontSize ?? fontSize;
				const lhMin = scaleMin?.[size]?.lineHeight ?? lineHeight;

				// fontSize: always a clamp (or fixed)
				const fontSizeExpr =
					isFluid && scaleMin
						? computeClamp(fsMin, fontSize, vpMinRem, vpMaxRem)
						: `${formatRem(fontSize)}rem`;

				// lineHeight: depends on grid alignment
				let leadingExpr: string;
				let comment: string;

				if (size === "base") {
					leadingExpr = fontId === "sans" ? "var(--baseline)" : `${formatRem(lineHeight)}rem`;
					comment = `${formatRem(fontSize)}rem / ${formatRem(lineHeight)}rem (1× baseline)`;
				} else if (isFluid && scaleMin) {
					const multMax = getCleanMultiple(lineHeight, bl);
					const multMin = getCleanMultiple(lhMin, blMin);

					if (multMax !== null && multMin !== null && multMax === multMin) {
						// Same clean multiple at both endpoints → lock to grid
						leadingExpr = multMax === 1 ? "var(--baseline)" : `calc(var(--baseline) * ${multMax})`;
						comment = `${formatRem(fontSize)}rem / ${formatRem(lineHeight)}rem (${multMax}× baseline, locked)`;
					} else {
						// Independent clamp
						leadingExpr = computeClamp(lhMin, lineHeight, vpMinRem, vpMaxRem);
						const multStr = formatRem(lineHeight / bl);
						comment = `${formatRem(fontSize)}rem / ${formatRem(lineHeight)}rem (${multStr}× baseline)`;
					}
				} else {
					// Non-fluid fallback
					leadingExpr = `${formatRem(lineHeight)}rem`;
					const multStr = formatRem(lineHeight / bl);
					comment = `${formatRem(fontSize)}rem / ${formatRem(lineHeight)}rem (${multStr}× baseline)`;
				}

				return `\t/* ${size}: ${comment} */\n\t--type-${size}: ${fontSizeExpr};\n\t--leading-${size}: ${leadingExpr};`;
			})
			.join("\n\n");
	}

	/**
	 * Generate snap padding variables for baseline grid alignment.
	 * Clean multiples get snap = 0. Others get a clamp (or fixed value).
	 */
	function generateSnapVars(): string {
		const scale = TYPE_SCALES.sans;
		const scaleMin = TYPE_SCALES_MIN?.sans ?? null;
		const bl = scale.base.lineHeight;
		const blMin = scaleMin?.base?.lineHeight ?? bl;
		const lines: string[] = [];

		for (const size of Object.keys(scale)) {
			if (size === "base") {
				lines.push(`\t\t--snap-${size}: 0rem;`);
				continue;
			}

			const lh = scale[size].lineHeight;
			const lhMin = scaleMin?.[size]?.lineHeight ?? lh;

			// Check if locked to grid
			if (isFluid && scaleMin) {
				const multMax = getCleanMultiple(lh, bl);
				const multMin = getCleanMultiple(lhMin, blMin);
				if (multMax !== null && multMin !== null && multMax === multMin) {
					lines.push(`\t\t--snap-${size}: 0rem;`);
					continue;
				}
			} else if (getCleanMultiple(lh, bl) !== null) {
				lines.push(`\t\t--snap-${size}: 0rem;`);
				continue;
			}

			// Compute snap at both endpoints
			const snapMax = computeSnap(lh, bl);
			const snapMin = computeSnap(lhMin, blMin);

			if (snapMax.ceiling !== snapMin.ceiling) {
				console.warn(
					`[typography] ⚠ Snap discontinuity for "${size}": ` +
						`ceiling is ${snapMin.ceiling}× at min viewport but ${snapMax.ceiling}× at max. ` +
						`Adjust lineHeight in TYPE_SCALES_MIN to avoid a snap jump.`,
				);
			}

			if (isFluid && scaleMin && Math.abs(snapMax.snap - snapMin.snap) > 0.0001) {
				lines.push(
					`\t\t--snap-${size}: ${computeClamp(snapMin.snap, snapMax.snap, vpMinRem, vpMaxRem)};`,
				);
			} else {
				lines.push(`\t\t--snap-${size}: ${formatRem(snapMax.snap)}rem;`);
			}
		}

		return lines.join("\n");
	}

	const fluidNote = isFluid
		? `\n   - Fluid: ${FLUID_VIEWPORT?.min}px → ${FLUID_VIEWPORT?.max}px (baseline: ${formatRem(baselineMin)}rem → ${formatRem(baselineMax)}rem)`
		: "";

	const css = `/* =============================================================================
   AUTO-GENERATED by typography-generator.ts — do not edit manually!
   Source: ${TYPOGRAPHY_SOURCE}

   baseline = base.lineHeight = ${formatRem(baselineMax)}rem
   All values in rem, fluid via clamp() where min scales are defined${fluidNote}
   ============================================================================= */

:root {
\t/* Baseline grid unit (= base.lineHeight, fluid) */
\t--baseline: ${baselineExpr};

\t/* Snap padding for baseline grid alignment (used by typesetter) */
${generateSnapVars()}
}

/* =============================================================================
   Font classes — set font-family and scope type scale variables
   ============================================================================= */

.sans {
\tfont-family: var(--font-sans);

${generateFontVars("sans", TYPE_SCALES.sans, TYPE_SCALES_MIN?.sans ?? null)}
}

.mono {
\tfont-family: var(--font-mono);

${generateFontVars("mono", TYPE_SCALES.mono, TYPE_SCALES_MIN?.mono ?? null)}
}

/* =============================================================================
   Type size classes — apply font-size + line-height from scoped variables
   ============================================================================= */

${sizes
	.map(
		(size) => `.type-${size} {
\tfont-size: var(--type-${size});
\tline-height: var(--leading-${size});
}`,
	)
	.join("\n\n")}

/* =============================================================================
   Baseline grid overlay (debug)
   ============================================================================= */

.baseline-grid {
\tbackground-image: linear-gradient(
\t\tto bottom,
\t\trgba(127 127 127 / 0.25) 1px,
\t\ttransparent 1px
\t);
\tbackground-size: 100% var(--baseline);
\tbackground-position: 0 0;
}
`;

	return css;
}

// =============================================================================
// File I/O & Plugin
// =============================================================================

async function writeCSS(css: string): Promise<void> {
	const outputPath = path.resolve(process.cwd(), TYPOGRAPHY_OUTPUT);
	await fs.promises.writeFile(outputPath, css, "utf-8");
}

async function generate(): Promise<void> {
	try {
		const config = await loadTypographyConfig();
		const css = generateCSS(config);
		await writeCSS(css);
		console.log(`✓ Generated ${TYPOGRAPHY_OUTPUT}`);
	} catch (error) {
		console.error(`✗ Failed to generate ${TYPOGRAPHY_OUTPUT}:`, error);
	}
}

/** Vite plugin: generates typography.css from typography.ts, with HMR. */
export function typographyPlugin(): Plugin {
	let server: ViteDevServer | null = null;

	return {
		async buildStart() {
			await generate();
		},

		configureServer(devServer) {
			server = devServer;

			server.watcher.on("change", async (file) => {
				if (file.endsWith(TYPOGRAPHY_SOURCE)) {
					console.log(`[typography] ${TYPOGRAPHY_SOURCE} changed, regenerating...`);
					await generate();
					server?.ws.send({ type: "full-reload" });
				}
			});
		},
		name: "typography-generator",
	};
}

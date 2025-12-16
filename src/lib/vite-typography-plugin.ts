/**
 * Vite plugin to generate typography.css from typography.ts
 *
 * Watches for changes and regenerates CSS with HMR support.
 * Baseline is derived from base.lineHeight (bottom-up approach).
 */

import fs from "node:fs";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite";

const TYPOGRAPHY_SOURCE = "src/lib/typography.ts";
const TYPOGRAPHY_OUTPUT = "src/styles/typography.css";

// Convert px to rem (assuming 16px root)
const pxToRem = (px: number) => (px / 16).toFixed(4).replace(/\.?0+$/, "");

type TypeScale = Record<string, { fontSize: number; lineHeight: number }>;

/**
 * Parse typography.ts to extract TYPE_SCALES
 */
async function loadTypographyConfig(): Promise<{
	TYPE_SCALES: Record<string, TypeScale>;
}> {
	const absolutePath = path.resolve(process.cwd(), TYPOGRAPHY_SOURCE);
	const content = await fs.promises.readFile(absolutePath, "utf-8");

	// Extract TYPE_SCALES object
	const typeScalesMatch = content.match(/export const TYPE_SCALES[^=]*=\s*(\{[\s\S]*?\n\};)/);
	if (!typeScalesMatch) throw new Error("Could not find TYPE_SCALES in typography.ts");

	// Parse the object (safe because we control the source)
	const objStr = typeScalesMatch[1].replace(/\};$/, "}");
	const TYPE_SCALES = new Function(`return ${objStr}`)() as Record<string, TypeScale>;

	return { TYPE_SCALES };
}

/**
 * Generate CSS from typography config
 *
 * Baseline is derived from each font's base.lineHeight
 */
function generateCSS(config: Awaited<ReturnType<typeof loadTypographyConfig>>): string {
	const { TYPE_SCALES } = config;
	const sizes = Object.keys(TYPE_SCALES.sans);

	// Baseline = base.lineHeight (using sans as the primary/default)
	const baselinePx = TYPE_SCALES.sans.base.lineHeight;
	const baselineRem = pxToRem(baselinePx);

	const css = `/* =============================================================================
   AUTO-GENERATED - Do not edit manually!
   Source: ${TYPOGRAPHY_SOURCE}

   Typography System (Bottom-Up):
   - baseline = base.lineHeight = ${baselinePx}px (${baselineRem}rem)
   - All layout spacing uses baseline multiples
   - Font-size and line-height are optically tuned per size
   - Using rem so spacing scales with user font preferences
   ============================================================================= */

@layer base {
	:root {
		/* Global baseline for Tailwind utilities (e.g., h-baseline, gap-baseline) */
		--type-baseline: ${baselineRem}rem;
	}
}

/* =============================================================================
   Font utilities with type scale variables
   ============================================================================= */

/* font-sans: Univers type scale */
@utility font-sans {
	font-family: var(--font-sans);

${Object.entries(TYPE_SCALES.sans)
	.map(([size, { fontSize, lineHeight }]) => {
		const ratio = (lineHeight / fontSize).toFixed(4).replace(/\.?0+$/, "");
		const multiple = (lineHeight / baselinePx).toFixed(2).replace(/\.?0+$/, "");
		return `	/* ${size}: ${fontSize}px / ${lineHeight}px (${multiple}× baseline) */
	--type-${size}: ${pxToRem(fontSize)}rem;
	--leading-${size}: ${ratio};`;
	})
	.join("\n\n")}
}

/* font-mono: Berkeley Mono type scale */
@utility font-mono {
	font-family: var(--font-mono);

${Object.entries(TYPE_SCALES.mono)
	.map(([size, { fontSize, lineHeight }]) => {
		const ratio = (lineHeight / fontSize).toFixed(4).replace(/\.?0+$/, "");
		const monoBaseline = TYPE_SCALES.mono.base.lineHeight;
		const multiple = (lineHeight / monoBaseline).toFixed(2).replace(/\.?0+$/, "");
		return `	/* ${size}: ${fontSize}px / ${lineHeight}px (${multiple}× baseline) */
	--type-${size}: ${pxToRem(fontSize)}rem;
	--leading-${size}: ${ratio};`;
	})
	.join("\n\n")}
}

/* =============================================================================
   Type size utilities
   ============================================================================= */

${sizes
	.map(
		(size) => `@utility type-${size} {
	font-size: var(--type-${size});
	line-height: var(--leading-${size});
}`,
	)
	.join("\n\n")}

/* =============================================================================
   Baseline grid overlay (for debugging)
   ============================================================================= */

@utility baseline-grid {
	background-image: linear-gradient(
		to bottom,
		rgba(127 127 127 / 0.25) 1px,
		transparent 1px
	);
	background-size: 100% var(--type-baseline);
	background-position: 0 0;
}
`;

	return css;
}

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

/**
 * Vite plugin for typography CSS generation
 */
export function typographyPlugin(): Plugin {
	let server: ViteDevServer | null = null;

	return {
		name: "typography-generator",

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
	};
}

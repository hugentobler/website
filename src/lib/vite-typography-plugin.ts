/**
 * Vite plugin to generate typography.css from typography.ts
 * Watches for changes and regenerates CSS with HMR support
 */
import type { Plugin, ViteDevServer } from "vite";
import fs from "node:fs";
import path from "node:path";

const TYPOGRAPHY_SOURCE = "src/lib/typography.ts";
const TYPOGRAPHY_OUTPUT = "src/styles/typography.css";

// Convert px to rem (assuming 16px base)
const pxToRem = (px: number) => (px / 16).toFixed(4).replace(/\.?0+$/, "");

type TypeScale = Record<string, { fontSize: number; lineHeight: number }>;

/**
 * Load typography constants by parsing the TypeScript file directly
 */
async function loadTypographyConfig(): Promise<{
	BASELINE: number;
	TYPE_SCALES: Record<string, TypeScale>;
}> {
	const absolutePath = path.resolve(process.cwd(), TYPOGRAPHY_SOURCE);
	const content = await fs.promises.readFile(absolutePath, "utf-8");

	// Extract BASELINE value
	const baselineMatch = content.match(/export const BASELINE\s*=\s*(\d+)/);
	if (!baselineMatch) throw new Error("Could not find BASELINE in typography.ts");
	const BASELINE = parseInt(baselineMatch[1], 10);

	// Extract TYPE_SCALES object using regex
	// Match the entire TYPE_SCALES object
	const typeScalesMatch = content.match(
		/export const TYPE_SCALES[^=]*=\s*(\{[\s\S]*?\n\};)/
	);
	if (!typeScalesMatch) throw new Error("Could not find TYPE_SCALES in typography.ts");

	// Parse the object - convert TypeScript syntax to valid JSON-ish format
	let objStr = typeScalesMatch[1];
	
	// Remove trailing semicolon and type annotations
	objStr = objStr.replace(/\};$/, "}");
	
	// Convert to valid JS by wrapping keys in quotes and evaluating
	// This is safe because we control the source file
	const TYPE_SCALES = new Function(`return ${objStr}`)() as Record<string, TypeScale>;

	return { BASELINE, TYPE_SCALES };
}

/**
 * Generate CSS content from typography config
 */
function generateCSS(config: Awaited<ReturnType<typeof loadTypographyConfig>>): string {
	const { BASELINE, TYPE_SCALES } = config;
	const sizes = Object.keys(TYPE_SCALES.sans);

	let css = `/* =============================================================================
   AUTO-GENERATED FILE - Do not edit manually!
   Source: ${TYPOGRAPHY_SOURCE}
   Run: Changes to typography.ts will regenerate this file automatically
   ============================================================================= */

@layer base {
	:root {
		/* Baseline grid unit */
		--baseline: ${BASELINE}px;
		
		/* Vertical rhythm unit */
		--type-rhythm: 6px;
	}
}

/* =============================================================================
   Font utilities with type scale variables
   ============================================================================= */

/* font-sans: sets font-family and defines type scale for Univers */
@utility font-sans {
	font-family: var(--font-sans);

	/* Type scale tuned for Univers (font-size in rem, line-height unitless) */
${Object.entries(TYPE_SCALES.sans)
	.map(([size, { fontSize, lineHeight }]) => {
		const ratio = (lineHeight / fontSize).toFixed(4).replace(/\.?0+$/, "");
		return `	--type-${size}: ${pxToRem(fontSize)}rem;
	--leading-${size}: ${ratio};`;
	})
	.join("\n\n")}
}

/* font-mono: sets font-family and defines type scale for Berkeley Mono */
@utility font-mono {
	font-family: var(--font-mono);

	/* Type scale tuned for Berkeley Mono (font-size in rem, line-height unitless) */
${Object.entries(TYPE_SCALES.mono)
	.map(([size, { fontSize, lineHeight }]) => {
		const ratio = (lineHeight / fontSize).toFixed(4).replace(/\.?0+$/, "");
		return `	--type-${size}: ${pxToRem(fontSize)}rem;
	--leading-${size}: ${ratio};`;
	})
	.join("\n\n")}
}

/* =============================================================================
   Type size utilities (read from font-defined variables)
   ============================================================================= */

${sizes
	.map(
		(size) => `@utility type-${size} {
	font-size: var(--type-${size});
	line-height: var(--leading-${size});
}`
	)
	.join("\n\n")}

/* =============================================================================
   Baseline grid overlay utilities
   ============================================================================= */

@utility baseline-grid {
	background-image: linear-gradient(
		to bottom,
		rgba(127 127 127 / 0.25) 1px,
		transparent 1px
	);
	background-size: 100% var(--type-rhythm);
	background-position: 0 0;
}
`;

	return css;
}

/**
 * Write CSS to output file
 */
async function writeCSS(css: string): Promise<void> {
	const outputPath = path.resolve(process.cwd(), TYPOGRAPHY_OUTPUT);
	await fs.promises.writeFile(outputPath, css, "utf-8");
}

/**
 * Main generation function
 */
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

		// Generate CSS on build start
		async buildStart() {
			await generate();
		},

		// Set up file watcher for dev server
		configureServer(devServer) {
			server = devServer;

			// Watch typography.ts for changes
			server.watcher.on("change", async (file) => {
				if (file.endsWith(TYPOGRAPHY_SOURCE)) {
					console.log(`[typography] ${TYPOGRAPHY_SOURCE} changed, regenerating...`);
					await generate();

					// Trigger full reload to pick up CSS changes
					server?.ws.send({ type: "full-reload" });
				}
			});
		},
	};
}

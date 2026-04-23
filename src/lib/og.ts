import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { decompress } from "wawoff2";

type SatoriNode = Parameters<typeof satori>[0];

const WIDTH = 1200;
const HEIGHT = 630;

// Derived from --color-charcoal-{900,400,50} in kromatika.css
const COLORS = {
	bg: "#F7F7F8",
	primary: "#262930",
	secondary: "#9FA2AC",
};

const CDN = "https://cdn.hugentobler.xyz";

type Font = {
	name: string;
	data: ArrayBuffer;
	weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
	style: "normal" | "italic";
};
let fontsCache: Font[] | null = null;

async function loadWoff2(url: string): Promise<ArrayBuffer> {
	const res = await fetch(url);
	const woff2 = Buffer.from(await res.arrayBuffer());
	const ttf = await decompress(woff2);
	return (ttf.buffer as ArrayBuffer).slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength);
}

async function loadFonts() {
	if (fontsCache) return fontsCache;
	const [condensed] = await Promise.all([loadWoff2(`${CDN}/uni-condensed-light.woff2`)]);
	fontsCache = [
		{
			data: condensed,
			name: "Univers Condensed",
			style: "normal" as const,
			weight: 300 as const,
		},
	];
	return fontsCache;
}

function el(
	type: string,
	style: Record<string, unknown>,
	...children: (SatoriNode | string | false | undefined)[]
): SatoriNode {
	const filtered = children.filter(Boolean);
	return {
		props: {
			children: filtered.length === 1 ? filtered[0] : filtered,
			style,
		},
		type,
	};
}

// Title-cased fallback: socially-shared URL tells you the article, so when
// no tldr is provided we surface the bare title rather than ship an empty
// card. Title-case keeps it readable at the large display size.
function fallbackText(title: string): string {
	return title.toUpperCase();
}

export async function generateOgImage(opts: {
	title: string;
	tldr?: string;
}): Promise<ArrayBuffer> {
	const fonts = await loadFonts();

	const text = opts.tldr?.trim() || fallbackText(opts.title);

	const element = el(
		"div",
		{
			alignItems: "flex-start",
			background: COLORS.bg,
			display: "flex",
			flexDirection: "column",
			fontFamily: "Univers Condensed",
			fontWeight: 300,
			height: "100%",
			justifyContent: "center",
			lineHeight: 1.05,
			padding: "88px 160px",
			width: "100%",
		},
		el(
			"div",
			{
				color: COLORS.primary,
				display: "block",
				fontSize: 72,
				fontWeight: 300,
				letterSpacing: -2,
				// String form lets us override the default `…` (U+2026) which
				// Univers Condensed lacks, falling back to a system font.
				// Three periods are guaranteed to exist in the loaded face.
				lineClamp: '3 "..."',
				textWrap: "pretty",
			},
			text,
		),
	);

	const svg = await satori(element, { fonts, height: HEIGHT, width: WIDTH });

	const resvg = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } });
	const png = resvg.render().asPng();
	return png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer;
}

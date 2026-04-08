import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { decompress } from "wawoff2";

type SatoriNode = Parameters<typeof satori>[0];

const WIDTH = 1200;
const HEIGHT = 630;

// Derived from --color-charcoal-{900,400,50} in kromatika.css
const COLORS = {
	bg: "#262930",
	primary: "#F7F7F8",
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
	const [condensedLight] = await Promise.all([loadWoff2(`${CDN}/uni-condensed-light.woff2`)]);
	fontsCache = [
		{
			data: condensedLight,
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

export async function generateOgImage(opts: {
	title: string;
	description?: string;
}): Promise<ArrayBuffer> {
	const fonts = await loadFonts();

	const titleWords = opts.title.toUpperCase().split(/\s+/);
	const descWords = opts.description?.toUpperCase().split(/\s+/) ?? [];

	const words = [
		...titleWords.map((w) => el("span", { color: COLORS.primary }, w)),
		...descWords.map((w) => el("span", { color: COLORS.secondary }, w)),
	];

	const element = el(
		"div",
		{
			alignContent: "center",
			alignItems: "center",
			background: COLORS.bg,
			columnGap: 40,
			display: "flex",
			flexWrap: "wrap",
			fontFamily: "Univers Condensed",
			fontSize: 168,
			fontWeight: 300,
			height: "100%",
			letterSpacing: "-0.05em",
			lineHeight: 0.85,
			textTransform: "uppercase" as const,
			width: "100%",
		},
		...words,
	);

	const svg = await satori(element, { fonts, height: HEIGHT, width: WIDTH });

	const resvg = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } });
	const png = resvg.render().asPng();
	return png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer;
}

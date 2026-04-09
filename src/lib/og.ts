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
	const [ultraCondensed] = await Promise.all([loadWoff2(`${CDN}/uni-ultra-condensed-light.woff2`)]);
	fontsCache = [
		{
			data: ultraCondensed,
			name: "Univers Ultra Condensed",
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

function formatDate(published: string): string {
	const date = new Date(`${published}T00:00:00`);
	const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
	return `${month} ${date.getFullYear()}`;
}

export async function generateOgImage(opts: {
	title: string;
	published?: string;
}): Promise<ArrayBuffer> {
	const fonts = await loadFonts();

	const titleText = opts.title.toUpperCase();
	const dateText = opts.published ? formatDate(opts.published) : "";

	const element = el(
		"div",
		{
			alignItems: "center",
			background: COLORS.bg,
			display: "flex",
			flexDirection: "column",
			fontFamily: "Univers Ultra Condensed",
			fontWeight: 300,
			height: "100%",
			justifyContent: "center",
			lineHeight: 1,
			textTransform: "uppercase" as const,
			width: "100%",
		},
		el("span", { color: COLORS.primary, fontSize: 88 }, titleText),
		dateText && el("span", { color: COLORS.secondary, fontSize: 88, marginTop: 44 }, dateText),
	);

	const svg = await satori(element, { fonts, height: HEIGHT, width: WIDTH });

	const resvg = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } });
	const png = resvg.render().asPng();
	return png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer;
}

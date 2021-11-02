// Replace with HarfBuzz in C version

class Line {
	constructor(public text: string, public width: number, public y: number) {}
}

class Layout {
	constructor(public lines: Line[], public height: number) {}
}

const alignToMult = {
	left: 0,
	center: 0.5,
	right: 1
};

// OS/2.sTypoAscender - OS/2.sTypoDescender + OS/2.sTypoLineGap
const fontSpacing = {
	Futura: 1011
};

export default class Rasterizer {
	private c: HTMLCanvasElement;
	private x: CanvasRenderingContext2D;

	maxWidth: number | undefined;

	constructor() {
		this.c = document.createElement("canvas");
		this.x = this.c.getContext("2d");
	}

	private clear(width: number, height: number) {
		this.c.width = width; // I don't know..??
		this.c.height = height;
	}

	private pxPerEm() {
		return this.x.measureText("\u2014").width;
	}

	// TODO: Handle newlines
	private layout(text: string, maxWidth: number, spacing: number): Layout {
		const lines = [];

		let line = "";
		let y = 0;
		let firstLine = true;

		let cachedMetrics: TextMetrics | null = null;
		for (const word of text.split(" ")) {
			const newLine = line ? line + " " + word : word;
			const metrics = this.x.measureText(newLine);

			// TODO: handle if one word is too big for line

			if (metrics.width > maxWidth && cachedMetrics) {
				if (!firstLine) {
					y += spacing;
				} else {
					y += cachedMetrics.actualBoundingBoxAscent;
					firstLine = false;
				}

				lines.push(new Line(line, cachedMetrics.width, y));

				line = word;
				cachedMetrics = null;
			} else {
				line = newLine;
				cachedMetrics = metrics;
			}
		}

		cachedMetrics ??= this.x.measureText(line);

		if (!firstLine) {
			y += spacing;
		} else {
			y += cachedMetrics.actualBoundingBoxAscent;
			firstLine = false;
		}

		lines.push(new Line(line, cachedMetrics.width, y));

		return new Layout(lines, y + cachedMetrics.actualBoundingBoxDescent);
	}

	rasterize(
		text: string,
		maxWidth: number,
		font: keyof typeof fontSpacing,
		size: number,
		align: keyof typeof alignToMult = "center"
	): ImageData {
		const fontConfig = `${size}px ${font}`;
		this.x.font = fontConfig;

		const { lines, height } = this.layout(text, maxWidth, fontSpacing[font] / this.pxPerEm());
		this.clear(maxWidth, height);

		this.x.font = fontConfig;
		this.x.textAlign = align;

		const textX = maxWidth * alignToMult[align];
		for (const line of lines) {
			this.x.fillText(line.text, textX, line.y);
		}

		return this.x.getImageData(0, 0, maxWidth, height);
	}
}

import * as Geometry from "./Geometry";
import Session from "./Session";
import { TextRenderer } from "./TextRenderer";
import TextureRenderer from "./TextureRenderer";

export default class Futura extends Session {
	constructor(gl: WebGLRenderingContext, width: number, height: number, caption: string) {
		super(gl, width, height);
		const c = gl.canvas;

		const fontSize = width / 13;
		const maxWidth = width * 0.92;
		const text = Session.rasterizer.rasterize(caption, maxWidth, "Futura", fontSize);
		const realTextHeight = text.height - 4;

		const topPad = fontSize * 2 + realTextHeight;
		c.width = width;
		c.height = height + topPad;
		gl.viewport(0, 0, c.width, c.height);

		const xPadding = 1 - text.width / c.width;
		const yPadding = fontSize / realTextHeight;

		const textWidth = c.width / text.width;
		const textHeight = c.height / realTextHeight;

		const geometry = Geometry.fromXYWH(-xPadding / 2, -textHeight + yPadding + 1, textWidth, textHeight);
		const renderer = new TextRenderer(this.gl, geometry);
		renderer.render(this.texture(text));

		gl.viewport(0, 0, width, height);
		this.mainRenderer = new TextureRenderer(gl, Geometry.fromTo(-1, -1, 1, 1));
	}
}

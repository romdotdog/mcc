import * as Geometry from "./Geometry";
import Session from "./Session";
import { TextOutlineRenderer } from "./TextRenderer";
import TextureRenderer from "./TextureRenderer";

export default class Impact extends Session {
	protected topRenderer: TextOutlineRenderer;
	protected topCaption: WebGLTexture;
	protected bottomRenderer?: TextOutlineRenderer;
	protected bottomCaption?: WebGLTexture;

	constructor(gl: WebGLRenderingContext, width: number, height: number, top: string, bottom?: string) {
		super(gl, width, height);
		const c = gl.canvas;

		c.width = width;
		c.height = height;
		gl.viewport(0, 0, c.width, c.height);

		[this.topRenderer, this.topCaption] = this.text(top, width, height, false);
		if (bottom !== undefined) {
			[this.bottomRenderer, this.bottomCaption] = this.text(bottom, width, height, true);
		}

		this.mainRenderer = new TextureRenderer(gl, Geometry.fromTo(-1, -1, 1, 1));
	}

	private text(caption: string, width: number, height: number, bottom: boolean): [TextOutlineRenderer, WebGLTexture] {
		const fontSize = width / 12;
		const text = Session.rasterizer.rasterize(caption, width, "Impact", fontSize);
		const realTextHeight = text.height - 4;

		const textWidth = width / text.width;
		const textHeight = height / realTextHeight;

		let geometry: Float32Array;
		if (bottom) {
			geometry = Geometry.fromXYWH(0, textHeight * -0.03, textWidth, textHeight);
		} else {
			geometry = Geometry.fromXYWH(0, 1 - textHeight + textHeight * 0.03, textWidth, textHeight);
		}

		const outlineSize = Math.max(2, (width / 1000) >> 0);
		const outlineX = outlineSize / text.width;
		const outlineY = outlineSize / text.height;
		return [new TextOutlineRenderer(this.gl, geometry, outlineX, outlineY), this.texture(text)];
	}

	render(texture: WebGLTexture, matrix?: Float32Array): void {
		super.render(texture, matrix);
		this.gl.enable(this.gl.BLEND);
		this.topRenderer.render(this.topCaption);
		this.bottomRenderer?.render(this.bottomCaption!);
	}
}

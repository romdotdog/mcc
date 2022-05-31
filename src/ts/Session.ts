import Rasterizer from "./Rasterizer";
import TextureRenderer from "./TextureRenderer";

export default class Session {
	protected static rasterizer = new Rasterizer();
	protected mainRenderer: TextureRenderer;

	constructor(
		protected gl: WebGLRenderingContext,
		protected width: number,
		protected height: number
	) {
		this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
		this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
	}

	texture(image: TexImageSource): WebGLTexture {
		const { gl } = this;

		const t = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, t);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		gl.bindTexture(gl.TEXTURE_2D, t);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

		return t;
	}

	dispose(disposalType: number) {
		if (disposalType == 0 || disposalType == 1)
			this.gl.enable(this.gl.BLEND);
		else 
			this.gl.disable(this.gl.BLEND);
	}

	render(texture: WebGLTexture, matrix?: Float32Array) {
		this.mainRenderer.render(texture, matrix);
	}
}

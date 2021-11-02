import * as Geometry from "./Geometry";

import Rasterizer from "./Rasterizer";
import frag from "../shaders/plane.frag";
import vert from "../shaders/plane.vert";
import TextureRenderer from "./TextureRenderer";

export default class Session {
	private static rasterizer = new Rasterizer();

	private vertShader: WebGLShader;
	private fragShader: WebGLShader;

	private mainRenderer: TextureRenderer;

	constructor(
		private gl: WebGLRenderingContext,
		private caption: string,
		private width: number,
		private height: number
	) {
		this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
		this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);

		this.vertShader = this.compileShader(vert, this.gl.VERTEX_SHADER);
		this.fragShader = this.compileShader(frag, this.gl.FRAGMENT_SHADER);
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

	private compileShader(src: string, type: number): WebGLShader {
		const gl = this.gl;
		let shader = gl.createShader(type);

		gl.shaderSource(shader, src);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log(`Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:`);
			console.log(gl.getShaderInfoLog(shader));
		}

		return shader;
	}

	private createTextureRenderer(geometry: Float32Array) {
		return new TextureRenderer(this.gl, this.fragShader, this.vertShader, geometry);
	}

	renderText() {
		const { gl, width, height } = this;
		const c = gl.canvas;

		const fontSize = width / 13;
		const maxWidth = width * 0.92;
		const text = Session.rasterizer.rasterize(this.caption, maxWidth, "Futura", fontSize);

		const topPad = fontSize + text.height;
		c.width = width;
		c.height = height + topPad;
		gl.viewport(0, 0, c.width, c.height);

		// TODO: unhack
		{
			gl.enable(gl.SCISSOR_TEST);
			gl.scissor(0, c.height - topPad, c.width, topPad);
			gl.clearColor(1, 1, 1, 1);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.disable(gl.SCISSOR_TEST);
		}

		const xPadding = (c.width - text.width) / c.width;
		const yPadding = fontSize / c.height;

		const textWidth = (text.width / c.width) * 2;
		const textHeight = (text.height / c.height) * 2;

		const geometry = Geometry.fromXYWH(xPadding - 1, 1 - yPadding - textHeight, textWidth, textHeight);
		const renderer = this.createTextureRenderer(geometry);
		renderer.render(this.texture(text));

		gl.viewport(0, 0, width, height);
		this.mainRenderer = this.createTextureRenderer(Geometry.fromXYWH(-1, -1, 2, 2));
	}

	render(texture: WebGLTexture, matrix?: Float32Array) {
		this.mainRenderer.render(texture, matrix);
	}
}

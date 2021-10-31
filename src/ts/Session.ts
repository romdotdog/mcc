import * as Geometry from "./Geometry";

import Rasterizer from "./Rasterizer";
import frag from "../shaders/plane.frag";
import vert from "../shaders/plane.vert";
import TextureRenderer from "./TextureRenderer";

export default class Session {
	private static rasterizer = new Rasterizer();

	private vertShader: WebGLShader;
	private fragShader: WebGLShader;
	private mainTexture: WebGLTexture; // TODO: gif support

	private mainRenderer: TextureRenderer;

	constructor(private gl: WebGLRenderingContext, private image: TexImageSource, private caption: string) {
		this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
		this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);

		this.vertShader = this.compileShader(vert, this.gl.VERTEX_SHADER);
		this.fragShader = this.compileShader(frag, this.gl.FRAGMENT_SHADER);

		this.mainTexture = this.texture(this.image);
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
		const { gl, image } = this;
		const c = gl.canvas;

		const fontSize = image.width / 13;
		const maxWidth = image.width * 0.92;
		const text = Session.rasterizer.rasterize(this.caption, maxWidth, fontSize + "px Futura");

		const topPad = fontSize + text.height;
		c.width = image.width;
		c.height = image.height + topPad;
		gl.viewport(0, 0, c.width, c.height);

		// TODO: unhack
		{
			gl.enable(gl.SCISSOR_TEST);
			gl.scissor(0, c.height - topPad, c.width, topPad);
			gl.clearColor(1, 1, 1, 1);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.disable(gl.SCISSOR_TEST);
		}

		const topPadRatio = (topPad / c.height) * 2;

		const xPadding = (c.width - text.width) / c.width;
		const yPadding = fontSize / c.width / 2;

		const textWidth = (text.width / c.width) * 2;
		const textHeight = (text.height / c.height) * 2;

		const geometry = Geometry.fromXYWH(xPadding - 1, 1 - yPadding - textHeight, textWidth, textHeight);
		const renderer = this.createTextureRenderer(geometry);
		renderer.render(this.texture(text));

		this.mainRenderer = this.createTextureRenderer(Geometry.fromXYWH(-1, -1, 2, 2 - topPadRatio));
	}

	render() {
		this.mainRenderer.render(this.mainTexture);
	}
}

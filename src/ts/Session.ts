import frag from "../shaders/plane.frag";
import vert from "../shaders/plane.vert";

import Texture from "./Texture";

export default class Session {
	private prog: WebGLProgram;

	private positionLocation: number;
	private texcoordLocation: number;
	private textureLocation: WebGLUniformLocation;
	private positionBuffer: WebGLBuffer;
	private texcoordBuffer: WebGLBuffer;

	constructor(private gl: WebGLRenderingContext, private image: TexImageSource, private caption: string) {
		this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

		this.prog = this.gl.createProgram();
		this.compileShaders();
		this.initializeBuffers();
	}

	private initializeBuffers() {
		const { gl, prog } = this;
		this.positionLocation = gl.getAttribLocation(prog, "a_position");
		this.texcoordLocation = gl.getAttribLocation(prog, "a_texcoord");

		this.textureLocation = gl.getUniformLocation(prog, "u_texture");

		this.texcoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
	}

	private setGeometry(x1: number, y1: number, width: number, height: number) {
		const x2 = x1 + width;
		const y2 = y1 + height;

		this.positionBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
			this.gl.STATIC_DRAW
		);
	}

	private compileShaders() {
		this.compileShader(vert, this.gl.VERTEX_SHADER);
		this.compileShader(frag, this.gl.FRAGMENT_SHADER);
		this.link();
	}

	private compileShader(src: string, type: number) {
		const gl = this.gl;
		let shader = gl.createShader(type);

		gl.shaderSource(shader, src);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log(`Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:`);
			console.log(gl.getShaderInfoLog(shader));
		}

		this.gl.attachShader(this.prog, shader);
	}

	private link() {
		const { gl, prog } = this;
		gl.linkProgram(prog);

		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
			console.log("Error linking shader program:");
			console.log(gl.getProgramInfoLog(prog));
		}
	}

	private texture(image: TexImageSource) {
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

	render() {
		const { gl, prog, image } = this;
		const c = gl.canvas;

		c.width = image.width;
		c.height = image.height;
		gl.viewport(0, 0, c.width, c.height);

		gl.bindTexture(gl.TEXTURE_2D, this.texture(image));
		this.setGeometry(0, 0, 1, 1);
		gl.useProgram(prog);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.enableVertexAttribArray(this.positionLocation);
		gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
		gl.enableVertexAttribArray(this.texcoordLocation);
		gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);

		gl.uniform1i(this.textureLocation, 0);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
}

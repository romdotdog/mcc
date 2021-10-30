import frag from "../shaders/plane.frag";
import vert from "../shaders/plane.vert";

import M4 from "./M4";
import Texture from "./Texture";

export default class Session {
	private prog: WebGLProgram;

	private positionLocation: number;
	private texcoordLocation: number;
	private matrixLocation: WebGLUniformLocation;
	private textureLocation: WebGLUniformLocation;
	private positionBuffer: WebGLBuffer;
	private texcoordBuffer: WebGLBuffer;

	constructor(private gl: WebGLRenderingContext) {
		this.prog = this.gl.createProgram();
		this.compileShaders();
		this.initializeBuffers();
	}

	private initializeBuffers() {
		const { gl, prog } = this;
		this.positionLocation = gl.getAttribLocation(prog, "a_position");
		this.texcoordLocation = gl.getAttribLocation(prog, "a_texcoord");

		this.matrixLocation = gl.getUniformLocation(prog, "u_matrix");
		this.textureLocation = gl.getUniformLocation(prog, "u_texture");

		this.positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

		{
			var positions = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
		}

		this.texcoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);

		{
			var texcoords = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
		}
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

	render(img: Texture) {
		if (img.initialized === false) throw "Attempt to draw uninitialized texture";

		const { gl, prog } = this;
		const c = gl.canvas;

		c.width = img.width;
		c.height = img.height;
		gl.viewport(0, 0, c.width, c.height);

		gl.bindTexture(gl.TEXTURE_2D, img.texture);
		gl.useProgram(prog);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.enableVertexAttribArray(this.positionLocation);
		gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
		gl.enableVertexAttribArray(this.texcoordLocation);
		gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);

		const matrix = M4.orthographic(0, img.width, img.height, 0, -1, 1);
		matrix.scale(img.width, img.height, 1);

		gl.uniformMatrix4fv(this.matrixLocation, false, matrix.inner);
		gl.uniform1i(this.textureLocation, 0);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
}

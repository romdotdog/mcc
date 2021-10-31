import * as Geometry from "./Geometry";

const identityM3 = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

export default class TextureRenderer {
	prog: WebGLProgram;

	private gl: WebGLRenderingContext;

	private positionLocation: number;
	private texcoordLocation: number;
	private textureLocation: WebGLUniformLocation;
	private matrixLocation: WebGLUniformLocation;
	private positionBuffer: WebGLBuffer;
	private texcoordBuffer: WebGLBuffer;

	constructor(gl: WebGLRenderingContext, frag: WebGLShader, vert: WebGLShader, geometry: Float32Array) {
		this.gl = gl; // bug

		this.prog = gl.createProgram();
		gl.attachShader(this.prog, frag);
		gl.attachShader(this.prog, vert);

		gl.linkProgram(this.prog);

		if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
			console.log("Error linking shader program:");
			console.log(gl.getProgramInfoLog(this.prog));
		}

		this.assignBuffers(geometry);
	}

	private assignBuffers(geometry: Float32Array) {
		const { gl, prog } = this;
		this.positionLocation = gl.getAttribLocation(prog, "a_position");
		this.texcoordLocation = gl.getAttribLocation(prog, "a_texcoord");

		this.textureLocation = gl.getUniformLocation(prog, "u_texture");
		this.matrixLocation = gl.getUniformLocation(prog, "u_matrix");

		this.texcoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, Geometry.identity, gl.STATIC_DRAW);

		this.positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, geometry, gl.STATIC_DRAW);
	}

	render(t: WebGLTexture, matrix: Float32Array = identityM3) {
		const { gl, prog } = this;
		gl.bindTexture(gl.TEXTURE_2D, t);
		gl.useProgram(prog);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.enableVertexAttribArray(this.positionLocation);
		gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
		gl.enableVertexAttribArray(this.texcoordLocation);
		gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);

		gl.uniformMatrix3fv(this.matrixLocation, false, matrix);
		gl.uniform1i(this.textureLocation, 0);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
}

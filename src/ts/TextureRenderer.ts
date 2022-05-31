import * as Geometry from "./Geometry";

import frag from "../shaders/plane.frag";
import vert from "../shaders/plane.vert";
import Renderer from "./Renderer";

const identityM3 = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

export default class TextureRenderer extends Renderer {
	protected matrixLocation: WebGLUniformLocation;

	constructor(gl: WebGLRenderingContext, geometry: Float32Array) {
		super(gl, frag, vert);
		this.assignBuffers(Geometry.identity, geometry);
	}

	protected assignBuffers(texcoord: Float32Array, position: Float32Array) {
		super.assignBuffers(texcoord, position);
		this.matrixLocation = this.gl.getUniformLocation(this.prog, "u_matrix");
	}

	render(t: WebGLTexture, matrix: Float32Array = identityM3) {
		const { gl, prog } = this;

		gl.bindTexture(gl.TEXTURE_2D, t);
		gl.useProgram(prog);

		this.bind();

		gl.uniformMatrix3fv(this.matrixLocation, false, matrix);
		gl.uniform1i(this.textureLocation, 0);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
}

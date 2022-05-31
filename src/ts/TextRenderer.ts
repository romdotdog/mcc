import * as Geometry from "./Geometry";

import frag from "../shaders/text.frag";
import vert from "../shaders/text.vert";
import outlineFrag from "../shaders/text_outline.frag";

import Renderer from "./Renderer";

export class TextRenderer extends Renderer {
	constructor(gl: WebGLRenderingContext, geometry: Float32Array) {
		super(gl, frag, vert);
		this.assignBuffers(geometry, Geometry.fullSpace);
	}
}

export class TextOutlineRenderer extends Renderer {
	protected offsetXLocation: WebGLUniformLocation;
	protected offsetYLocation: WebGLUniformLocation;

	constructor(gl: WebGLRenderingContext, geometry: Float32Array, protected offsetX: number, protected offsetY: number) {
		super(gl, outlineFrag, vert);
		this.assignBuffers(geometry, Geometry.fullSpace);
	}

	protected assignBuffers(texcoord: Float32Array, position: Float32Array) {
		super.assignBuffers(texcoord, position);

		const { gl, prog } = this;
		this.offsetXLocation = gl.getUniformLocation(prog, "u_offset_x");
		this.offsetYLocation = gl.getUniformLocation(prog, "u_offset_y");
	}

	protected bind() {
		super.bind();

		const gl = this.gl;
		gl.uniform1f(this.offsetXLocation, this.offsetX);
		gl.uniform1f(this.offsetYLocation, this.offsetY);
	}
}

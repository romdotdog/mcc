// adapted from https://webglfundamentals.org/webgl/resources/m4.js

export default class M4 {
	inner: Float32Array;

	constructor() {
		this.inner = new Float32Array(16);
	}

	static orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): M4 {
		const matrix = new M4();
		const dst = matrix.inner;

		dst[0] = 2 / (right - left);
		dst[1] = 0;
		dst[2] = 0;
		dst[3] = 0;
		dst[4] = 0;
		dst[5] = 2 / (top - bottom);
		dst[6] = 0;
		dst[7] = 0;
		dst[8] = 0;
		dst[9] = 0;
		dst[10] = 2 / (near - far);
		dst[11] = 0;
		dst[12] = (left + right) / (left - right);
		dst[13] = (bottom + top) / (bottom - top);
		dst[14] = (near + far) / (near - far);
		dst[15] = 1;

		return matrix;
	}

	scale(sx: number, sy: number, sz: number) {
		const dst = this.inner;

		dst[0] *= sx;
		dst[1] *= sx;
		dst[2] *= sx;
		dst[3] *= sx;
		dst[4] *= sy;
		dst[5] *= sy;
		dst[6] *= sy;
		dst[7] *= sy;
		dst[8] *= sz;
		dst[9] *= sz;
		dst[10] *= sz;
		dst[11] *= sz;
	}
}

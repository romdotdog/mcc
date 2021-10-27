export default class Texture {
	initialized: boolean = false;
	width: number = 0;
	height: number = 0;

	texture: WebGLTexture;

	constructor(gl: WebGLRenderingContext) {
		this.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}

	static fromURL(gl: WebGLRenderingContext, url: string): Promise<Texture> {
		const t = new Texture(gl);

		return new Promise(r => {
			const img = new Image();
			img.onload = function () {
				gl.bindTexture(gl.TEXTURE_2D, t.texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

				t.width = img.width;
				t.height = img.height;
				t.initialized = true;

				r(t);
			};

			img.src = url;
		});
	}
}

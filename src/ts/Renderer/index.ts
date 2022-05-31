export default class Renderer {
    prog: WebGLProgram;

    protected gl: WebGLRenderingContext;

    protected positionLocation: number;
	protected texcoordLocation: number;
	protected textureLocation: WebGLUniformLocation;
	protected positionBuffer: WebGLBuffer;
	protected texcoordBuffer: WebGLBuffer;

    constructor(gl: WebGLRenderingContext, frag: string, vert: string) {
		this.gl = gl; // bug

		this.prog = gl.createProgram();
		gl.attachShader(this.prog, this.compileShader(frag, this.gl.FRAGMENT_SHADER));
		gl.attachShader(this.prog, this.compileShader(vert, this.gl.VERTEX_SHADER));

		gl.linkProgram(this.prog);

		if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
			console.log("Error linking shader program:");
			console.log(gl.getProgramInfoLog(this.prog));
		}
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

    protected assignBuffers(texcoord: Float32Array, position: Float32Array) {
		const { gl, prog } = this;
        this.textureLocation = gl.getUniformLocation(prog, "u_texture");
        this.texcoordLocation = gl.getAttribLocation(prog, "a_texcoord");
        this.positionLocation = gl.getAttribLocation(prog, "a_position");

		this.texcoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, texcoord, gl.STATIC_DRAW);

		this.positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);
	}

    protected bind() {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.enableVertexAttribArray(this.positionLocation);
		gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
		gl.enableVertexAttribArray(this.texcoordLocation);
		gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    }


	render(t: WebGLTexture) {
		const { gl, prog } = this;

        gl.bindTexture(gl.TEXTURE_2D, t);
		gl.useProgram(prog);

        this.bind();

		gl.uniform1i(this.textureLocation, 0);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
}
import frag from "./shaders/plane.frag";
import vert from "./shaders/plane.vert";
import earth from "./img/earth.png";

const c = document.getElementsByTagName("canvas")![0];
const gl = c.getContext("webgl");

if (gl === null) {
	alert("Unable to initialize WebGL.");
	window.close();
}

// create texture

const t = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, t);

gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

const img = new Image();
img.onload = function () {
	gl.bindTexture(gl.TEXTURE_2D, t);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

	draw(t, img);
};

img.src = earth;

// compile shader

function compileShader(src: string, type: number) {
	let shader = gl.createShader(type);

	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log(
			`Error compiling ${
				type === gl.VERTEX_SHADER ? "vertex" : "fragment"
			} shader:`
		);
		console.log(gl.getShaderInfoLog(shader));
	}
	return shader;
}

const prog = gl.createProgram();
gl.attachShader(prog, compileShader(vert, gl.VERTEX_SHADER));
gl.attachShader(prog, compileShader(frag, gl.FRAGMENT_SHADER));

// link shaders

gl.linkProgram(prog);

if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
	console.log("Error linking shader program:");
	console.log(gl.getProgramInfoLog(prog));
}

const positionLocation = gl.getAttribLocation(prog, "a_position");
const texcoordLocation = gl.getAttribLocation(prog, "a_texcoord");

const matrixLocation = gl.getUniformLocation(prog, "u_matrix");
const textureLocation = gl.getUniformLocation(prog, "u_texture");

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

{
	var positions = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}

const texcoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

{
	var texcoords = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
}
// draw

function draw(t: WebGLTexture, img: HTMLImageElement) {
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	gl.bindTexture(gl.TEXTURE_2D, t);
	gl.useProgram(prog);

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
	gl.enableVertexAttribArray(texcoordLocation);
	gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

	let matrix = orthographic(0, img.width, img.height, 0, -1, 1);
	matrix = scale(matrix, img.width, img.height, 1);
	gl.uniformMatrix4fv(matrixLocation, false, matrix);
	gl.uniform1i(textureLocation, 0);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function orthographic(
	left: number,
	right: number,
	bottom: number,
	top: number,
	near: number,
	far: number
) {
	const dst = [];

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

	return dst;
}

function scale(m: number[], sx: number, sy: number, sz: number) {
	const dst = [];

	dst[0] = sx * m[0 * 4 + 0];
	dst[1] = sx * m[0 * 4 + 1];
	dst[2] = sx * m[0 * 4 + 2];
	dst[3] = sx * m[0 * 4 + 3];
	dst[4] = sy * m[1 * 4 + 0];
	dst[5] = sy * m[1 * 4 + 1];
	dst[6] = sy * m[1 * 4 + 2];
	dst[7] = sy * m[1 * 4 + 3];
	dst[8] = sz * m[2 * 4 + 0];
	dst[9] = sz * m[2 * 4 + 1];
	dst[10] = sz * m[2 * 4 + 2];
	dst[11] = sz * m[2 * 4 + 3];

	if (m !== dst) {
		dst[12] = m[12];
		dst[13] = m[13];
		dst[14] = m[14];
		dst[15] = m[15];
	}

	return dst;
}

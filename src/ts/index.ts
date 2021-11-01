import Session from "./Session";
import { decompressFrames, ParsedFrame, parseGIF } from "gifuct-js";
import earth from "../img/earth.gif";

const c = document.getElementsByTagName("canvas")![0];
const gl = c.getContext("webgl", { preserveDrawingBuffer: true });

Promise.all([
	fetch(earth)
		.then(resp => resp.arrayBuffer())
		.then(buff => parseGIF(buff)),
	document.fonts.load("128px Futura")
]).then(([gif]) => {
	const { width, height } = gif.lsd;
	const sess = new Session(gl, "lmao", width, height);
	sess.renderText();

	const frames = decompressFrames(gif, true).map<[ParsedFrame, ImageData]>(f => [
		f,
		new ImageData(f.patch, f.dims.width, f.dims.height)
	]);

	// create base matrix
	const base = new Float32Array(9);
	base[0] = 1 / width;
	base[4] = 1 / height;
	base[8] = 1;

	console.log(base);

	const l = frames.length;
	let i = 0;
	function renderFrame() {
		const [frame, img] = frames[i];

		// translate base matrix
		const mat = base.slice(0);
		const { width: sx, height: sy, left: tx, top: ty } = frame.dims;

		mat[6] = mat[0] * (sx + tx * 2) - 1;
		mat[7] = 1 - mat[4] * (sy + ty * 2);

		mat[0] *= sx;
		mat[1] *= sx;
		mat[2] *= sx;

		mat[3] *= sy;
		mat[4] *= sy;
		mat[5] *= sy;

		sess.render(sess.texture(img), mat);
		i = ++i % l;

		setTimeout(renderFrame, frame.delay);
	}

	requestAnimationFrame(renderFrame);
});

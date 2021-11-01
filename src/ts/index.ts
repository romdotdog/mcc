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

	const mat = new Float32Array(9);

	const l = frames.length;
	let i = 0;
	function renderFrame() {
		const [frame, img] = frames[i];

		// calculate

		const { width: sx, height: sy, left: tx, top: ty } = frame.dims;

		mat[0] = sx / width;
		mat[4] = sy / height;

		mat[6] = (sx + tx * 2) / width - 1;
		mat[7] = 1 - (sy + ty * 2) / height;

		sess.render(sess.texture(img), mat);
		i = ++i % l;

		requestAnimationFrame(renderFrame);
	}

	requestAnimationFrame(renderFrame);
});

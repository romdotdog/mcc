import Session from "./Session";
import { decompressFrames, ParsedFrame, parseGIF } from "gifuct-js";
import earth from "../img/house-explosion.gif";
import Impact from "./Impact";
import Futura from "./Futura";

const c = document.getElementsByTagName("canvas")![0];
const gl = c.getContext("webgl", { preserveDrawingBuffer: true });

Promise.all([
	fetch(earth)
		.then(resp => resp.arrayBuffer())
		.then(buff => parseGIF(buff)),
	document.fonts.load("128px Futura")
]).then(([gif]) => {
	const { width, height } = gif.lsd;
	const sess = new Impact(gl, width, height, "lmao owned");

	const frames = decompressFrames(gif, true).map<[ParsedFrame, WebGLTexture]>(f => [
		f,
		sess.texture(new ImageData(f.patch, f.dims.width, f.dims.height))
	]);

	const mat = new Float32Array(9);

	const l = frames.length;
	let i = 0;
	function renderFrame(disposalType: number) {
		sess.dispose(disposalType);
		const [frame, texture] = frames[i];

		// calculate

		const { width: sx, height: sy, left: tx, top: ty } = frame.dims;

		mat[0] = sx / width;
		mat[4] = sy / height;

		mat[6] = (sx + tx * 2) / width - 1;
		mat[7] = 1 - (sy + ty * 2) / height;

		sess.render(texture, mat);
		i = ++i % l;

		requestAnimationFrame(() => renderFrame(frame.disposalType));
	}

	requestAnimationFrame(() => renderFrame(0));
});

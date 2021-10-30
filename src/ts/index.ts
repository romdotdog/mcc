import Session from "./Session";
import Texture from "./Texture";
import Rasterizer from "./Rasterizer";

import earth from "../img/earth.png";

const c = document.getElementsByTagName("canvas")![0];
const gl = c.getContext("webgl");

const img = new Image();
img.onload = function () {
	const sess = new Session(gl, img);
	sess.render();
};

img.src = earth;

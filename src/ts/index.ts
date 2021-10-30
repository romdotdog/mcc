import Session from "./Session";
import earth from "../img/earth.png";

const c = document.getElementsByTagName("canvas")![0];
const gl = c.getContext("webgl");

const img = new Image();
img.onload = function () {
	setTimeout(() => {
		const sess = new Session(gl, img, "lmao");
		sess.renderText();
		sess.render();
	}, 500);
};

img.src = earth;

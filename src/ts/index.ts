import Session from "./Session";
import earth from "../img/earth.png";

const c = document.getElementsByTagName("canvas")![0];
const gl = c.getContext("webgl", {
	premultipliedAlpha: false
});

const img = new Image();
img.onload = function () {
	setTimeout(() => {
		const sess = new Session(gl, "lmao", img.width, img.height);
		sess.renderText();
		sess.render(sess.texture(img));
	}, 500);
};

img.src = earth;

import Session from "./Session";
import Texture from "./Texture";
import Rasterizer from "./Rasterizer";

import earth from "./img/earth.png";

const c = document.getElementsByTagName("canvas")![0];
const gl = c.getContext("webgl");
const sess = new Session(gl);
const rast = new Rasterizer();

setTimeout(() => {
	const l = rast.rasterize("🗿🗿🗿🗿 lmaoooooooooo", 500, "72px Futura", "center");
	console.log(l);

	Texture.fromURL(gl, l).then(tex => sess.render(tex));
}, 500);
